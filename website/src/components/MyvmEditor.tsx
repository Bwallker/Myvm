import Editor, { loader, OnChange } from '@monaco-editor/react';
import { CSSProperties, useEffect } from 'react';
import useWindowDimensions from '../util/useWindowDimensions';
import HelloWorld from '../../myvm_examples/hello_world';

interface Props {
	className?: string;
	style?: CSSProperties;
	onChange?: OnChange;
}

const MyvmEditor = (props: Props) => {
	useEffect(() => {
		loader.init().then((monaco) => {
			monaco.languages.register({ id: 'myvm' });
			// Register a tokens provider for the language
			monaco.languages.setMonarchTokensProvider('myvm', {
				tokenizer: {
					root: [
						[/\s*[mM][aA][cC][rR][oO]\s+/, 'macroKeyword'],
						[
							/\s*[eE][nN][dD]_[mM][aA][cC][rR][oO]:[\t\r ]*((\/\/)|(\/\*)|\n|$)/,
							'endMacro',
						],
						[/\s*%[a-zA-Z]\w*/, 'macroArg'],
						[/\s*0[xX][\da-fA-F]+/, 'hexLiteral'],
						[/\s*0[bB][01]+/, 'binLiteral'],
						[/\s*\d+/, 'decLiteral'],
						[
							/\s*[pP][rR][oO][gG][rR][aA][mM]:[\t\r ]*((\/\/)|(\/\*)|\n|$)/,
							'program',
						],
						[/\s*[iI][nN][pP][uU][tT]:[\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'inputs'],
						[/\s*[sS][uU][bB][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'sub'],
						[/\s*[aA][dD][dD][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'add'],
						[/\s*[oO][rR][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'or'],
						[/\s*[nN][oO][rR][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'nor'],
						[/\s*[xX][oO][rR][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'xor'],
						[/\s*[xX][nN][oO][rR][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'xnor'],
						[/\s*[aA][nN][dD][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'and'],
						[/\s*[nN][aA][nN][dD][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'nand'],

						[/\s*[nN][oO][pP][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'nop'],

						[/\s*[jJ][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'j'],
						[/\s*[jJ][eE][zZ][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'jez'],
						[/\s*[jJ][nN][zZ][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'jnz'],
						[/\s*[jJ][gG][eE][zZ][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'jgez'],
						[/\s*[jJ][gG][zZ][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'jgz'],
						[/\s*[jJ][lL][eE][zZ][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'jlez'],
						[/\s*[jJ][lL][zZ][\t\r ]*((\/\/)|(\/\*)|\n|$)/, 'jlz'],

						[/\s*[mM][oO][vV][\t ]+/, 'mov'],

						[/\s*[a-zA-Z]\w*/, 'ident'],
						[
							/\s*'(.|\\n|\\t|\\r|\\0)'[\t\r ]*((\/\/)|(\/\*)|\n|$)/,
							'charLiteral',
						],
						[/\/\/.*/, 'lineComment'],
						[/\/\*(\*(?!\/)|[^*])*\*\//, 'blockComment'],
					],
				},
			});

			const literalStyling = { foreground: 'FFA500', fontStyle: 'bold' };
			const conditionalStyling = { foreground: '00a0a0', fontStyle: 'bold' };
			const arithmeticStyling = { foreground: 'a000a0', fontStyle: 'bold' };
			const commentStyling = { foreground: '666666', fontStyle: 'bold' };
			monaco.editor.defineTheme('myvm-theme', {
				base: 'vs-dark',
				inherit: false,
				rules: [
					{ token: 'program', foreground: '777777', fontStyle: 'bold' },
					{ token: 'inputs', foreground: '777777', fontStyle: 'bold' },
					{ token: 'add', foreground: '008800', fontStyle: 'bold' },
					{ token: 'sub', foreground: 'ff0000', fontStyle: 'bold' },
					{ token: 'nop', foreground: 'ffff00', fontStyle: 'bold' },
					{ token: 'hexLiteral', ...literalStyling },
					{ token: 'binLiteral', ...literalStyling },
					{ token: 'decLiteral', ...literalStyling },
					{ token: 'charLiteral', foreground: 'aa6600', fontStyle: 'bold' },
					{ token: 'mov', ...literalStyling },
					{ token: 'ident', foreground: '0000dd' },
					{ token: 'j', ...conditionalStyling },
					{ token: 'jez', ...conditionalStyling },
					{ token: 'jnz', ...conditionalStyling },
					{ token: 'jgez', ...conditionalStyling },
					{ token: 'jgz', ...conditionalStyling },
					{ token: 'jlez', ...conditionalStyling },
					{ token: 'jlz', ...conditionalStyling },

					{ token: 'or', ...arithmeticStyling },
					{ token: 'nor', ...arithmeticStyling },
					{ token: 'xor', ...arithmeticStyling },
					{ token: 'xnor', ...arithmeticStyling },
					{ token: 'and', ...arithmeticStyling },
					{ token: 'nand', ...arithmeticStyling },

					{ token: 'macroArg', foreground: 'aabbcc', fontStyle: 'bold' },
					{ token: 'macroKeyword', foreground: 'ccbbaa', fontStyle: 'bold' },
					{ token: 'endMacro', foreground: 'abcabc', fontStyle: 'bold' },

					{ token: 'blockComment', ...commentStyling },
					{ token: 'lineComment', ...commentStyling },
				],
				colors: { 'editor.foreground': '#ffffff' },
			});
			// Set the editing configuration for the language
			monaco.languages.setLanguageConfiguration('myvm', {
				comments: {
					lineComment: '//',
					blockComment: ['/*', '*/'],
				},
			});

			console.log('Finished setting up myvm lang');
		});

		return () => void 0;
	});
	const window = useWindowDimensions();
	return (
		<Editor
			options={{
				minimap: { enabled: false },
				value: HelloWorld,
				language: 'myvm',
				theme: 'myvm-theme',
				scrollBeyondLastLine: false,
				renderFinalNewline: false,
			}}
			language='myvm'
			theme='myvm-theme'
			width={window.width / 2}
			height={window.height}
			className={props.className}
			onChange={props.onChange}
			value={HelloWorld}
		/>
	);
};

export default MyvmEditor;
