use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
type JSResult<T> = Result<T, JsValue>;

#[wasm_bindgen]
pub struct WasmSuccessfulParse {
    pub(crate) input: Vec<u8>,
    pub(crate) program: Vec<u8>,
    pub(crate) expanded: String,
}

#[wasm_bindgen]
impl WasmSuccessfulParse {
    pub fn from(input: Vec<u8>, program: Vec<u8>, expanded: String) -> Self {
        Self {
            input,
            program,
            expanded,
        }
    }
    pub fn get_program(&self) -> Vec<u8> {
        self.program.clone()
    }

    pub fn get_input(&self) -> Vec<u8> {
        self.input.clone()
    }

    pub fn get_expanded(&self) -> String {
        self.expanded.clone()
    }
}
#[wasm_bindgen]
pub fn parse_wasm_edition(program: &str) -> JSResult<WasmSuccessfulParse> {
    let r = assembler::parser::parse(program);
    match r {
        Ok(v) => {
            let r = v.into_raw_parts();
            Ok(WasmSuccessfulParse::from(r.0, r.1, r.2))
        }
        Err(e) => Err(JsValue::from(e.to_string())),
    }
}
