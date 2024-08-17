// Copyright (c) 2024 Stefan Möding
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

const PREC = {
  DOT: 10,                      // '.'

  PLOT: 11,

  TEXT: 12,
  SPRINTF: 12,

  LJUST: 13,
  RJUST: 13,
  ABOVE: 13,
  BELOW: 13,

  LEFT: 14,
  RIGHT: 14,

  CHOP: 15,
  SOLID: 15,
  DASHED: 15,
  DOTTED: 15,
  UP: 15,
  DOWN: 15,
  FILL: 15,
  COLORED: 15,
  OUTLINED: 15,

  XSLANTED: 16,
  YSLANTED: 16,

  LABEL: 17,

  VARIABLE: 18,
  NUMBER: 18,
  BRACKET: 18,                  // '('
  FUN: 18,
  SIN: 18,
  COS: 18,
  ATAN2: 18,
  LOG: 18,
  EXP: 18,
  SQRT: 18,
  K_MAX: 18,
  K_MIN: 18,
  INT: 18,
  RAND: 18,
  SRAND: 18,
  LAST: 18,

  ORDINAL: 19,
  HERE: 19,
  GRAVEACCENT: 19,              // '`'

  BOX: 20,
  CIRCLE: 20,
  ELLIPSE: 20,
  ARC: 20,
  LINE: 20,
  ARROW: 20,
  SPLINE: 20,
  SQUAREBRACKET: 20,            // '['

  HEIGHT: 21,
  RADIUS: 21,
  WIDTH: 21,
  DIAMETER: 21,
  FROM: 21,
  TO: 21,
  AT: 21,
  THICKNESS: 21,

  DOT_N: 22,
  DOT_E: 22,
  DOT_W: 22,
  DOT_S: 22,
  DOT_NE: 22,
  DOT_SE: 22,
  DOT_NW: 22,
  DOT_SW: 22,
  DOT_C: 22,

  DOT_START: 23,
  DOT_END: 23,
  TOP: 23,
  BOTTOM: 23,
  LEFT_CORNER: 23,
  RIGHT_CORNER: 23,

  UPPER: 24,
  LOWER: 24,
  NORTH: 24,
  SOUTH: 24,
  EAST: 24,
  WEST: 24,
  CENTER: 24,
  START: 24,
  END: 24,

  COMMA: 25,                    // ','

  OROR: 26,                     // '||'

  ANDAND: 27,                   // '&&'

  EQUALEQUAL: 28,               // '=='
  NOTEQUAL: 28,                 // '!='

  LESS: 29,                     // '<'
  GREATER: 29,                  // '>'
  LESSEQUAL: 29,                // '<='
  GREATEREQUAL: 29,             // '>='

  BETWEEN: 30,
  OF: 30,

  AND: 31,

  ADD: 32,                      // '+' '-'
  MUL: 33,                      // '*' '/' '%'
  UMINUS: 34,                   // unary '-'
  NOT: 34,                      // '!' right associative
  EXP: 35,                      // '^' right associative
};

