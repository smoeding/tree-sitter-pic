# Tree-sitter grammar for the PIC language

[![License](https://img.shields.io/github/license/smoeding/tree-sitter-pic.svg)](https://raw.githubusercontent.com/smoeding/tree-sitter-pic/master/LICENSE)
[![Build Status](https://github.com/smoeding/tree-sitter-pic/actions/workflows/ci.yaml/badge.svg)](https://github.com/smoeding/tree-sitter-pic/actions/workflows/ci.yaml)

Pic is a domain-specific language by Brian W. Kernighan for specifying diagrams. It is mostly used in combination with the [groff](https://www.gnu.org/software/groff/) typesetting system but is also a valid input format for some programs found in the [plotutils](https://www.gnu.org/software/plotutils/) package.

A typical document preparation workflow using the PIC preprocessor could look like this:

![PIC demo](https://github.com/smoeding/tree-sitter-pic/blob/main/doc/demo.png?raw=true)

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

## Limitations

The following limitations are known.

#### Macros definitions and macro parameters may be parsed incorrectly

Macros are not part of the Pic language. When the scanner finds a macro call, it does a simple text replacement using the macro parameters. Neither the macro definition nor the macro call needs to be a correct Pic statement or expression. This makes is impossible to parse all macros correctly.

See the following example which is perfectly legal code for `pic`:

``` pic
define foo { circle at $1 $2 }
foo((2,2), diam 1)
foo((3,5), rad 1)
```

#### The copy thru statement may be parsed incorrectly

Consider the following piece of code:

``` pic
copy thru X
  box "$1"
X
10
```

When GNU pic parses this code, it checks if `X` has been defined as a macro. If it is a macro, then it is called using the following three lines as data. If `X` is not defined as a macro, then it is parsed as a character delimiter and the block between the two `X` characters is used as an inline macro.

The tree-sitter implementation doesn't record the defined macros and may therefore parse this specific piece of code differently. You can use longer macro names and non-alphabetic letters as inline macro delimiters to avoid this ambiguity.

## References

1. Brian W. Kernighan, [PIC - A Graphics Language for Typesetting - User Manual](https://raw.githubusercontent.com/smoeding/tree-sitter-pic/main/doc/PIC_-_A_Graphics_Language_for_Typesetting_-_User_Manual.pdf)
1. Eric S. Raymond, [Making Pictures with GNU PIC](https://raw.githubusercontent.com/smoeding/tree-sitter-pic/main/doc/Making_Pictures_with_GNU_PIC.pdf)
1. W. Richard Stevens, [Examples of pic Macros](https://raw.githubusercontent.com/smoeding/tree-sitter-pic/main/doc/Examples_of_pic_Macros.pdf)
