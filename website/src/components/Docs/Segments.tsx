import Collapsible from 'react-collapsible';

const Segments = () => (
	<Collapsible trigger={'Segments:'}>
		<Collapsible openedClassName={'ps-3'} className='ps-3' trigger={'Input:'}>
			<p className='ps-3'>
				The input segments contains the program input. The program input is one
				of the options for the input that is used at runtime.
				<br />
				Valid inputs are:
				<br />
				<br />
				hex literals:
				<br />
				Eg. 0x60 or 0xff
				<br />
				NOTE: hexadecimal literals must be at most 2 digits, because they must
				fit into a byte.
				<br />
				<br />
				dec literals:
				<br />
				Eg. 100 or 255
				<br />
				NOTE: decimal literals must be at most equal to 255, because they must
				fit into a byte.
				<br />
				<br />
				bin literals:
				<br />
				Eg. 0b100 or 0b101010
				<br />
				NOTE: binary literals must be at most 8 digits, because they must fit
				into a byte.
				<br />
				<br />
				char literals: Eg. &apos;a&apos; or &apos;\n&apos;
				<br />
				NOTE: Must be a valid ASCII digit surrounded by &apos; or a sequence
				representing a special ASCII character like \n or \t surrounded by
				&apos;
			</p>
		</Collapsible>
		<Collapsible openedClassName={'ps-3'} className='ps-3' trigger={'Program:'}>
			<p className='ps-3'>
				The program segments contains the actual source code that gets turned
				into bytecode.
				<br />
				<br />
				Available instructions are documented in the Instructions section of the
				Docs.
				<br />
				<br />
				The program section also contains all your macros and constants, which
				are also discussed in their own respective sections under the Advanced
				sections.
			</p>
		</Collapsible>
	</Collapsible>
);

export default Segments;
