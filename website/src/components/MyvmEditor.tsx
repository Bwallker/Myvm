import Editor, { loader, OnChange } from '@monaco-editor/react';
import { CSSProperties, useEffect } from 'react';
import HelloWorld from '../../myvm_examples/hello_world';
import useWindowDimensions from '../util/useWindowDimensions';

interface Props {
	className?: string;
	style?: CSSProperties;
	onChange?: OnChange;
	readonly?: boolean;
	initialValue?: string;
	width?: number;
	height?: number;
}

const MyvmEditor = (props: Props) => {
	useEffect(() => {
		loader.init().then((monaco) => {
			monaco.languages.register({ id: 'myvm' });
			// Register a tokens provider for the language
			monaco.languages.setMonarchTokensProvider('myvm', {
				tokenizer: {
					root: [
						[/[mM][aA][cC][rR][oO]\s+/, 'macroKeyword'],
						[/[eE][nN][dD]_[mM][aA][cC][rR][oO]:(?=(|$|\s|\W))/g, 'endMacro'],
						[/%[a-zA-Z]\w*/, 'macroArg'],
						[/0[xX][\da-fA-F]+/, 'hexLiteral'],
						[/0[bB][01]+/, 'binLiteral'],
						[/\d+/, 'decLiteral'],
						[/[pP][rR][oO][gG][rR][aA][mM]:(?=(|$|\s|\W))/g, 'program'],
						[/[iI][nN][pP][uU][tT]:(?=(|$|\s|\W))/g, 'inputs'],
						[/[sS][uU][bB](?=(|$|\s|\W))/g, 'sub'],
						[/[aA][dD][dD](?=(|$|\s|\W))/g, 'add'],
						[/[oO][rR](?=(|$|\s|\W))/g, 'or'],
						[/[nN][oO][rR](?=(|$|\s|\W))/g, 'nor'],
						[/[xX][oO][rR](?=(|$|\s|\W))/g, 'xor'],
						[/[xX][nN][oO][rR](?=(|$|\s|\W))/g, 'xnor'],
						[/[aA][nN][dD](?=(|$|\s|\W))/g, 'and'],
						[/[nN][aA][nN][dD](?=(|$|\s|\W))/g, 'nand'],

						[/[nN][oO][pP](?=(|$|\s|\W))/g, 'nop'],

						[/[jJ](?=(|$|\s|\W))/g, 'j'],
						[/[jJ][eE][zZ](?=(|$|\s|\W))/g, 'jez'],
						[/[jJ][nN][zZ](?=(|$|\s|\W))/g, 'jnz'],
						[/[jJ][gG][eE][zZ](?=(|$|\s|\W))/g, 'jgez'],
						[/[jJ][gG][zZ](?=(|$|\s|\W))/g, 'jgz'],
						[/[jJ][lL][eE][zZ](?=(|$|\s|\W))/g, 'jlez'],
						[/[jJ][lL][zZ](?=(|$|\s|\W))/g, 'jlz'],

						[/[mM][oO][vV][\t ]+/g, 'mov'],
						[
							/([oO][uU][tT][pP][uU][tT](?=(\s|$)))|[oO][uU][tT](?=(\s|$))|[oO](?=(\s|$))/g,
							'out',
						],
						[
							/([iI][nN][pP][uU][tT](?=(\s|$))|[iI][nN](?=(\s|$))|[iI](?=(\s|$)))/g,
							'in',
						],

						[/(?<=\W|^)([A-Za-z])\w+/, 'ident'],
						[/'(.|\\n|\\t|\\r|\\0)'(?=(|$|\s|\W))/g, 'charLiteral'],
						[/\/\/.*/g, 'lineComment'],
						[/\/\*(\*(?!\/)|[^*])*\*\//g, 'blockComment'],
					],
				},
			});

			const literalStyling = { foreground: 'FFA500', fontStyle: 'bold' };
			const conditionalStyling = { foreground: '00a0a0', fontStyle: 'bold' };
			const arithmeticStyling = { foreground: 'a000a0', fontStyle: 'bold' };
			const commentStyling = { foreground: '666666', fontStyle: 'bold' };
			const ioStyling = { foreground: 'FF00FF', fontStyle: 'bold' };
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
					{ token: 'mov', foreground: '994C00', fontStyle: 'bold' },
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

					{ token: 'in', ...ioStyling },
					{ token: 'out', ...ioStyling },
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
		});

		return () => void 0;
	});
	const window = useWindowDimensions();
	const initialValue = props.initialValue ?? HelloWorld;
	const width =
		props.width === undefined ? window.width / 2 : window.width * props.width;
	const height =
		props.height === undefined ? window.height : window.width * props.height;

	return (
		<Editor
			options={{
				minimap: { enabled: false },
				value: initialValue,
				language: 'myvm',
				theme: 'myvm-theme',
				scrollBeyondLastLine: false,
				renderFinalNewline: false,
				readOnly: props.readonly,
			}}
			language='myvm'
			theme='myvm-theme'
			width={width}
			height={height}
			className={props.className}
			onChange={props.onChange}
			value={initialValue}
		/>
	);
};

export default MyvmEditor;
