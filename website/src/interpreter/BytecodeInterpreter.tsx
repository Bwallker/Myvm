import { Dispatch, SetStateAction } from 'react';

interface Props {
	setReg0: Dispatch<SetStateAction<number>>;
	setReg1: Dispatch<SetStateAction<number>>;
	setReg2: Dispatch<SetStateAction<number>>;
	setReg3: Dispatch<SetStateAction<number>>;
	setReg4: Dispatch<SetStateAction<number>>;
	setReg5: Dispatch<SetStateAction<number>>;
	setPC: Dispatch<SetStateAction<number>>;
	writeToOutput: (newestEntry: number) => void;
	readFromInput: () => number | undefined;
	program: number[];
}

type Registers = [number, number, number, number, number, number];
const BytecodeInterpreter = (props: Props) => {
	if (props.program.length > 255 || props.program.length === 0) {
		throw new Error(
			'Program length must be greater than zero and less than 256. It was ' +
				props.program.length,
		);
	}
	for (const instruction of props.program) {
		if (
			!Number.isInteger(instruction) ||
			instruction < 0 ||
			instruction > 255
		) {
			throw new Error(
				'Every instruction in your program must be an integer between 0 and 255. One instruction was ' +
					instruction,
			);
		}
	}
	const registers: Registers = new Array(6) as Registers;
	for (let i = 0; i < registers.length; i++) {
		registers[i] = 0;
	}
	let pc = 0;
	while (true) {
		console.log(pc);
		props.setReg0(registers[0]);
		props.setReg1(registers[1]);
		props.setReg2(registers[2]);
		props.setReg3(registers[3]);
		props.setReg4(registers[4]);
		props.setReg5(registers[5]);
		props.setPC(pc);
		const instruction = props.program[pc];
		if (instruction === undefined) {
			return <div />;
		}
		switch ((instruction & 0b11_00_00_00) >> 6) {
			case 0b00: {
				const body = instruction & 0b00_111_111;
				registers[0] = body;
				pc++;
				continue;
			}
			case 0b01: {
				if ((instruction & 0b00_111_000) !== 0) {
					throw new Error(
						'Bad conditional instruction! Middle three bits were not zeroed!',
					);
				}
				let should_jump: boolean;
				switch (instruction & 0b00_000_111) {
					case 0b000:
						should_jump = false;
						break;
					case 0b001:
						should_jump = registers[3] === 0;
						break;
					case 0b010:
						should_jump = registers[3] > 0;
						break;
					case 0b011:
						should_jump = registers[3] >= 0;
						break;
					case 0b100:
						should_jump = true;
						break;
					case 0b101:
						should_jump = registers[3] !== 0;
						break;
					case 0b110:
						should_jump = registers[3] <= 0;
						break;
					case 0b111:
						should_jump = registers[3] < 0;
						break;
					default:
						throw new Error('Conditional unreachable');
				}
				if (should_jump) {
					pc = registers[0];
				} else {
					pc++;
				}
				continue;
			}
			case 0b10: {
				const input = (instruction & 0b00_111_000) >> 3;
				const output = instruction & 0b00_000_111;
				if (input === 7) {
					throw new Error('7 is not a valid input for a move instruction!');
				}
				if (output === 7) {
					throw new Error('7 is not a valid output for a move instruction!');
				}
				let inputData: number;
				if (input === 6) {
					const x = props.readFromInput();
					if (x === undefined) {
						throw new Error(
							'Input returned undefined when the interpreter tried to read from it! This means the input was not long enough to satisfy the program!',
						);
					}
					inputData = x;
				} else {
					inputData = registers[input]!;
				}
				if (output === 6) {
					props.writeToOutput(inputData);
				} else {
					registers[output]! = inputData;
				}
				pc++;
				continue;
			}
			case 0b11: {
				if ((instruction & 0b00_111_000) !== 0) {
					throw new Error(
						'Bad arithmetic instruction! Middle three bits were not zeroed!',
					);
				}
				let res: number;
				const reg1 = registers[1];
				const reg2 = registers[2];
				switch (instruction & 0b00_000_111) {
					case 0b000:
						res = reg1 + reg2;
						break;
					case 0b001:
						res = reg1 & reg2;
						break;
					case 0b010:
						res = reg1 | reg2;
						break;
					case 0b011:
						res = reg1 ^ reg2;
						break;
					case 0b100:
						res = reg1 - reg2;
						break;
					case 0b101:
						res = ~(reg1 & reg2);
						break;
					case 0b110:
						res = ~(reg1 | reg2);
						break;
					case 0b111:
						res = ~(reg1 ^ reg2);
						break;
					default:
						throw new Error('Arithmetic unreachable');
				}
				if (res < 0) {
					res += 256;
				}
				res %= 255;
				registers[3] = res;
				pc++;
				continue;
			}

			default:
				throw new Error(
					'Unreachable! instruction must always start with 0b00, 0b01, 0b10 or 0b11',
				);
		}
	}
};

export default BytecodeInterpreter;
