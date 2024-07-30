# Tree-sitter grammar for the PIC language

[![License](https://img.shields.io/github/license/smoeding/tree-sitter-pic.svg)](https://raw.githubusercontent.com/smoeding/tree-sitter-pic/master/LICENSE)
[![Build Status](https://github.com/smoeding/tree-sitter-pic/actions/workflows/ci.yaml/badge.svg)](https://github.com/smoeding/tree-sitter-pic/actions/workflows/ci.yaml)

Pic is a domain-specific language by Brian W. Kernighan for specifying diagrams. It is mostly used in combination with the [groff](https://www.gnu.org/software/groff/) typesetting system but is also a valid input format for some programs found in the [plotutils](https://www.gnu.org/software/plotutils/) package.

A typical document preparation workflow using the PIC preprocessor could look like this:

[<img alt="PIC demo" src="doc/demo.png" />]

The following input was used to create this picture:

``` pic
.PS
ellipse "document"
arrow
box "PIC"
arrow
box "TBL/EQN" "(optional)" dashed
arrow
box "TROFF"
arrow
ellipse "typesetter"
.PE
```

## References

1. Brian W. Kernighan, [PIC - A Graphics Language for Typesetting - User Manual](https://raw.githubusercontent.com/smoeding/tree-sitter-pic/main/doc/PIC_-_A_Graphics_Language_for_Typesetting_-_User_Manual.pdf)
1. Eric S. Raymond, [Making Pictures with GNU PIC](https://raw.githubusercontent.com/smoeding/tree-sitter-pic/main/doc/Making_Pictures_with_GNU_PIC.pdf)
1. W. Richard Stevens, [Examples of pic Macros](https://raw.githubusercontent.com/smoeding/tree-sitter-pic/main/doc/Examples_of_pic_Macros.pdf)
