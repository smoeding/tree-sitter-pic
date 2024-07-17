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
  OR: 10,
  AND: 11,
  CMP: 20,
  ADD: 21,
  MUL: 22,
  UMINUS: 25,
  NOT: 27,
  EXP: 28,
  HIGH: 99,
};

module.exports = grammar({
  name: 'pic',

  extras: $ => [
    /\s+/,                      // whitespace
    /\\\n/,                     // line continuation
    $.comment,
  ],

  // keyword extraction optimization
  word: $ => $.variable,

  rules: {
    picture: $ => seq(
      '.PS', optional(seq($.number, optional($.number))), "\n",
      repeat($._element_list),
      choice('.PE', '.PF', '.PY'), "\n",
    ),

    _element_list: $ => choice(
      seq($.element, ";"),
      seq($.element, "\n"),
      "\n",
    ),

    element: $ => prec.left(choice(
      seq($.primitive, optional($.attribute_list)),
      seq($.placename, ':', optional(';'), $.element, optional($.position)),
      $.balanced_body,
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
    )),

    assignment: $ => choice(
      seq($.variable, optional(':'), '=', $.any_expr),
      seq('figname', '=', $.macroname),
    ),

    direction: $ => choice('up', 'down', 'left', 'right'),

    command: $ => prec.left(seq(
      'command',
      repeat1(prec.left(PREC.HIGH, choice($.text, $.expr, $.position))),
    )),

    print: $ => prec.left(seq(
      'print',
      repeat1(prec.left(PREC.HIGH, choice($.text, $.expr, $.position))),
    )),

    sh: $ => seq(
      'sh',
      $.balanced_text,
    ),

    copy: $ => seq(
      'copy',
      choice(
        alias($.text, $.filename),
        seq(
          optional(alias($.text, $.filename)),
          'thru',
          choice(
            $.macroname,
            $.balanced_body,
          ),
          optional(seq('until', $.text)),
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
      $.balanced_body,
    ),

    if: $ => seq(
      'if',
      $.any_expr,
      'then',
      $.balanced_body,
      optional(seq('else', $.balanced_body)),
    ),

    reset: $ => prec.left(seq(
      'reset',
      optional(seq($.variable, repeat(seq(optional(','), $.variable)))),
    )),

    primitive: $ => prec.left(choice(
      'box',
      'circle',
      'ellipse',
      'arc',
      'line',
      'arrow',
      'spline',
      'move',
      repeat1($.text),
      seq('plot', $.expr, $.text),
      seq('[', repeat($.element), ']')
    )),

    attribute_list: $ => prec.left(repeat1($.attribute)),

    attribute: $ => prec.left(choice(
      seq(/h(eigh)?t/, $.expr),
      seq(/wid(th)?/, $.expr),
      seq(/rad(ius)?/, $.expr),
      seq(/diam(eter)?/, $.expr),
      seq(/up|down|left|right/, optional($.expr)),
      seq(/from|to|at/, $.position),
      seq('with', choice($.path, $.position)),
      seq('by', $.expr_pair),
      'then',
      seq('dotted', optional($.expr)),
      seq('dashed', optional($.expr)),
      seq(/thick(ness)?/, $.expr),
      seq('chop', optional($.expr)),
      '->', '<-', '<->',
      /invis(ible)?/,
      'solid',
      seq(/fill(ed)?/, optional($.expr)),
      seq(/colou?r(ed)?/, $.text),
      seq(/outlined?/, $.text),
      seq('shaded', $.text),
      'same',
      /cc?w/,
      /[lr]just/,
      'above', 'below',
      'aligned',
      repeat1($.text),
      $.expr,
    )),

    position: $ => prec.left(choice(
      $.position_not_place,
      $.place,
      seq('(', $.position, ')'),
    )),

    position_not_place: $ => prec.left(choice(
      $.expr_pair,
      seq($.position, '+', $.expr_pair),
      seq($.position, '-', $.expr_pair),
      seq('(', $.position, ',', $.position, ')'),
      seq(
        $.expr,
        optional(seq('of', 'the', 'way')),
        'between',
        $.position,
        'and',
        $.position,
      ),
      seq($.expr, '<', $.position, ',', $.position, '>'),
    )),

    expr_pair: $ => prec.left(choice(
      seq($.expr, ',', $.expr),
      '(', $.expr, ')',
    )),

    place: $ => prec.left(choice(
      seq($.label, optional($.corner)),
      seq($.corner, optional('of'), $.label),
      'Here',
    )),

    label: $ => choice(
      seq($.placename, repeat(seq('.', $.placename))),
      $.nth_primitive,
    ),

    corner: $ => choice(
      '.n', '.e', '.w', '.s',
      '.ne', '.se', '.nw', '.sw',
      '.c', '.center', '.start', '.end',
      '.t', '.top', '.b', '.bot', '.bottom', '.l', '.left', '.r', '.right',
      'left', 'right',
      seq(
        choice(
          'top',
          'bottom',
          'north',
          'south',
          'east',
          'west',
          'center',
          'start',
          'end',
        ),
        'of'
      ),
      seq('upper', 'left'),
      seq('lower', 'left'),
      seq('upper', 'right'),
      seq('lower', 'right'),
    ),

    nth_primitive: $ => choice(
      seq($.ordinal, $.object_type),
      seq(optional($.ordinal), 'last', $.object_type),
    ),

    ordinal: $ => choice(
      seq($.int, choice('th', 'st', 'nd', 'rd')),
      seq('`', $.any_expr, '´th'),
    ),

    object_type: $ => choice(
      'box',
      'circle',
      'ellipse',
      'arc',
      'line',
      'arrow',
      'spline',
      '[]',
      $.text,
    ),

    path: $ => prec.left(PREC.HIGH, choice(
      $.relative_path,
      '(', $.relative_path, ',', $.relative_path, ')',
    )),

    relative_path: $ => prec.left(choice(
      $.corner,
      seq(
        repeat1(seq('.', $.placename)),
        optional($.corner),
      ),
    )),

    any_expr: $ => choice(
      $.expr,
      $.text_expr,
      prec.left(PREC.CMP, seq($.any_expr, '==', $.any_expr)),
      prec.left(PREC.CMP, seq($.any_expr, '!=', $.any_expr)),
      prec.left(PREC.AND, seq($.any_expr, '&&', $.any_expr)),
      prec.left(PREC.OR, seq($.any_expr, '||', $.any_expr)),
      prec.right(PREC.NOT, seq('!', $.any_expr)),
    ),

    text_expr: $ => seq(
      $.text,
      choice('==', '!='),
      $.text,
    ),

    expr: $ => choice(
      $.variable,
      $.number,
      prec.left(PREC.CMP, seq($.expr, '<', $.expr)),
      prec.left(PREC.CMP, seq($.expr, '>', $.expr)),
      prec.left(PREC.CMP, seq($.expr, '<=', $.expr)),
      prec.left(PREC.CMP, seq($.expr, '>=', $.expr)),
      prec.left(PREC.ADD, seq($.expr, '+', $.expr)),
      prec.left(PREC.ADD, seq($.expr, '-', $.expr)),
      prec.left(PREC.MUL, seq($.expr, '*', $.expr)),
      prec.left(PREC.MUL, seq($.expr, '/', $.expr)),
      prec.left(PREC.MUL, seq($.expr, '%', $.expr)),
      prec.right(PREC.EXP, seq($.expr, '^', $.expr)),
      prec.right(PREC.NOT, seq('!', $.expr)),
      prec(PREC.UMINUS, seq('-', $.expr)),
      seq($.func0, '(', optional($.any_expr), ')',),
      seq($.func1, '(', $.any_expr, ')'),
      seq($.func2, '(', $.any_expr, ',', $.any_expr, ')'),
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

    func0: $ => 'rand',
    func1: $ => choice('sin', 'cos', 'log', 'exp', 'sqrt', 'int', 'srand'),
    func2: $ => choice('atan2', 'max', 'min'),

    // a positive integer
    int: $ => /[1-9][0-9]*/,

    // a floating point numeric constant with optional trailing 'i'
    number: $ => /([0-9]+\.?[0-9]*|\.[0-9]+)([eE][+-]?[0-9]+)?[iI]?/,

    // a string enclosed in double quotes
    text: $ => seq(
      '"',
      /[^"]*/,
      '"',
    ),

    variable: $ => /[a-z][a-zA-Z0-9_]*/,

    placename: $ => /[A-Z][a-zA-Z0-9_]*/,

    command_line: $ => /[.\\].*/,

    // FIXME:
    balanced_text: $ => seq('{', /[^}]*/, '}'),

    // FIXME:
    balanced_body: $ => seq('{', repeat($._element_list), '}'),

    macroname: $ => choice($.variable, $.placename),

    comment: _ => token(seq('#', /.*/, "\n")),
  },
})
