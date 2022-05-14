use color_eyre::eyre::{eyre, Result};
use std::fs::File;
use std::hint::unreachable_unchecked;
use std::io::{Read, Stdin, Stdout, Write};

macro_rules! unreachable_unsafe {
    () => {{
        if cfg!(debug_assertions) {
            unreachable!();
        };
        unreachable_unchecked();
    }};
}
#[allow(dead_code)]
pub const LITERAL_PREFIX: u8 = 0;
#[allow(dead_code)]
pub const CONDITIONAL_PREFIX: u8 = 1;
#[allow(dead_code)]
pub const MOVE_PREFIX: u8 = 2;
#[allow(dead_code)]
pub const ARITHMETIC_PREFIX: u8 = 3;

#[allow(dead_code)]
pub struct InstructionType;

impl InstructionType {
    pub const LOAD_LITERAL: u8 = 0 << 6;
    pub const CONDITIONAL: u8 = 1 << 6;
    pub const MOVE: u8 = 2 << 6;
    pub const ARITHMETIC: u8 = 3 << 6;
}

pub struct FromStore;

#[allow(dead_code)]
impl FromStore {
    pub const REG0: u8 = 0;
    pub const REG1: u8 = 1;
    pub const REG2: u8 = 2;
    pub const REG3: u8 = 3;
    pub const REG4: u8 = 4;
    pub const REG5: u8 = 5;
    pub const IN: u8 = 6;
    pub const UNKNOWN: u8 = 7;
}

pub struct ToStore;

#[allow(dead_code)]
impl ToStore {
    pub const REG0: u8 = 0;
    pub const REG1: u8 = 1;
    pub const REG2: u8 = 2;
    pub const REG3: u8 = 3;
    pub const REG4: u8 = 4;
    pub const REG5: u8 = 5;
    pub const OUT: u8 = 6;
    pub const UNKNOWN: u8 = 7;
}

pub struct Arithmetic;

#[allow(dead_code)]
impl Arithmetic {
    pub const ADD: u8 = 0b_000;
    pub const SUB: u8 = 0b_100;
    pub const AND: u8 = 0b_001;
    pub const NAND: u8 = 0b_101;
    pub const OR: u8 = 0b_010;
    pub const NOR: u8 = 0b_110;
    pub const XOR: u8 = 0b_011;
    pub const XNOR: u8 = 0b_111;
}

pub struct Conditional;

#[allow(dead_code)]
impl Conditional {
    pub const NOP: u8 = 0b_000;
    pub const JMP: u8 = 0b_100;
    pub const JEZ: u8 = 0b_001;
    pub const JNZ: u8 = 0b_101;
    pub const JGZ: u8 = 0b_010;
    pub const JLEZ: u8 = 0b_110;
    pub const JGEZ: u8 = 0b_011;
    pub const JLZ: u8 = 0b_111;
}
#[allow(clippy::upper_case_acronyms, dead_code)]
pub enum Output<'a> {
    STDOUT(Stdout),
    FILE(File),
    ARRAY(&'a mut [u8]),
}

impl Write for Output<'_> {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        match self {
            Self::STDOUT(s) => s.write(buf),
            Self::FILE(f) => f.write(buf),
            Self::ARRAY(a) => a.write(buf),
        }
    }

    fn flush(&mut self) -> std::io::Result<()> {
        match self {
            Self::STDOUT(s) => s.flush(),
            Self::FILE(f) => f.flush(),
            Self::ARRAY(a) => a.flush(),
        }
    }
}
#[allow(clippy::upper_case_acronyms)]
pub enum Input<'a> {
    STDIN(Stdin),
    FILE(File),
    ARRAY(&'a [u8]),
}

impl Read for Input<'_> {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        match self {
            Self::STDIN(s) => s.read(buf),
            Self::FILE(f) => f.read(buf),
            Self::ARRAY(a) => a.read(buf),
        }
    }
}

impl Input<'_> {
    fn next(&mut self) -> Result<u8> {
        let mut buf = [0u8; 1];
        let read = self.read(&mut buf)?;
        if read == 0 {
            Err(eyre!(
                "There were not enough bytes in input to satisfy the program."
            ))
        } else {
            Ok(buf[0])
        }
    }
}

