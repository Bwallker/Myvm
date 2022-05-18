// Note that a dynamic `import` statement here is required due to
// webpack/webpack#6615, but in theory `import { greet } from './pkg';`
// will work here one day as well!
const rust = import('./pkg');

rust
    .then(m => m.parse_wasm_edition('program:\nadd\nsub\nnop'))
    .catch(console.error);