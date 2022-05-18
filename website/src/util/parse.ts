import * as wasm from '../pkg/index';
import { WasmSuccessfulParse } from '../pkg/index';

type ParseReult = ParseErr | ParseOk;

interface ParseOk {
	wasSuccessful: true;
	parsed: WasmSuccessfulParse;
}

interface ParseErr {
	wasSuccessful: false;
	error: string;
}

const parse = (input: string): ParseReult => {
	try {
		return { parsed: wasm.parse_wasm_edition(input), wasSuccessful: true };
	} catch (e) {
		return { error: e + '', wasSuccessful: false };
	}
};
export default parse;
