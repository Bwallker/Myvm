import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';

interface Props {
	setReg0: (newVal: number) => void;
	setReg1: (newVal: number) => void;
	setReg2: (newVal: number) => void;
	setReg3: (newVal: number) => void;
	setReg4: (newVal: number) => void;
	setReg5: (newVal: number) => void;
	setPC: (newVal: number) => void;
	setIsWaitingForInput: (newVal: boolean) => void;
	writeToOutput: (newestEntry: number) => void;
	readFromInput: () => number | undefined;
	fullInput: number[];
	program: number[];
	pc: number;
	registers: Uint8Array;
	isRunning: boolean;
	isPerformingAllInOne: boolean;
	useStdin: boolean;
	interpretResult: InterpretResult;
	setInterpretResult: (newVal: InterpretResult) => void;
	performInstructionResult: PerformInstructionResult;
	setPerformInstructionResult: (newVal: PerformInstructionResult) => void;
}

interface InterpretOk {
	error: '';
	wasSuccessful: true;
	errorType: '';
}

interface InterpretErr {
	error: string;
	wasSuccessful: false;
	errorType: InterpretErrorTypes;
}

export type InterpretErrorTypes =
	| PerformInstructionErrorTypes
	| 'program-is-too-long'
	| 'instruction-not-u8';

export type PerformInstructionErrorTypes =
	| 'invalid-arithmetic'
	| 'wrong-register-amount'
	| 'invalid-conditional'
	| 'conditional-unreachable'
	| 'arithmetic-unreachable'
	| 'invalid-move-from'
	| 'invalid-move-to'
	| 'not-enough-input'
	| 'prefix-unreachable';
export type InterpretResult = InterpretOk | InterpretErr;

interface PerformInstructionOk extends InterpretOk {
	shouldContinue: boolean;
	errorType: '';
}

interface PerformInstructionErr extends InterpretErr {
	shouldContinue: false;
	errorType: PerformInstructionErrorTypes;
}

export type PerformInstructionResult =
	| PerformInstructionOk
	| PerformInstructionErr;

const performInstruction = (args: Props): PerformInstructionResult => {
	if (args.registers.length !== 6) {
		return {
			wasSuccessful: false,
			error:
				'This virtual machine uses 6 registers, but the yet it received' +
				args.registers.length +
				' registers.',
			shouldContinue: false,
			errorType: 'wrong-register-amount',
		};
	}
	const instruction = args.program[args.pc];
	if (instruction === undefined) {
		return {
			wasSuccessful: true,
			error: '',
			shouldContinue: false,
			errorType: '',
		};
	}
	switch ((instruction & 0b11_00_00_00) >> 6) {
		case 0b00: {
			const body = instruction & 0b00_111_111;
			args.setReg0(body);
			args.setPC(args.pc + 1);
			return {
				wasSuccessful: true,
				error: '',
				shouldContinue: true,
				errorType: '',
			};
		}
		case 0b01: {
			if ((instruction & 0b00_111_000) !== 0) {
				return {
					wasSuccessful: false,
					error:
						'Bad conditional instruction! Middle three bits were not zeroed! Instruction occurred at pc ' +
						args.pc,
					shouldContinue: false,
					errorType: 'invalid-conditional',
				};
			}
			let should_jump: boolean;
			switch (instruction & 0b00_000_111) {
				case 0b000:
					should_jump = false;
					break;
				case 0b001:
					should_jump = args.registers[3]! === 0;
					break;
				case 0b010:
					should_jump = args.registers[3]! > 0;
					break;
				case 0b011:
					should_jump = args.registers[3]! >= 0;
					break;
				case 0b100:
					should_jump = true;
					break;
				case 0b101:
					should_jump = args.registers[3]! !== 0;
					break;
				case 0b110:
					should_jump = args.registers[3]! <= 0;
					break;
				case 0b111:
					should_jump = args.registers[3]! < 0;
					break;
				default:
					return {
						wasSuccessful: false,
						error: 'Conditional unreachable',
						shouldContinue: false,
						errorType: 'conditional-unreachable',
					};
			}
			if (should_jump) {
				args.setPC(args.registers[0]!);
			} else {
				args.setPC(args.pc + 1);
			}
			return {
				wasSuccessful: true,
				error: '',
				shouldContinue: true,
				errorType: '',
			};
		}
		case 0b10: {
			const input = (instruction & 0b00_111_000) >> 3;
			const output = instruction & 0b00_000_111;
			if (input === 7) {
				return {
					wasSuccessful: false,
					error: '7 is not a valid input for a move instruction!',
					shouldContinue: false,
					errorType: 'invalid-move-from',
				};
			}
			if (output === 7) {
				return {
					wasSuccessful: false,
					error: '7 is not a valid output for a move instruction!',
					shouldContinue: false,
					errorType: 'invalid-move-to',
				};
			}
			let inputData: number;
			if (input === 6) {
				const x = args.readFromInput();
				if (x === undefined) {
					return {
						wasSuccessful: false,
						error: 'The input was not long enough to satisfy the program!',
						shouldContinue: false,
						errorType: 'not-enough-input',
					};
				}
				inputData = x;
			} else {
				inputData = args.registers[input]!;
			}
			if (output === 6) {
				args.writeToOutput(inputData);
			} else {
				args.registers[output]! = inputData;
			}
			args.setPC(args.pc + 1);

			return {
				wasSuccessful: true,
				error: '',
				shouldContinue: true,
				errorType: '',
			};
		}
		case 0b11: {
			if ((instruction & 0b00_111_000) !== 0) {
				return {
					wasSuccessful: false,
					error:
						'Bad arithmetic instruction! Middle three bits were not zeroed! Instruction occurred at pc ' +
						args.pc,
					shouldContinue: false,
					errorType: 'invalid-arithmetic',
				};
			}
			let res: number;
			const reg1 = args.registers[1]!;
			const reg2 = args.registers[2]!;
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
					return {
						wasSuccessful: false,
						error: 'Arithmetic unreachable!',
						shouldContinue: false,
						errorType: 'arithmetic-unreachable',
					};
			}
			if (res < 0) {
				res += 256;
			}
			res %= 255;
			args.setReg3(res);
			args.setPC(args.pc + 1);
			return {
				wasSuccessful: true,
				error: '',
				shouldContinue: true,
				errorType: '',
			};
		}

		default:
			return {
				wasSuccessful: false,
				error:
					'Unreachable! instruction must always start with 0b00, 0b01, 0b10 or 0b11',
				shouldContinue: false,
				errorType: 'prefix-unreachable',
			};
	}
};

