use std::collections::HashMap;

use color_eyre::Result;
use pest::iterators::{Pair, Pairs};

use crate::assembler::lexer::{lex, Rule};
use crate::bytecode_interpreter::run::{
    Arithmetic, Conditional, FromStore, ToStore, ARITHMETIC_PREFIX, CONDITIONAL_PREFIX,
    LITERAL_PREFIX, MOVE_PREFIX,
};
use crate::eyre;

#[derive(Debug)]
pub struct SuccessfulParse {
    pub(crate) input: Vec<u8>,
    pub(crate) program: Vec<u8>,
}

impl SuccessfulParse {
    fn from(input: Vec<u8>, program: Vec<u8>) -> Self {
        Self { input, program }
    }
}

pub fn parse(program: &str) -> Result<SuccessfulParse> {
    let file: Pair<Rule> = lex(program)?;
    let mut instructions = Vec::new();
    let tree = file.into_inner();
    let (macros, tree) = parse_macros(tree);
    let (input, mut tree) = parse_input(tree);
    let program = tree.next().unwrap().into_inner();
    let label_positions = find_labels(program.clone());
    for node in program {
        match node.as_rule() {
            Rule::action => {
                let node = node.into_inner().next().unwrap();
                match node.as_rule() {
                    Rule::instruction => {
                        let parsed = parse_instruction(node.into_inner().next().unwrap());
                        instructions.push(parsed);
                    }
                    Rule::label => (),
                    Rule::jump_to_label => {
                        let val = *label_positions.get(node.as_str().trim()).unwrap();
                        if val > 63 {
                            return Err(eyre!("You tried to use a label with a value greater than 63 which is not supported."));
                        }
                        instructions.push((LITERAL_PREFIX << 6) | val);
                    }
                    _ => unreachable!(),
                }
            }
            Rule::EOI => (),
            _ => unreachable!(),
        }
    }
    Ok(SuccessfulParse::from(input, instructions))
}

type LabelPositions<'a> = HashMap<&'a str, u8>;

fn find_labels(tree: Pairs<Rule>) -> LabelPositions {
    let mut positions = HashMap::new();
    let mut number_of_instructions = 0;
    for node in tree {
        match node.as_rule() {
            Rule::action => {
                let node = node.into_inner().next().unwrap();
                match node.as_rule() {
                    Rule::label => {
                        let ident = node.into_inner().next().unwrap();
                        let as_str = ident.as_str().trim();
                        positions.insert(as_str, number_of_instructions);
                    }
                    Rule::instruction => number_of_instructions += 1,
                    Rule::jump_to_label => number_of_instructions += 1,
                    _ => unreachable!(),
                }
            }
            Rule::EOI => (),
            _ => {
                println!("{:?}", node.as_rule());
                println!("BAD NODE!");
                unreachable!()
            }
        }
    }
    positions
}

fn parse_input(mut tree: Pairs<Rule>) -> (Vec<u8>, Pairs<Rule>) {
    let mut input = Vec::new();
    if tree.peek().unwrap().as_rule() == Rule::inputs {
        let mut inputs = tree.next().unwrap().into_inner();
        loop {
            let next = inputs.next();
            if next == None {
                break;
            }
            let next = next.unwrap();
            if next.as_rule() != Rule::input_byte {
                break;
            }
            let inner = next.into_inner().next().unwrap();
            input.push(match inner.as_rule() {
                Rule::char_input => {
                    let as_str = inner.as_str().trim();
                    let l = as_str.len();
                    let char = &as_str[1..l].chars().next().unwrap();
                    *char as u32 as u8
                }
                Rule::dec_input => {
                    let as_str = inner.as_str().trim();
                    as_str.parse::<u8>().unwrap()
                }
                Rule::bin_input => {
                    let as_str = inner.as_str().trim();
                    let without_prefix = &as_str[2..];
                    u8::from_str_radix(without_prefix, 2).unwrap()
                }
                Rule::hex_input => {
                    let as_str = inner.as_str().trim();
                    let without_prefix = &as_str[2..];
                    u8::from_str_radix(without_prefix, 16).unwrap()
                }
                _ => unreachable!(),
            })
        }
    };
    (input, tree)
}

type Macros<'a> = HashMap<&'a str, Pair<'a, Rule>>;
fn parse_macros(mut tree: Pairs<Rule>) -> (Macros, Pairs<Rule>) {
    let mut macros = HashMap::new();
    if tree.peek().unwrap().as_rule() == Rule::macros {
        let mut macro_tokens = tree.next().unwrap().into_inner();
        loop {
            let next = macro_tokens.next();
            if next == None {
                break;
            }
            let next = next.unwrap();
            if next.as_rule() != Rule::macro_def {
                break;
            }
            let ident = next.clone().into_inner().next().unwrap().as_str().trim();
            macros.insert(ident, next);
        }
    };
    (macros, tree)
}

