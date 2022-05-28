import Collapsible from 'react-collapsible';

const IO = () => (
	<Collapsible trigger='IO:'>
		<Collapsible openedClassName={'ps-3'} className='ps-3' trigger={'In:'}>
			<p className='ps-3'>
				The IN keyword has three aliases: &quot;i&quot;, &quot;in&quot; and
				&quot;input&quot;
				<br />
				<br />
				The IN keyword is used in MOV instructions to specify that the copied
				value should be produced from the program input instead of from a
				register.
				<br />
				<br />
				In the web version, if the useStdin flag is set, the value is produced
				from STDIN. Otherwise it is produced from the programs input segment.
				<br />
				<br />
				In the CLI version, the input can be STDIN, the program input, or a file
				depending on your CLI args.
			</p>
		</Collapsible>
		<Collapsible openedClassName={'ps-3'} className='ps-3' trigger={'Out:'}>
			<p className='ps-3'>
				The OUT keyword has three aliases: &quot;o&quot;, &quot;out&quot; and
				&quot;output&quot;
				<br />
				<br />
				The OUT keyword is used in MOV instructions to specify that the copied
				value should be copied to the program output instead of from a register.
				<br />
				<br />
				In the web version, the program output is put in the output text box.
				<br /> in the CLI version it is printed to STDOUT, or into a file.
			</p>
		</Collapsible>
	</Collapsible>
);

export default IO;
