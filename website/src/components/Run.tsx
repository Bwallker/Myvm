import { useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import useBytecodeInterpreter, {
	InterpretResult,
	PerformInstructionResult,
} from '../interpreter/BytecodeInterpreter';
import { ParseResult } from './Assemble';

interface Props {
	input: ParseResult;
}

interface RenderStateProps {
	registers: Uint8Array;
	pc: number;
}

interface RegisterProps {
	value: number;
	name: string;
}

const Register = (props: RegisterProps) => (
	<div>
		<h1>{props.name}</h1>
		<p>{props.value}</p>
	</div>
);
export const RenderState = (props: RenderStateProps) => (
	<div>
		<Register value={props.registers[0]!} name='Reg0' />
		<Register value={props.registers[1]!} name='Reg1' />
		<Register value={props.registers[2]!} name='Reg2' />
		<Register value={props.registers[3]!} name='Reg3' />
		<Register value={props.registers[4]!} name='Reg4' />
		<Register value={props.registers[5]!} name='Reg5' />
		<Register value={props.pc} name='PC' />
	</div>
);

const Run = (props: Props) => {
	const [reg0, setReg0] = useState(0);
	const [reg1, setReg1] = useState(0);
	const [reg2, setReg2] = useState(0);
	const [reg3, setReg3] = useState(0);
	const [reg4, setReg4] = useState(0);
	const [reg5, setReg5] = useState(0);
	const [pc, setPC] = useState(0);
	const [useStdin, setUseStdin] = useState(false);
	const [stdin, setStdin] = useState('');
	const [output, setOutput] = useState('');
	const [bufferedStdin, setBufferedStdin] = useState('');
	const [isStepping, setIsStepping] = useState(false);
	const [isPerformingAllInOne, setIsPerformingAllInOne] = useState(false);
	const [isWaitingForInput, setIsWaitingForInput] = useState(false);
	const programNumber = useRef<number[]>([]);
	const inputNumber = useRef<number[]>([]);
	const originalInputNumber = useRef<number[]>([]);
	const [interpretResult, setInterpretResult] = useState<InterpretResult>({
		error: '',
		errorType: '',
		wasSuccessful: true,
	});
	const [performInstructionResult, setPerformInstructionResult] =
		useState<PerformInstructionResult>({
			error: '',
			errorType: '',
			wasSuccessful: true,
			shouldContinue: true,
		});
	useMemo(() => {
		if (props.input.wasSuccessful) {
			const program = props.input.parsed.get_program();
			const inputs = props.input.parsed.get_input();

			programNumber.current = new Array(program.length);
			let i = 0;
			for (const instruction of program) {
				programNumber.current[i] = instruction;
				i++;
			}
			i = 0;
			originalInputNumber.current = new Array(inputs.length);
			for (const input of inputs) {
				originalInputNumber.current[i] = input;
				i++;
			}
			originalInputNumber.current.reverse();
		} else {
			programNumber.current = [];
			inputNumber.current = [];
		}
	}, [props]);
	inputNumber.current = [...originalInputNumber.current];
	useBytecodeInterpreter({
		setReg0,
		setReg1,
		setReg2,
		setReg3,
		setReg4,
		setReg5,
		setPC,
		output,
		setOutput,
		isWaitingForInput,
		writeToOutput: (_d) => void 0,
		setIsWaitingForInput,
		useStdin,
		fullInput: inputNumber.current,
		interpretResult,
		setInterpretResult,
		performInstructionResult,
		setPerformInstructionResult,
		readFromInput: () => {
			if (!useStdin) {
				return inputNumber.current.pop();
			} else {
				const ret = bufferedStdin.charCodeAt(0);
				setBufferedStdin(bufferedStdin.substring(1));
				if (isNaN(ret)) {
					return undefined;
				} else {
					return ret;
				}
			}
		},
		program: programNumber.current,
		pc,
		registers: new Uint8Array([reg0, reg1, reg2, reg3, reg4, reg5]),
		isStepping,
		setIsStepping,
		isPerformingAllInOne,
	});

	if (performInstructionResult.errorType === 'not-enough-input' && useStdin) {
		inputNumber.current = [...originalInputNumber.current];
	}
	if (
		!performInstructionResult.wasSuccessful ||
		!interpretResult.wasSuccessful
	) {
		if (isStepping) {
			setIsStepping(false);
		}
		if (isPerformingAllInOne) {
			setIsPerformingAllInOne(false);
		}
	}

	if (!props.input.wasSuccessful) {
		return (
			<div>
				<h1>Your input could not be parsed! Here is the error!</h1>
				<p>{props.input.error}</p>
			</div>
		);
	}

	if (
		(!performInstructionResult.wasSuccessful ||
			!interpretResult.wasSuccessful) &&
		(!useStdin || performInstructionResult.errorType !== 'not-enough-input')
	) {
		return (
			<div>
				<h1>Error:</h1>
				<br />
				<br />
				<p>
					{!interpretResult.wasSuccessful
						? interpretResult.error
						: performInstructionResult.error}
				</p>
			</div>
		);
	}

	return (
		<div>
			<Button
				onClick={() => {
					if (isPerformingAllInOne || isStepping) {
						setPC(0);
						setReg0(0);
						setReg1(0);
						setReg2(0);
						setReg3(0);
						setReg4(0);
						setReg5(0);
						setOutput('');
						inputNumber.current = [...originalInputNumber.current];
					}
					if (!isStepping) {
						setIsPerformingAllInOne(!isPerformingAllInOne);
					}
					setIsStepping(false);
				}}
			>
				{isStepping || isPerformingAllInOne ? 'Stop' : 'Run'}
			</Button>
			<Button
				disabled={isPerformingAllInOne}
				onClick={() => {
					setIsPerformingAllInOne(false);
					setIsStepping(true);
				}}
			>
				Step
			</Button>
			{RenderState({
				registers: new Uint8Array([reg0, reg1, reg2, reg3, reg4, reg5]),
				pc,
			})}
			<p>{isWaitingForInput ? 'Waiting for input!' : ''}</p>
			<label htmlFor='use-stdin'>Use stdin?</label>
			<input
				type='checkbox'
				name='use-stdin'
				checked={useStdin}
				onChange={() => setUseStdin(!useStdin)}
			/>
			<label htmlFor='stdin'>Stdin:</label>
			<input
				type='text'
				value={stdin}
				name='stdin'
				onChange={(x) => setStdin(x.target.value)}
				disabled={!useStdin}
			/>
			<Button
				onClick={() => {
					setBufferedStdin(stdin);
					setStdin('');
				}}
				disabled={!useStdin}
			>
				Submit stdin:
			</Button>
			<p>Output:</p>
			<p>{output}</p>
		</div>
	);
};

export default Run;