fn parse_instruction(instruction: Pair<Rule>) -> u8 {
    match instruction.as_rule() {
        Rule::literal => {
            let literal_type = instruction.into_inner().next().unwrap();
            match literal_type.as_rule() {
                Rule::dec_literal => {
                    let as_str = literal_type.as_str().trim();
                    LITERAL_PREFIX << 6 | as_str.parse::<u8>().unwrap()
                }
                Rule::bin_literal => {
                    let as_str = literal_type.as_str().trim();
                    let without_prefix = &as_str[2..];
                    LITERAL_PREFIX << 6 | u8::from_str_radix(without_prefix, 2).unwrap()
                }
                Rule::hex_literal => {
                    let as_str = literal_type.as_str().trim();
                    let without_prefix = &as_str[2..];
                    LITERAL_PREFIX << 6 | u8::from_str_radix(without_prefix, 16).unwrap()
                }
                _ => unreachable!(),
            }
        }
        Rule::nop => CONDITIONAL_PREFIX << 6 | Conditional::NOP,
        Rule::j => CONDITIONAL_PREFIX << 6 | Conditional::JMP,
        Rule::jez => CONDITIONAL_PREFIX << 6 | Conditional::JEZ,
        Rule::jnz => CONDITIONAL_PREFIX << 6 | Conditional::JNZ,
        Rule::jgez => CONDITIONAL_PREFIX << 6 | Conditional::JGEZ,
        Rule::jgz => CONDITIONAL_PREFIX << 6 | Conditional::JGZ,
        Rule::jlez => CONDITIONAL_PREFIX << 6 | Conditional::JLEZ,
        Rule::jlz => CONDITIONAL_PREFIX << 6 | Conditional::JLZ,

        Rule::add => ARITHMETIC_PREFIX << 6 | Arithmetic::ADD,
        Rule::sub => ARITHMETIC_PREFIX << 6 | Arithmetic::SUB,
        Rule::or => ARITHMETIC_PREFIX << 6 | Arithmetic::OR,
        Rule::nor => ARITHMETIC_PREFIX << 6 | Arithmetic::NOR,
        Rule::xor => ARITHMETIC_PREFIX << 6 | Arithmetic::XOR,
        Rule::xnor => ARITHMETIC_PREFIX << 6 | Arithmetic::XNOR,
        Rule::and => ARITHMETIC_PREFIX << 6 | Arithmetic::AND,
        Rule::nand => ARITHMETIC_PREFIX << 6 | Arithmetic::NAND,

        Rule::mov => {
            let mut inner = instruction.into_inner();
            let from = inner.next().unwrap().as_str().trim();
            let to = inner.next().unwrap().as_str().trim();
            let from_bin = if from.eq_ignore_ascii_case("input")
                || from.eq_ignore_ascii_case("i")
                || from.eq_ignore_ascii_case("in")
            {
                FromStore::IN
            } else {
                let from = from.strip_prefix("reg").unwrap_or(from);
                from.parse().unwrap()
            };
            let to_bin = if to.eq_ignore_ascii_case("output")
                || to.eq_ignore_ascii_case("o")
                || to.eq_ignore_ascii_case("out")
            {
                ToStore::OUT
            } else {
                let to = to.strip_prefix("reg").unwrap_or(to);
                to.parse().unwrap()
            };

            (MOVE_PREFIX << 6) | (from_bin << 3) | to_bin
        }

        _ => unreachable!(),
    }
}

//add = {WHITE_SPACE* ~ ^"add" ~ end_of_line}
// sub = {WHITE_SPACE* ~ ^"sub" ~ end_of_line}
// or = {WHITE_SPACE* ~ ^"or" ~ end_of_line}
// nor = {WHITE_SPACE* ~ ^"nor" ~ end_of_line}
// xor = {WHITE_SPACE* ~ ^"xor" ~ end_of_line}
// xnor = {WHITE_SPACE* ~ ^"xnor" ~ end_of_line}
// and = {WHITE_SPACE* ~ ^"and" ~ end_of_line}
// nand = {WHITE_SPACE* ~ ^"nand" ~ end_of_line}
#[cfg(test)]
mod tests {
    use pest::iterators::Pair;

    use crate::assembler::lexer::lex;
    use crate::assembler::parser::parse;
    use crate::Result;

    use super::Rule;

    fn print_ast(program: &str) -> Result<()> {
        let file: Pair<Rule> = lex(program)?;
        println!("{:#?}", file.into_inner());
        Ok(())
    }

    #[test]
    fn dummy_test() -> Result<()> {
        let s = r#"
            program:
            reset_to_zero
            j
            
            label loop:
            mov 3 output
            mov 3 1
            add
            10
            mov 0 output
            58
            mov 0 2
            sub
            reset_to_zero
            jez
            1
            mov 0 2
            loop
            j
            label reset_to_zero:
            48
            mov 0 1
            mov 0 3
            1
            mov 0 2
            loop
            j
            "#;
        print_ast(s);
        let r = parse(s)?;
        println!("input: {:#?}, program: {:#?}", r.input, r.program);
        // Panic to see print output.
        panic!()
    }
}