const useBytecodeInterpreter = (props: Props): void => {
	const lastProgram = useRef<number[]>([]);
	const lastInput = useRef<number[]>([]);
	const interpretResult = useRef(props.interpretResult);
	const performInstructionResult = useRef(props.performInstructionResult);
	if (props.program.length > 255) {
		interpretResult.current = {
			error:
				'Program length must be less than 256. It was ' + props.program.length,
			errorType: 'program-is-too-long',
			wasSuccessful: false,
		};
	}
	for (const instruction of props.program) {
		if (
			!Number.isInteger(instruction) ||
			instruction < 0 ||
			instruction > 255
		) {
			interpretResult.current = {
				error:
					'Every instruction in your program must be an integer between 0 and 255. One instruction was ' +
					instruction,
				errorType: 'instruction-not-u8',
				wasSuccessful: false,
			};
		}
	}
	useEffect(() => {
		console.log('Entered useEffect with the following values:');
		console.log('Perform instruction result:');
		console.dir(performInstructionResult.current);
		console.log('Interpret result:');
		console.dir(interpretResult.current);
		if (
			!arraysEqual(lastProgram.current, props.program) ||
			!arraysEqual(lastInput.current, props.fullInput)
		) {
			performInstructionResult.current = {
				error: '',
				errorType: '',
				wasSuccessful: true,
				shouldContinue: props.performInstructionResult.shouldContinue,
			};
		}
		let doEnter;
		if (
			!props.isRunning ||
			!props.isPerformingAllInOne ||
			props.interpretResult.errorType !== ''
		) {
			doEnter = false;
		} else {
			doEnter = true;
		}

		const registers = new Uint8Array(6);
		for (let i = 0; i < registers.length; i++) {
			registers[i] = 0;
		}
		const setReg0 = (newVal: number) => (registers[0] = newVal);
		const setReg1 = (newVal: number) => (registers[1] = newVal);
		const setReg2 = (newVal: number) => (registers[2] = newVal);
		const setReg3 = (newVal: number) => (registers[3] = newVal);
		const setReg4 = (newVal: number) => (registers[4] = newVal);
		const setReg5 = (newVal: number) => (registers[5] = newVal);

		let pc = 0;
		const setPC = (newVal: number) => (pc = newVal);
		// eslint-disable-next-line no-unmodified-loop-condition
		while (doEnter) {
			const comp = performInstruction({
				pc,
				setPC,
				registers,
				setReg0,
				setReg1,
				setReg2,
				setReg3,
				setReg4,
				setReg5,
				fullInput: props.fullInput,
				program: props.program,
				readFromInput: props.readFromInput,
				writeToOutput: props.writeToOutput,
				isRunning: props.isRunning,
				isPerformingAllInOne: props.isPerformingAllInOne,
				useStdin: props.useStdin,
				setIsWaitingForInput: props.setIsWaitingForInput,
				interpretResult: props.interpretResult,
				performInstructionResult: props.performInstructionResult,
				setInterpretResult: props.setInterpretResult,
				setPerformInstructionResult: props.setPerformInstructionResult,
			});
			lastProgram.current = props.program;
			lastInput.current = props.fullInput;
			if (!comp.wasSuccessful) {
				if (comp.errorType === 'not-enough-input' && props.useStdin) {
					props.setIsWaitingForInput(true);
				} else {
					performInstructionResult.current = {
						error: comp.error,
						errorType: comp.errorType,
						shouldContinue: false,
						wasSuccessful: false,
					};
					break;
				}
			}

			performInstructionResult.current = {
				error: '',
				errorType: '',
				wasSuccessful: true,
				shouldContinue: comp.shouldContinue,
			};

			props.setIsWaitingForInput(false);
			props.setPC(pc);
			props.setReg0(registers[0]!);
			props.setReg1(registers[1]!);
			props.setReg2(registers[2]!);
			props.setReg3(registers[3]!);
			props.setReg4(registers[4]!);
			props.setReg5(registers[5]!);
			if (!comp.shouldContinue) break;
		}
		if (!isEqual(interpretResult.current, props.interpretResult)) {
			props.setInterpretResult(interpretResult.current);
		}
		if (
			!isEqual(performInstructionResult.current, props.performInstructionResult)
		) {
			props.setPerformInstructionResult(performInstructionResult.current);
		}
	}, [props]);
};

const arraysEqual = (last: number[], now: number[]) => {
	if (last.length !== now.length) {
		return false;
	}
	for (let i = 0; i < last.length; i++) {
		if (last[i] !== now[i]) {
			return false;
		}
	}
	return true;
};
export default useBytecodeInterpreter;
