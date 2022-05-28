import Collapsible from 'react-collapsible';
import { ReactNode } from 'react';

interface InstructionsDocsProps {
	name: string;
	fullName?: string;
	syntax: string;
	function: string;
	examples?: ReactNode[] | string;
	notes?: ReactNode[] | string;
}

const InstructionDocs = (props: InstructionsDocsProps) => (
	<Collapsible openedClassName={'ps-3'} className='ps-3' trigger={props.name}>
		<p className='ps-3 p-0 m-0'>{props.fullName}</p>
		<p className='ps-3 p-0 m-0'>{props.syntax}</p>
		<p className='ps-3 p-0 m-0'>{props.function}</p>
		<p className={'ps-3 p-0 m-0'}>{props.examples}</p>
		<p className={'ps-3 p-0 m-0'}>{props.notes}</p>
	</Collapsible>
);

const Instructions = () => (
	<Collapsible trigger='Instructions:'>
		<Collapsible
			openedClassName={'ps-3'}
			className='ps-3'
			trigger={'Arithmetic:'}
		>
			<InstructionDocs
				name={'Add'}
				syntax={'Syntax: add'}
				function={
					'Function: Perform (register 1 + register 2) and store the result in register 3'
				}
			/>
			<InstructionDocs
				name={'Sub'}
				syntax={'Syntax: sub'}
				function={
					'Function: Perform (register 1 - register 2) and store the result in register 3'
				}
			/>
			<InstructionDocs
				name={'Or'}
				fullName={'Full name: Bitwise OR'}
				syntax={'Syntax: or'}
				function={
					'Function: Perform a bitwise OR operation on register 1 and register 2 and store the result in register 3'
				}
			/>
			<InstructionDocs
				name={'Nor'}
				fullName={'Full name: Bitwise NOR'}
				syntax={'Syntax: nor'}
				function={
					'Function: Perform a bitwise NOR operation on register 1 and register 2 and store the result in register 3'
				}
			/>
			<InstructionDocs
				name={'Add'}
				fullName={'Full name: Bitwise AND'}
				syntax={'Syntax: and'}
				function={
					'Function: Perform a bitwise AND operation on register 1 and register 2 and store the result in register 3'
				}
			/>
			<InstructionDocs
				name={'Nand'}
				fullName={'Full name: Bitwise NAND'}
				syntax={'Syntax: nand'}
				function={
					'Function: Perform a bitwise NAND operation on register 1 and register 2 and store the result in register 3'
				}
			/>
			<InstructionDocs
				name={'Xor'}
				fullName={'Full name: Bitwise XOR'}
				syntax={'Syntax: xor'}
				function={
					'Function: Perform a bitwise xor operation on register 1 and register 2 and store the result in register 3'
				}
			/>
			<InstructionDocs
				name={'Nxor'}
				fullName={'Full name: Bitwise NXOR'}
				syntax={'Syntax: nxor'}
				function={
					'Function: Perform a bitwise nxor operation on register 1 and register 2 and store the result in register 3'
				}
			/>
		</Collapsible>
		<InstructionDocs
			name={'Load Literal:'}
			syntax={'Syntax: $literal'}
			function={'Function: load the provided into register 0'}
			notes={
				'Notes: $literal can be a hex literal, bin literal or dec literal. Must be less than or equal to 63 and greater than 0'
			}
		/>

		<Collapsible
			openedClassName={'ps-3'}
			className='ps-3'
			trigger={'Conditional:'}
		>
			<InstructionDocs
				name={'Jmp'}
				syntax={'Syntax: j'}
				function={
					'Function: Unconditionally jump to the address pointed to by register 0'
				}
			/>
			<InstructionDocs
				name={'Nop'}
				syntax={'Syntax: nop'}
				function={'Function: Do nothing'}
			/>
			<InstructionDocs
				name={'Jez'}
				syntax={'Syntax: jez'}
				function={
					'Function: Jump to the address pointed to by register 0 if register 3 equals 0, else do nothing.'
				}
			/>
			<InstructionDocs
				name={'Jnz'}
				syntax={'Syntax: jnz'}
				function={
					'Function: Jump to the address pointed to by register 0 if register 3 does not equal 0, else do nothing.'
				}
			/>
			<InstructionDocs
				name={'Jgz'}
				syntax={'Syntax: jgz'}
				function={
					'Function: Jump to the address pointed to by register 0 if register 3 is greater than 0, else do nothing.'
				}
			/>
			<InstructionDocs
				name={'Jlz'}
				syntax={'Syntax: jlz'}
				function={
					'Function: Jump to the address pointed to by register 0 if register 3 is less than 0, else do nothing.'
				}
			/>
			<InstructionDocs
				name={'Jgez'}
				syntax={'Syntax: jgez'}
				function={
					'Function: Jump to the address pointed to by register 0 if register 3 is greater than or equal to 0, else do nothing.'
				}
			/>
			<InstructionDocs
				name={'Jlez'}
				syntax={'Syntax: jlez'}
				function={
					'Function: Jump to the address pointed to by register 0 if register 3 is less than or equal to 0, else do nothing.'
				}
			/>
		</Collapsible>
		<InstructionDocs
			name={'Move'}
			syntax={'Syntax: move $from $to'}
			function={'Function: Copy the value in $from into $to'}
			notes={[
				'Notes: $from can be a register or INPUT. $to can be a register or OUTPUT. Aliases for INPUT are "i", "in", "input". Aliases for OUTPUT are "o", "out", "output". ',
				<br key='1' />,
				<br key='2' />,
				'So if you want to copy a byte from input into output use "mov in out".',
				<br key='3' />,
				<br key='4' />,
				'If you want to copy from register 1 into register 2 use "mov 1 2" or mov "reg1 reg2"',
			]}
		/>
	</Collapsible>
);

export default Instructions;
