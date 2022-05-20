import { useState } from 'react';
import BytecodeInterpreter from '../interpreter/BytecodeInterpreter';
import { ParseResult } from './Assemble';

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

	if (!props.input.wasSuccessful) {
		return (
			<div>
				<h1>Your input could not be parsed! Here is the error!</h1>
				<p>{props.input.error}</p>
			</div>
		);
	}
	const program = props.input.parsed.get_program();
	const inputs = props.input.parsed.get_input();

	const programNumber = new Array(program.length);
	let i = 0;
	for (const instruction of program) {
		programNumber[i] = instruction;
		i++;
	}
	i = 0;
	const inputNumber = new Array(inputs.length);
	for (const input of inputs) {
		inputNumber[i] = input;
		i++;
	}

	inputNumber.reverse();
	return (
		<div>
			<BytecodeInterpreter
				setReg0={setReg0}
				setReg1={setReg1}
				setReg2={setReg2}
				setReg3={setReg3}
				setReg4={setReg4}
				setReg5={setReg5}
				setPC={setPC}
				writeToOutput={(x) => console.log('Output: ' + x)}
				readFromInput={() => inputNumber.pop()}
				program={programNumber}
			/>
			<Register value={reg0} name='Reg0' />
			<Register value={reg1} name='Reg1' />
			<Register value={reg2} name='Reg2' />
			<Register value={reg3} name='Reg3' />
			<Register value={reg4} name='Reg4' />
			<Register value={reg5} name='Reg5' />
			<Register value={pc} name='PC' />
		</div>
	);
};

export default Run;
