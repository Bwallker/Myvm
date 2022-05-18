mod macro_expander;
use color_eyre::Result;
pub fn preprocess(input: &str) -> Result<String> {
	macro_expander::expand_macros(input)
}