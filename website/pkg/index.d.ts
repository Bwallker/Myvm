/* tslint:disable */
/* eslint-disable */
/**
* @param {string} program
* @returns {WasmSuccessfulParse}
*/
export function parse_wasm_edition(program: string): WasmSuccessfulParse;
/**
*/
export class WasmSuccessfulParse {
  free(): void;
/**
* @param {Uint8Array} input
* @param {Uint8Array} program
* @param {string} expanded
* @returns {WasmSuccessfulParse}
*/
  static from(input: Uint8Array, program: Uint8Array, expanded: string): WasmSuccessfulParse;
/**
* @returns {Uint8Array}
*/
  get_program(): Uint8Array;
/**
* @returns {Uint8Array}
*/
  get_input(): Uint8Array;
/**
* @returns {string}
*/
  get_expanded(): string;
}
