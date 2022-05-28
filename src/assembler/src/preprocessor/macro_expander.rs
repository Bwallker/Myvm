use std::collections::HashMap;

use aho_corasick::{AhoCorasickBuilder, MatchKind};
use color_eyre::eyre::eyre;
use color_eyre::Result;
use pest::iterators::{Pair, Pairs};

use crate::lexer::lex;
use crate::lexer::Rule;


const MAX_DEPTH: u32 = 100;


fn expand_macros_recurse(input: &str, expanded: &mut String) -> Option<Result<()>> {
	expanded.clear();
	let file = lex(&input);
	if let Err(e) = file {
		return Some(Err(e));
	}
	let file = file.unwrap();
	let mut tree = file.into_inner();
	let inputs = tree.next().unwrap();
	assert_eq!(inputs.as_rule(), Rule::inputs);
	expanded.push_str(inputs.as_str());
	let program = tree.next().unwrap();
	assert_eq!(program.as_rule(), Rule::program);

	let mut actions = program.into_inner();
	let start_of_program = actions.next().unwrap();
	assert_eq!(start_of_program.as_rule(), Rule::start_of_program);
	expanded.push_str(start_of_program.as_str());
	let (macros, constants) = parse_macros_and_constants(actions.clone());
	let mut number_of_macro_calls_or_constants = 0u32;
	for action in actions {
		match action.as_rule() {
			Rule::action => {
				let node = action.into_inner().next().unwrap();
				match node.as_rule() {
					Rule::macro_call => {
						let mut contents = node.into_inner();
						let ident = contents.next().unwrap().as_str().trim();
						let macro_def = macros.get(ident);
						if macro_def == None {
							return Some(Err(eyre!(
                                "Tried to call macro \"{ident}\" that does not exist."
                            )));
						}
						let mut macro_def = macro_def.unwrap().clone().into_inner();
						let macro_args = macro_def.next().unwrap().into_inner().nth(1).unwrap().into_inner();
						let args = contents.next().unwrap().into_inner();
						let expected_number_of_arguments = macro_args.clone().filter(|x| !x.as_str().trim().is_empty()).count();
						let provided_number_of_arguments = args.clone().filter(|x| !x.as_str().trim().is_empty()).count();
						if expected_number_of_arguments != provided_number_of_arguments {
							return Some(Err(eyre!("Macro {ident} expects {expected_number_of_arguments} arguments but received {provided_number_of_arguments}")));
						}

						let macro_body = macro_def.next().unwrap().as_str();

						if expected_number_of_arguments != 0 {
							let pats: Vec<&str> = macro_args.map(|marg| marg.as_str()).collect();
							let reps: Vec<&str> = args.map(|arg| arg.as_str()).collect();
							let ac = AhoCorasickBuilder::new().match_kind(MatchKind::LeftmostFirst).auto_configure(&pats).build(&pats);
							let macro_body = ac.replace_all(macro_body, &reps);
							expanded.push_str(macro_body.as_str());
						} else {
							expanded.push_str(macro_body);
						};

						number_of_macro_calls_or_constants += 1;
					}
					Rule::use_label_or_const => {
						let ident = node.clone().into_inner().next().unwrap().as_str().trim();
						let body = constants.get(ident);
						if body == None {
							expanded.push_str(node.as_str());
							continue;
						}
						let body = body.unwrap().clone().into_inner().nth(1).unwrap().as_str();
						expanded.push_str(body);
						number_of_macro_calls_or_constants += 1
					}
					_ => expanded.push_str(node.as_str()),
				}
			}
			Rule::EOI => (),
			_ => unreachable!(),
		}
	}
	if number_of_macro_calls_or_constants == 0 {
		return None;
	}
	Some(Ok(()))
}


pub fn expand_macros(mut input: &str) -> Result<String> {
	let mut expanded = String::with_capacity((input.len() * 3) / 2);
	let mut input_s = String::new();
	for i in 0u32.. {
		if i == MAX_DEPTH {
			return Err(eyre!("Max recursion expansion limit reached! Having more than {MAX_DEPTH} nested macros is not allowed."));
		}
		let round = expand_macros_recurse(input, &mut expanded);
		if let None = round {
			return Ok(expanded);
		}
		round.unwrap()?;
		input_s.reserve((expanded.len() * 3) / 2);
		std::mem::swap(&mut input_s, &mut expanded);
		let i = input_s.as_str();
		// Safety: unsafe hack to get around a borrow checker byg.
		// Was originally input = &input_s
		// However the borrow checker does not like this, and it is not smart enough to see that input is always assigned to a valid input_s before it is used.
		// The borrow is invalidated when input_s grows, but is revalidate when it is swapped with expanded.
		let p = unsafe { std::slice::from_raw_parts(i.as_bytes().as_ptr(), i.as_bytes().len()) };
		input = unsafe { std::str::from_utf8_unchecked(p) };
	}
	unreachable!()
}


type Macros<'a> = HashMap<&'a str, Pair<'a, Rule>>;
type Constants<'a> = HashMap<&'a str, Pair<'a, Rule>>;


fn parse_macros_and_constants(actions: Pairs<Rule>) -> (Macros, Constants) {
	let mut macros = HashMap::new();
	let mut constants = HashMap::new();
	for action in actions {
		match action.as_rule() {
			Rule::action => {
				let node = action.into_inner().next().unwrap();
				match node.as_rule() {
					Rule::full_macro => {
						let ident = node.clone().into_inner().next().unwrap().into_inner().next().unwrap().as_str().trim();
						macros.insert(ident, node);
					}
					Rule::constant => {
						let ident = node.clone().into_inner().next().unwrap().as_str().trim();
						constants.insert(ident, node);
					}
					_ => (),
				}
			}
			Rule::EOI => (),
			_ => unreachable!(),
		}
	}
	(macros, constants)
}
