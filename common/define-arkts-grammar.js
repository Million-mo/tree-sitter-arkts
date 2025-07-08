const JavaScript = require('tree-sitter-javascript/grammar');
const defineGrammar = require('./define-grammar');

module.exports = function defineArkTSGrammar() {
  const tsGrammar = defineGrammar('typescript');
  
  return grammar(tsGrammar, {
    name: 'arkts',
    
    externals: ($, previous) => previous.concat([
      $._arkts_ui_block,
    ]),
    
    conflicts: ($, previous) => previous.concat([
      [$.struct_declaration],
    ]),
    
    rules: {
      // ArkTS 特有的结构体定义
      struct_declaration: $ => prec.left('declaration', seq(
        repeat(field('decorator', $.decorator)),
        'struct',
        field('name', $._type_identifier),
        field('type_parameters', optional($.type_parameters)),
        field('body', $.class_body),
        optional($._automatic_semicolon),
      )),
      
      // 扩展声明以包含struct
      declaration: ($, previous) => choice(
        previous,
        $.struct_declaration,
      ),
      
      
    },
  });
};