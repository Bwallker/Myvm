use color_eyre::Result;
use pest::iterators::{Pair, Pairs};
use pest::Parser;
use pest_derive::Parser;

use crate::bytecode_interpreter::run::{
    Arithmetic, Conditional, FromStore, ToStore, ARITHMETIC_PREFIX, CONDITIONAL_PREFIX,
    LITERAL_PREFIX, MOVE_PREFIX,
};

#[derive(Parser)]
#[grammar = "./assembler/grammar.pest"] // relative to src
struct Grammar;

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
    let pairs: Pairs<Rule> = Grammar::parse(Rule::program, program).unwrap();
    let program = pairs.into_iter().next().unwrap();
    let mut input: Vec<u8> = Vec::new();
    let mut instructions = Vec::new();
    let mut inside = program.into_inner();
    if inside.peek().unwrap().as_rule() == Rule::input {
        inside.next();
        loop {
            let next = inside.peek().unwrap();
            if next.as_rule() != Rule::input_byte {
                break;
            }
            inside.next();
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
    }
    assert_eq!(inside.next().unwrap().as_rule(), Rule::start_of_program);
    for instruction in inside {
        match instruction.as_rule() {
            Rule::instruction => {
                let c = instruction.clone();
                let parsed = parse_instruction(instruction.into_inner().next().unwrap());
                instructions.push(parsed);
            }
            Rule::EOI => (),
            _ => unreachable!(),
        }
    }
    Ok(SuccessfulParse::from(input, instructions))
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
    use crate::Result;

    use super::{Grammar, Pairs, Parser, Rule};

    fn print_ast(program: &str) {
        let pairs: Pairs<Rule> = Grammar::parse(Rule::program, program).unwrap();
        println!("{:?}", pairs.into_iter());
    }

    #[test]
    fn dummy_test() -> Result<()> {
        print_ast("program:\n");
        panic!()
    }
}