module.exports = grammar({
  name: 'pic',

  extras: $ => [
    /\s+/,                      // whitespace
    /\\\n/,                     // line continuation
    $.comment,
  ],

  externals: $ => [
    $._side,                    // "left" or "right"
    $._side_corner,             // "left of" or "right of"
    $.delimiter,                // " or { or X or ...
    $.shell_command,
    $.data_table,
    $.data_table_tag,
  ],

  // keyword extraction optimization
  word: $ => $.variable,

  rules: {
    picture: $ => seq(
      repeat(seq($._element_list, repeat1($._nl))),
    ),

    _element_list: $ => seq(
      $.element,
      repeat(seq(repeat1(";"), $.element)),
      repeat(";"),
    ),

    block: $ => seq(
      '[',
      repeat($._nl),
      repeat(seq($._element_list, repeat1($._nl))),
      optional($._element_list),
      ']',
    ),

    delimited: $ => seq(
      '{',
      repeat($._nl),
      repeat(seq($._element_list, repeat1($._nl))),
      optional($._element_list),
      '}',
    ),

    _placeless_element: $ => choice(
      $.assignment,
      $.direction,
      $.command_line,
      $.command,
      $.print,
      $.sh,
      $.copy,
      $.for,
      $.if,
      $.reset,
      $.define,
      $.undef,
    ),

    define: $ => seq(
      'define',
      $._macroname,
      $.delimited,
    ),

    undef: $ => seq(
      'undef',
      $._macroname,
    ),

    reset: $ => seq(
      'reset',
      optional(prec.left(seq(
        $.variable,
        repeat(seq(optional(','), $.variable))
      ))),
    ),

    print_args: $ => repeat1($.print_arg),

    print_arg: $ => choice(
      prec.left(PREC.COMMA, $.expr),     // prec ','
      $._text,
      prec.left(PREC.COMMA, $.position), // prec ','
    ),

    if: $ => seq(
      'if',
      $._any_expr,
      'then',
      $.delimited,
      optional(seq('else', $.delimited)),
    ),

    _any_expr: $ => choice(
      $.expr,
      $.text_expr,
    ),

    text_expr: $ => choice(
      prec.left(PREC.EQUALEQUAL, seq($._text, '==', $._text)),
      prec.left(PREC.NOTEQUAL, seq($._text, '!=', $._text)),
      prec.left(PREC.ANDAND, seq($.text_expr, '&&', $.text_expr)),
      prec.left(PREC.ANDAND, seq($.text_expr, '&&', $.expr)),
      prec.left(PREC.ANDAND, seq($.expr, '&&', $.text_expr)),
      prec.left(PREC.OROR, seq($.text_expr, '||', $.text_expr)),
      prec.left(PREC.OROR, seq($.text_expr, '||', $.expr)),
      prec.left(PREC.OROR, seq($.expr, '||', $.text_expr)),
      prec.right(PREC.NOT, seq('!', $.text_expr)),
    ),

    element: $ => choice(
      seq($.primitive, optional($.attribute_list)),
      seq($.block, optional($.attribute_list)),
      seq($.label, ':', optional(';'), $.element),
      seq($.label, ':', optional(';'), $.position_not_place),
      seq($.label, ':', optional(';'), $.place),
      seq($.delimited, optional($.element)),
      $._placeless_element,
    ),

    primitive: $ => choice(
      'box',
      'circle',
      'ellipse',
      'arc',
      'line',
      'arrow',
      'move',
      'spline',
      prec(PREC.TEXT, repeat1($._text)),
      seq('plot', $.expr, $._text),
    ),

    attribute_list: $ => prec.left(repeat1($.attribute)),

    attribute: $ => prec.left(choice(
      seq(/h(eigh)?t/, $.expr),
      seq(/rad(ius)?/, $.expr),
      seq(/wid(th)?/, $.expr),
      seq(/diam(eter)?/, $.expr),
      $.expr,
      prec.right(seq('up', optional($.expr))),
      prec.right(seq('down', optional($.expr))),
      prec.right(seq($._side, optional($.expr))),
      seq('from', $.position),
      seq('to', $.position),
      seq('at', $.position),
      seq('with', $.path),
      seq('with', $.position),
      seq('by', $.expr_pair),
      'then',
      'solid',
      prec.right(seq('dotted', optional($.expr))),
      prec.right(seq('dashed', optional($.expr))),
      prec.right(seq(/fill(ed)?/, optional($.expr))),
      seq('xslanted', $.expr),
      seq('yslanted', $.expr),
      seq('shaded', $._text),
      seq(/colou?r(ed)?/, $._text),
      seq(/outlined?/, $._text),
      prec.right(seq('chop', optional($.expr))),
      'same',
      /invis(ible)?/,
      choice('<-', '->', '<->'),
      /cc?w/,
      $._text,
      /[lr]just/,
      'above',
      'below',
      seq(/thick(ness)?/, $.expr),
      'aligned',
    )),

    _text: $ => choice(
      prec.left(PREC.TEXT, $.text),
      prec.left(PREC.SPRINTF, alias($._sprintf, $.function_call)),
    ),

    _sprintf: $ => seq(
      alias('sprintf', $.func),
      '(',
      $.text,
      repeat(prec.left(seq(',', $.expr))),
      ')',
    ),

    position: $ => choice(
      $.position_not_place,
      $.place,
      seq('(', $.place, ')'),
    ),

    position_not_place: $ => choice(
      $.expr_pair,
      prec(PREC.ADD, seq($.position, choice('+', '-'), $.expr_pair)),
      seq('(', $.position, choice('+', '-'), $.expr_pair, ')'),
      seq('(', $.position, ',', $.position, ')'),
      seq(
        $.expr,
        optional(seq('of', 'the', 'way')),
        'between',
        $.position,
        'and',
        $.position,
      ),
      seq(
        '(',
        $.expr,
        optional(seq('of', 'the', 'way')),
        'between',
        $.position,
        'and',
        $.position,
        ')',
      ),
      seq($.expr, '<', $.position, ',', $.position, '>'),
    ),

    expr_pair: $ => choice(
      seq($.expr, ',', $.expr),
      seq('(', $.expr_pair, ')'),
    ),

    place: $ => prec.right(choice(
      $._label,
      seq($._label, $.corner),
      seq($.corner, optional('of'), $._label),
      'Here',
    )),

    _label: $ => prec.right(choice(
      seq($.label, optional($.composite_label)),
      $.nth_primitive,
    )),

    ordinal: $ => choice(
      prec(PREC.ORDINAL, /[1-9][0-9]*(th|st|nd|rd)/),
      prec(PREC.GRAVEACCENT, seq('`', $._any_expr, '´th')),
    ),

    nth_primitive: $ => prec.left(choice(
      seq($.ordinal, $.object_type),
      prec(PREC.LAST, seq(optional($.ordinal), 'last', $.object_type)),
    )),

    object_type: $ => choice(
      'box',
      'circle',
      'ellipse',
      'arc',
      'line',
      'arrow',
      'spline',
      seq('[', ']'),
      $._text,
    ),

    label_path: $ => repeat1(prec(PREC.LABEL, $.composite_label)),

    relative_path: $ => prec.left(choice(
      prec(PREC.CHOP, $.corner),
      prec(PREC.TEXT, $.label_path),
      seq($.label_path, $.corner),
    )),

    path: $ => choice(
      $.relative_path,
      seq('(', $.relative_path, ',', $.relative_path, ')'),
      // The rest of these rules are a compatibility sop.
      prec(PREC.LAST, seq($.ordinal, 'last', $.object_type, $.relative_path)),
      prec(PREC.LAST, seq('last', $.object_type, $.relative_path)),
      seq($.ordinal, $.object_type, $.relative_path),
      seq($.label, $.relative_path),
    ),

    corner: $ => choice(
      '.n', '.t', '.top',
      '.e', '.r', '.right',
      '.w', '.l', '.left',
      '.s', '.b', '.bot', '.bottom',
      '.ne', '.se', '.nw', '.sw',
      /\.c(enter)?/,
      '.start', '.end',
      seq(
        choice(
          'top', 'bottom',
          $._side_corner,       // left/right
          'north', 'south', 'east', 'west',
          'center', 'start', 'end'
        ),
        'of',
      ),
      seq(choice('upper', 'lower'), choice('left', 'right')),
    ),

    assignment: $ => choice(
      seq(
        field('lhs', $.variable),
        optional(':'),
        '=',
        field('rhs', $._any_expr),
      ),
      seq(
        field('lhs', alias('figname', $.variable)),
        '=',
        field('rhs', $._macroname),
      ),
    ),

    direction: $ => choice('up', 'down', 'left', 'right'),

    command: $ => seq(
      'command',
      $.print_args,
    ),

    print: $ => seq(
      'print',
      $.print_args,
    ),

    sh: $ => seq(
      'sh',
      $.delimiter,
      optional($.shell_command),
      $.delimiter,
    ),

    copy: $ => seq(
      'copy',
      choice(
        alias($._text, $.filename),
        seq(
          optional(alias($._text, $.filename)),
          'thru',
          choice(
            $._macroname,
            $.delimited,
          ),
          optional(seq('until', $.data_table_tag)),
          optional($.data_table),
        ),
      ),
    ),

    for: $ => seq(
      'for',
      $.variable,
      '=',
      $.expr,
      'to',
      $.expr,
      optional(seq('by', optional('*'), $.expr)),
      'do',
      $.delimited,
    ),

    expr: $ => choice(
      $.variable,
      $.number,
      $.macroparameter,
      seq($.place, $.place_attribute),
      prec.left(PREC.ADD, seq($.expr, choice('+', '-'), $.expr)),
      prec.left(PREC.MUL, seq($.expr, choice('*', '/', '%', $.expr))),
      prec.right(PREC.EXP, seq($.expr, '^', $.expr)),
      prec(PREC.UMINUS, seq('-', $.expr)),
      seq('(', $._any_expr, ')'),
      $.function_call,
      prec.left(PREC.LESS, seq($.expr, '<', $.expr)),
      prec.left(PREC.LESSEQUAL, seq($.expr, '<=', $.expr)),
      prec.left(PREC.GREATER, seq($.expr, '>', $.expr)),
      prec.left(PREC.GREATEREQUAL, seq($.expr, '>=', $.expr)),
      prec.left(PREC.EQUALEQUAL, seq($.expr, '==', $.expr)),
      prec.left(PREC.NOTEQUAL, seq($.expr, '!=', $.expr)),
      prec.left(PREC.ANDAND, seq($.expr, '&&', $.expr)),
      prec.left(PREC.OROR, seq($.expr, '||', $.expr)),
      prec.right(PREC.NOT, seq('!', $.expr)),
    ),

    place_attribute: $ => choice(
      '.x',
      '.y',
      '.ht',
      '.height',
      '.wid',
      '.width',
      '.rad',
    ),

    // internal function calls (zero, one or two args) and also
    // macros calls (up to 9 args)
    function_call: $ => prec(PREC.FUN, seq(
      alias(choice($.variable, $.label), $.func),
      '(',
      optional(seq($._any_expr, repeat(seq(',', $._any_expr)))),
      ')',
    )),

    // a floating point numeric constant with optional trailing 'i'
    number: $ => /([0-9]+\.?[0-9]*|\.[0-9]+)([eE][+-]?[0-9]+)?[iI]?/,

    // a string enclosed in double quotes
    text: $ => seq('"', repeat($._string), '"'),

    _string: $ => choice(/[^"\\]+/, $.escape_sequence),

    // Escape sequences like font switching as used by troff
    escape_sequence: $ => choice(
      /\\\(../,
      /\\f[0-9]/,
      /\\[*fgn]./,
      /\\[*fgn]\(../,
      /\\s[+-]?[0-9]/,
      /\\./,
    ),

    variable: $ => /[a-z][a-zA-Z0-9_]*/,

    label: $ => /[A-Z][a-zA-Z0-9_]*/,

    composite_label: $ => /\.[A-Z][a-zA-Z0-9_]*/,

    command_line: $ => /[.\\].*/,

    _macroname: $ => alias(choice($.variable, $.label), $.macroname),

    macroparameter: $ => /\$[0-9]/,

    comment: _ => token(/#.*/),

    _nl: _ => "\n",
  },
})
