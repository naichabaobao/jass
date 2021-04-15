import("./provider/document-formatting-edit-provider");
import("./provider/folding-range-provider");
import("./provider/document-color-provider");
import("./provider/completion-provider");
import("./provider/hover-provider");
import("./provider/signature-help-provider");
import("./provider/definition-provider");

import {Program} from "./provider/jass-parse";

const program = new Program("", `//! zinc
struct a {
      method a {}
}
struct b {
      method a {}
}
struct c {
      method a {}
}
//! endzinc
`);
console.log(program)
/*
//! zinc
struct a {}
//! endzinc
`);
*/
export{};