import Collapsible from 'react-collapsible';

const Advanced = () => (
	<Collapsible trigger='Advanced:'>
		<Collapsible openedClassName={'ps-3'} className='ps-3' trigger={'Macros:'}>
			<Collapsible
				openedClassName={'ps-3'}
				className={'ps-3'}
				trigger={'Definition:'}
			>
				<p className={'ps-3'}>
					Macros are defined using the following syntax:
					<br />
					macro {'{macro_name}'} (one or more macro args):
					<br />
					Macro args are identifiers prefixed with %
					<br />
					Example:
					<br />
					macro my_macro (%a, %b, %c):
					<br />
					This defines a macro with the name my_macro that takes three
					arguments, called %a, %b anc %c respectively.
				</p>
			</Collapsible>
			<Collapsible
				trigger={'Body:'}
				className={'ps-3'}
				openedClassName={'ps-3'}
			>
				<p className={'ps-3'}>
					The contents of macro bodies are not restricted, and if a macro is
					never used it may contain any manner of garbage.
					<br />
					When macros are called, the arguments given to macro are substituted
					into the macro body, replacing their positional counterparts in the
					macro definition.
					<br />
					The substituted macro body is then copy pasted into the call site.
					<br />
					The macro body must be terminated by a &quot;macro_end:&quot; token
					<br />
					<br />
					Example:
					<br />
					<br />
					Consider the following macro:
					<br />
					macro print_byte(%byte):
					<br />
					&emsp;%byte
					<br />
					&emsp;mov 0 out
					<br />
					end_macro:
					<br />
					<br />
					This macro takes a byte to print as an argument and will expand into a
					code segment that does just that.
					<br />
					<br />
					When this macro is called at this call site:
					<br />
					&emsp;mov 0 1
					<br />
					<span className='text-danger'>&emsp;print_byte(50)</span>
					<br />
					&emsp;mov 1 0
					<br />
					<br />
					It will generate the following code:
					<br />
					&emsp;mov 0 1
					<br />
					<span className='text-danger'>
						&emsp;50
						<br />
						&emsp;mov 0 out
					</span>
					<br />
					&emsp;mov 1 0
					<br />
					<br />
					It&apos;s worth noting that macros may also call other macros, but
					they may not call themselves,
					<br /> or form a loop of macros calling each other as that makes them
					impossible to expand.
				</p>
			</Collapsible>
		</Collapsible>
		<Collapsible
			openedClassName={'ps-3'}
			className='ps-3'
			trigger={'Constants:'}
		>
			<p className='ps-3'>
				Constants similarly to macros are handled before by a preprocessor that
				will replace all uses of a constant by its concrete value.
				<br /> This process is similar to #define in C.
				<br />
				Consider this constant:
				<br />
				<br />
				&emsp;MY_CONST = 4
				<br />
				<br />
				And this use of it:
				<br />
				<br />
				&emsp;MY_CONST
				<br />
				&emsp;mov 0 o
				<br />
				<br />
				This will expand into
				<br />
				&emsp;4
				<br />
				&emsp;mov 0 o
				<br />
				<br />
				Constants can also be used in macro calls.
				<br />
				AKA this will compile:
				<br />
				<br />
				&emsp;some_defined_macro_that_takes_one_argument(SOME_CONST_THAT_IS_DEFINED)
			</p>
		</Collapsible>
	</Collapsible>
);

export default Advanced;
