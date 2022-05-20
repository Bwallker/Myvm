import dynamic from 'next/dynamic';
import { ParseResult } from '../components/Assemble';

const UseWasm = dynamic({
	loader: async () => {
		// Import the wasm module
		const rustModule = await import('../../pkg');

		// Return a React component that calls the add_one method on the wasm module
		// eslint-disable-next-line react/display-name
		return (props: {
			input: string;
			component: (props: { input: ParseResult }) => JSX.Element;
		}) => {
			let toParse: ParseResult;
			try {
				const res = rustModule.parse_wasm_edition(props.input);
				toParse = {
					wasSuccessful: true,
					parsed: res,
				};
			} catch (e) {
				toParse = {
					wasSuccessful: false,
					error: e + '',
				};
			}

			return <props.component input={toParse} />;
		};
	},
	ssr: false,
});

export default UseWasm;
