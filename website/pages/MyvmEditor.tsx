import { loader } from '@monaco-editor/react';
import { useEffect } from 'react';

const MyvmEditor = () => {
	useEffect(() => {
		loader.init().then((monaco) => {
			monaco.languages.register({ id: 'myvm' });
			// Register a tokens provider for the language
			monaco.languages.setMonarchTokensProvider('myvm', {
				tokenizer: {
					root: [
						[/\s*0[xX][\da-fA-F]+([\t ]+|\n|$)/, 'hexLiteral'],
						[/\s*0[bB][01]+([\t ]+|\n|$)/, 'binLiteral'],
						[/\s*\d+([\t ]+|\n|$)/, 'decLiteral'],
						[
							/\s*[pP][rR][oO][gG][rR][aA][mM]:[\t\r ]*((\/\/)|(\/\*)|\n|$)/,
							'program',
						],
						[
							/\s*[iI][nN][pP][uU][tT][sS]:[\t\r ]*((\/\/)|(\/\*)|\n|$)/,
							'inputs',
						],
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
					],
				},
			});
			const literalStyling = { foreground: 'FFA500', fontStyle: 'bold' };
			const conditionalStyling = { foreground: '00a0a0', fontStyle: 'bold' };
			const arithmeticStyling = { foreground: 'a000a0', fontStyle: 'bold' };
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
			monaco.editor.create(document.getElementById('monaco-root')!, {
				minimap: { enabled: false },
				value: 'program:\nadd\nsub\nnop\n0x111\n0b111\n111',
				language: 'myvm',
				theme: 'myvm-theme',
				scrollBeyondLastLine: false,
				renderFinalNewline: false,
			});
		});

		return () => void 0;
	});
	return <div id='monaco-root' style={{ width: '100vw', height: '100vh' }} />;
};

export default MyvmEditor;
