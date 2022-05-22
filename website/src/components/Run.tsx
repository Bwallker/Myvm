import { useRef, useState } from 'react';
import useBytecodeInterpreter from '../interpreter/BytecodeInterpreter';
import { ParseResult } from './Assemble';
import { Button } from 'react-bootstrap';

interface Props {
	input: ParseResult;
}

const Run = (props: Props) => {
	const [reg0, setReg0] = useState(0);
	const [reg1, setReg1] = useState(0);
	const [reg2, setReg2] = useState(0);
	const [reg3, setReg3] = useState(0);
	const [reg4, setReg4] = useState(0);
	const [reg5, setReg5] = useState(0);
	const [pc, setPC] = useState(0);
	const output = useRef('');
	const [useStdin, setUseStdin] = useState(false);
	const [stdin, setStdin] = useState('');
	const [bufferedStdin, setBufferedStdin] = useState('');
	const [isRunning, setIsRunning] = useState(true);
	const [isPerformingAllInOne, setIsPerformingAllInOne] = useState(true);
	let program: Uint8Array,
		inputs: Uint8Array,
		programNumber: number[],
		inputNumber: number[];
	if (props.input.wasSuccessful) {
		program = props.input.parsed.get_program();
		inputs = props.input.parsed.get_input();

		programNumber = new Array(program.length);
		let i = 0;
		for (const instruction of program) {
			programNumber[i] = instruction;
			i++;
		}
		i = 0;
		inputNumber = new Array(inputs.length);
		for (const input of inputs) {
			inputNumber[i] = input;
			i++;
		}
		inputNumber.reverse();
	} else {
		inputs = new Uint8Array();
		program = new Uint8Array();
		programNumber = [];
		inputNumber = [];
	}

	const res = useBytecodeInterpreter({
		setReg0,
		setReg1,
		setReg2,
		setReg3,
		setReg4,
		setReg5,
		setPC,
		writeToOutput: (x) => (output.current += String.fromCharCode(x)),
		readFromInput: () => {
			if (!useStdin) {
				return inputNumber.pop();
			} else {
				const ret = bufferedStdin[0];
				setBufferedStdin(bufferedStdin.substring(1));
				if (ret === undefined) {
					return ret;
				} else {
					return ret.charCodeAt(0);
				}
			}
		},
		program: programNumber,
		pc,
		registers: new Uint8Array([reg0, reg1, reg2, reg3, reg4, reg5]),
	});

	if (!props.input.wasSuccessful) {
		return (
			<div>
				<h1>Your input could not be parsed! Here is the error!</h1>
				<p>{props.input.error}</p>
			</div>
		);
	}

	if (!res.wasSuccessful) {
		return (
			<div>
				<h1>Error:</h1>
				<br />
				<br />
				<p>{res.error}</p>
			</div>
		);
	}

	return (
		<div>
			<Button
				onClick={() => {
					if (isPerformingAllInOne) {
						setIsRunning(false);
						setIsPerformingAllInOne(false);
					} else {
						setIsPerformingAllInOne(!isRunning);
						setIsRunning(!isRunning);
					}
				}}
			>
				{isRunning ? 'Stop' : 'Run'}
			</Button>
			<Button
				disabled={isPerformingAllInOne}
				onClick={() => {
					setIsPerformingAllInOne(false);
					setIsRunning(true);
				}}
			>
				Step
			</Button>
			{res.elem}
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
			<p>
				Output:
				<br />
				{output.current}
			</p>
		</div>
	);
};

export default Run;