macro_rules! increment_pc {
    ($pc: ident) => {{
        let new_val = $pc.checked_add(1);
        if new_val == None {
            return Ok(());
        }
        $pc = new_val.unwrap();
    }};
}

/// This program is an implementation of an emulator for a custom CPU architecture. It is loosely based on the OVERTURE architecture from the Turing Complete programming video game.
pub fn interpret(program: &[u8], mut input: Input, mut output: Output) -> Result<()> {
    assert!(
        program.len() < 256,
        "Programs cannot currently be longer 255 bytes."
    );
    let mut registers = [0u8; 6];
    let mut pc = 0u8;
    loop {
        // The first two bits in an instructions tells us the instructions type:
        // 00 - LOAD LITERAL
        // 01 - CONDITIONAL
        // 10 - MOVE
        // 11 - ARITHMETIC
        let current_instruction = match program.get(pc as usize) {
            Some(v) => *v,
            None => return Ok(()),
        };
        // Isolate instruction type:
        let instruction_type = 0b_11_00_00_00 & current_instruction;
        let body = 0b_00_11_11_11 & current_instruction;
        match instruction_type {
            InstructionType::ARITHMETIC => {
                let reg1 = registers[1];
                let reg2 = registers[2];

                let reg3 = match body {
                    Arithmetic::ADD => reg1.wrapping_add(reg2),
                    Arithmetic::SUB => reg1.wrapping_sub(reg2),
                    Arithmetic::AND => reg1 & reg2,
                    Arithmetic::NAND => !(reg1 & reg2),
                    Arithmetic::OR => reg1 | reg2,
                    Arithmetic::NOR => !(reg1 | reg2),
                    Arithmetic::XOR => reg1 ^ reg2,
                    Arithmetic::XNOR => !(reg1 ^ reg2),
                    _ => return Err(eyre!("Bad arithmetic instruction at instruction number {pc}. Instruction should be of the form: 0b_00_000_xxx. IE the middle three bits should be 0 but in this case they were not. The bad instruction was {current_instruction:#010b}")),
                };
                registers[3] = reg3;
                increment_pc!(pc);
                continue;
            }
            InstructionType::CONDITIONAL => {
                let reg3 = registers[3] as i8;
                let should_jump = match body {
                    Conditional::NOP => false,
                    Conditional::JMP => true,
                    Conditional::JEZ => reg3 == 0,
                    Conditional::JNZ => reg3 != 0,
                    Conditional::JGZ => reg3 > 0,
                    Conditional::JLEZ => reg3 <= 0,
                    Conditional::JGEZ => reg3 >= 0,
                    Conditional::JLZ => reg3 < 0,
                    _ => return Err(eyre!("Bad conditional instruction at instruction number {pc}. Instruction should be of the form: 0b_01_000_xxx. IE the middle three bits should be 0 but in this case they were not. The bad instruction was {current_instruction:#010b}")),
                };
                if should_jump {
                    pc = registers[0];
                } else {
                    increment_pc!(pc);
                }
                continue;
            }
            InstructionType::MOVE => {
                // Imagine the instruction looks like this:
                // 00 000 111
                // Here 00 is the instruction type, 000 is the register we are copying from and 111 is the target
                let from = (current_instruction & 0b_00_111_000) >> 3;
                let to = current_instruction & 0b_00_000_111;
                let from_target = match from {
                    FromStore::REG0..=FromStore::REG5 => registers[from as usize],
                    FromStore::IN => input.next()?,
                    FromStore::UNKNOWN => {
                        return Err(eyre!("0b111 is not a valid source for moving! Error occurred at instruction number {pc}"));
                    }
                    _ => unsafe { unreachable_unchecked() },
                };

                match to {
                    ToStore::REG0..=ToStore::REG5 => registers[to as usize] = from_target,
                    ToStore::OUT => {
                        let _ = output.write(&[from_target])?;
                    }
                    ToStore::UNKNOWN => {
                        return Err(eyre!(
                            "0b111 is not a valid target for moving! Error occurred at instruction number {pc}"
                        ));
                    }
                    _ => unsafe { unreachable_unchecked() },
                };
                increment_pc!(pc);
                continue;
            }
            InstructionType::LOAD_LITERAL => {
                registers[0] = body;
                increment_pc!(pc);
                continue;
            }
            _ => unsafe { unreachable_unsafe!() },
        }
    }
}
