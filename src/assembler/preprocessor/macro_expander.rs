use std::collections::HashMap;
use color_eyre::Result;
use pest::iterators::{Pair, Pairs};
use crate::assembler::lexer::lex;
use crate::assembler::lexer::Rule;
use crate::eyre;
use aho_corasick::{AhoCorasickBuilder, MatchKind};

pub fn expand_macros(input: &str) -> Result<String> {
	let file = lex(input)?;
	let mut expanded = String::new();
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
	let macros = parse_macros(actions.clone());
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
							return Err(eyre!("Tried to call macro \"{ident}\" that does not exist."));
						}
						let mut macro_def = macro_def.unwrap().clone().into_inner();
						let macro_args = macro_def.next().unwrap().into_inner().nth(1).unwrap().into_inner();
						let args = contents.next().unwrap().into_inner();
						let expected_number_of_arguments = macro_args.clone().count();
						let provided_number_of_arguments = args.clone().count();
						if expected_number_of_arguments != provided_number_of_arguments {
							return Err(eyre!("Macro {ident} expects {expected_number_of_arguments} arguments but received {provided_number_of_arguments}"));
						}
						let macro_body = macro_def.next().unwrap().as_str();
						let pats: Vec<&str> = macro_args.map(|marg| marg.as_str()).collect();
						let reps: Vec<&str> = args.map(|arg| arg.as_str()).collect();
						let ac = AhoCorasickBuilder::new()
							.match_kind(MatchKind::LeftmostFirst)
							.auto_configure(&pats)
							.build(&pats);
						let macro_body = ac.replace_all(macro_body, &reps);
						expanded.push_str(macro_body.as_str());
					},
					Rule::full_macro => (),
					_ => expanded.push_str(node.as_str()),
				}
			}
			Rule::EOI => (),
			_ => unreachable!(),
		}
	}
	Ok(expanded)

}

type Macros<'a> = HashMap<&'a str, Pair<'a, Rule>>;
fn parse_macros(actions: Pairs<Rule>) -> Macros {
	let mut macros = HashMap::new();
	for action in actions {
		match action.as_rule() {
			Rule::action => {
				let node = action.into_inner().next().unwrap();
				match node.as_rule() {
					Rule::full_macro => {
						let ident = node.clone().into_inner().next().unwrap().into_inner().next().unwrap().as_str().trim();
						macros.insert(ident, node);
					},
					_ => (),
				}
			}
			Rule::EOI => (),
			_ => unreachable!(),
		}
	}
	macros
}