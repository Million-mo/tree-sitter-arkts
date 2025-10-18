/**
 * @file paser for arkts
 * @author million
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "arkts",

  extras: $ => [
    /\s/, // whitespace
    $.comment
  ],

  conflicts: $ => [
    [$.decorator, $.at_expression],
    [$.expression, $.parameter],
    [$.expression, $.arrow_function],  // 箭头函数与表达式的歧义
    [$.expression, $.state_binding_expression],
    [$.block_statement, $.object_literal],
    [$.component_parameters, $.object_literal],
    [$.expression, $.property_assignment],
    [$.expression, $.property_name],  // 对象方法中标识符的歧义
    [$.array_literal, $.property_name],  // 计算属性名与数组字面量的歧义
    [$.function_expression, $.function_declaration],  // 函数表达式与函数声明的歧义
    [$.if_statement, $.statement],
    // 以下是 ArkTS UI 相关的必需冲突
    [$.modifier_chain_expression, $.member_expression],  // 修饰符链 `.xxx()` 与成员访问 `.xxx` 的歧义
    [$.block_statement, $.extend_function_body],  // 普通函数体与 @Extend 函数体的歧义
    [$.expression, $.extend_function_body],  // 表达式与 @Extend 函数体的歧义（modifier_chain 既是 expression 也是 extend_function_body的开始）
    [$.component_declaration],  // 支持 @Component export struct 语法的冲突
    [$.primary_type, $.qualified_type],  // as 表达式中的类型注解冲突
    [$.primary_type, $.generic_type],  // as 表达式中的泛型类型冲突
    [$.primary_type, $.array_type],  // as 表达式中的数组类型冲突
    [$.array_type],  // 数组类型本身的冲突
    [$.binary_expression, $.call_expression],  // < 符号可以是比较运算符或泛型参数
    [$.binary_expression, $.conditional_expression, $.call_expression],  // 条件表达式中的 < 歧义
    [$.binary_expression, $.member_expression],  // 可选链与二元表达式的歧义
    [$.binary_expression, $.subscript_expression],  // 可选链索引与二元表达式的歧义
    [$.binary_expression, $.call_expression, $.member_expression, $.subscript_expression],  // 可选链调用综合歧义
    [$.conditional_expression, $.call_expression, $.member_expression, $.subscript_expression],  // 条件表达式后续可选链的歧义
    [$.expression, $.qualified_type],  // 泛型调用中 identifier 与 qualified_type 的冲突
    [$.expression, $.primary_type],  // 泛型调用中 identifier 与 primary_type 的冲突
    [$.expression, $.generic_type],  // 泛型调用中 identifier 与 generic_type 的冲突
    [$.expression, $.type_annotation],  // 泛型调用中表达式与类型注解的冲突
    [$.expression, $.union_type],  // 泛型调用中表达式与联合类型的冲突
    [$.expression, $.array_type],  // 表达式与数组类型的冲突
    [$.null_literal, $.primary_type],  // null 关键字可以是字面量或类型
    [$.boolean_literal, $.primary_type],  // true/false 可以是字面量或类型
    [$.tuple_type, $.array_literal],  // 元组类型与数组字面量的冲突
    [$.argument_list, $.new_expression]  // 参数列表与 new 表达式的冲突
  ],

  rules: {
    source_file: $ => repeat(choice(
      $.import_declaration,
      $.component_declaration,
      $.interface_declaration,
      $.type_declaration,
      $.enum_declaration,  // 支持 enum 声明
      $.class_declaration,
      $.function_declaration,
      $.variable_declaration,
      $.export_declaration
    )),

    // 注释
    comment: $ => choice(
      seq('//', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
    ),

    // 导入声明
    import_declaration: $ => seq(
      'import',
      choice(
        seq($.identifier, 'from', $.string_literal),
        seq('{', commaSep($.identifier), '}', 'from', $.string_literal),
        seq('*', 'as', $.identifier, 'from', $.string_literal)
      ),
      optional(';')
    ),

    // 导出声明
    export_declaration: $ => seq(
      'export',
      choice(
        // export { ... } from '...' - 重新导出
        seq(
          '{',
          commaSep(choice(
            $.identifier,
            seq($.identifier, 'as', $.identifier)
          )),
          '}',
          optional(seq('from', $.string_literal))
        ),
        // export * from '...' - 全部导出
        seq('*', optional(seq('as', $.identifier)), 'from', $.string_literal),
        // 导出声明
        $.component_declaration,
        $.interface_declaration,
        $.type_declaration,
        $.enum_declaration,  // 支持 enum 导出
        $.class_declaration,
        $.function_declaration,
        $.variable_declaration,
        seq('default', choice(
          $.component_declaration,
          $.class_declaration,
          $.function_declaration,
          $.expression
        ))
      ),
      optional(';')
    ),

    // 装饰器 - ArkTS核心特性，支持更多装饰器类型
    decorator: $ => seq(
      '@',
      choice(
        // 常用装饰器
        'Entry',          // 入口装饰器
        'Component',
        'State', 
        'Prop',
        'Link',
        'Provide',
        'Consume',
        'Builder',
        'Styles',
        'Extend',
        'AnimatableExtend',
        'Watch',
        'StorageLink',
        'StorageProp',
        'LocalStorageLink',
        'LocalStorageProp',
        'ObjectLink',
        'Observed',
        // 或者其他自定义装饰器
        $.identifier
      ),
      optional(seq('(', commaSep($.expression), ')'))
    ),

    // 组件声明 - ArkTS核心特性
    // 支持两种格式：
    // 1. @Component struct ...
    // 2. @Component export struct ...
    component_declaration: $ => seq(
      repeat($.decorator),
      optional('export'),  // 支持装饰器后 export
      'struct',
      $.identifier,
      optional($.type_parameters),
      $.component_body
    ),

    // 组件体
    component_body: $ => seq(
      '{',
      repeat(choice(
        $.property_declaration,
        $.method_declaration,
        $.build_method
      )),
      '}'
    ),

    // 属性声明 - 支持状态管理装饰器
    property_declaration: $ => seq(
      repeat($.decorator),
      optional(choice('private', 'public', 'protected')),
      optional('static'),
      optional('readonly'),  // 支持readonly修饰符
      $.identifier,
      optional('?'),  // 支持可选属性标记
      optional(seq(':', $.type_annotation)),
      optional(seq('=', $.expression)),
      ';'
    ),

    // build方法（ArkTS特有）- 将整个内容视为一个UI描述块
    build_method: $ => seq(
      'build',
      '(',
      ')',
      optional(seq(':', $.type_annotation)),
      $.build_body
    ),

    // build方法体 - 简化为整体处理
    // 注意：$.comment 不需要显式匹配，因为它已在 extras 中定义（会被自动跳过）
    build_body: $ => prec(1, seq(
      '{',
      repeat(choice(
        $.ui_custom_component_statement,  // 自定义组件调用语句（带分号）
        $.ui_control_flow,     // UI控制流（if、ForEach等） 
        $.arkts_ui_element,    // ArkTS UI元素（组件、布局等）
        $.expression_statement  // 其他表达式
      )),
      '}'
    )),

    // 修饰符链表达式 - 专门处理以点开头的连续调用
    modifier_chain_expression: $ => prec.right(20, seq(
      '.',
      $.identifier,
      optional(seq(
        '(',
        optional(commaSep($.expression)),
        ')'
      )),
      optional($.modifier_chain_expression)  // 递归匹配后续修饰符
    )),

    // 带修饰符的UI元素 - 优先级最高，贪婪匹配所有后续修饰符
    ui_element_with_modifiers: $ => prec.right(15, seq(
      $.ui_component,
      optional($.modifier_chain_expression)
    )),

    // UI组件基础部分
    ui_component: $ => prec.right(3, choice(
      // 基础组件
      seq('Text', '(', $.expression, ')'),
      seq('Button', '(', optional(choice($.expression, $.component_parameters)), ')', optional($.container_content_body)),  // Button 也可以有子组件
      seq('Image', '(', $.expression, ')'),
      seq(choice('TextInput', 'TextArea'), '(', optional($.component_parameters), ')'),
      // 布局容器 - 使用专门的容器内容体
      seq(choice('Column', 'Row', 'Stack', 'Flex', 'Grid', 'GridRow', 'GridCol', 'List', 'ScrollList'), '(', optional($.component_parameters), ')', optional($.container_content_body)),
      // 特殊容器项
      seq(choice('ListItem', 'GridItem'), '(', optional($.component_parameters), ')', optional($.container_content_body)),
      // 自定义组件
      seq($.identifier, '(', optional(choice($.component_parameters, commaSep($.expression))), ')')
    )),

    // 容器内容体 - 专门用于布局容器的内容，区别于build_body
    // 注意：$.comment 不需要显式匹配，因为它已在 extras 中定义（会被自动跳过）
    container_content_body: $ => prec(1, seq(
      '{',
      repeat(choice(
        $.ui_custom_component_statement,  // 自定义组件调用语句（带分号）
        $.ui_control_flow,     // UI控制流
        $.arkts_ui_element,    // ArkTS UI元素
        $.expression_statement  // 其他表达式
      )),
      '}'
    )),

    // ArkTS UI元素 - 先尝试带修饰符的元素，其次是普通元素
    arkts_ui_element: $ => choice(
      $.ui_element_with_modifiers,
      $.ui_component
    ),

    // UI自定义组件调用语句 - 自定义组件调用 + 必需的分号
    // 根据ArkUI官方规范：自定义组件调用属于表达式语句，需要分号结尾
    ui_custom_component_statement: $ => prec(10, seq(
      $.identifier,  // 自定义组件名
      '(',
      optional(choice(
        $.component_parameters,
        commaSep($.expression)
      )),
      ')',
      ';'  // 必需的分号
    )),

    // UI控制流
    ui_control_flow: $ => choice(
      $.ui_if_statement,
      $.for_each_statement
    ),

    // 组件参数
    component_parameters: $ => seq(
      '{',
      commaSep($.component_parameter),
      '}'
    ),

    // 单个组件参数
    component_parameter: $ => prec(2, seq(
      $.identifier,
      ':',
      $.expression
    )),

    // ForEach语句
    for_each_statement: $ => seq(
      'ForEach',
      '(',
      $.expression, // 数据源
      ',',
      $.arrow_function, // 项构建函数
      optional(seq(',', $.expression)), // key生成器
      ')'
    ),

    // 基础语法元素
    identifier: $ => /[a-zA-Z_$][a-zA-Z0-9_$]*/,
    
    string_literal: $ => choice(
      seq('"', repeat(choice(/[^"\\]/, $.escape_sequence)), '"'),
      seq("'", repeat(choice(/[^'\\]/, $.escape_sequence)), "'")
    ),
    
    escape_sequence: $ => seq(
      '\\',
      choice(/["'\\bfnrtv]/, /\d{1,3}/, /x[0-9a-fA-F]{2}/, /u[0-9a-fA-F]{4}/)
    ),
    // 添加基本表达式支持
    expression: $ => choice(
      $.identifier,
      $.string_literal,
      $.numeric_literal,
      $.boolean_literal,
      $.null_literal,
      $.new_expression,             // new表达式
      $.await_expression,           // await表达式
      $.as_expression,              // 类型断言 (value as Type)
      $.arrow_function,
      $.function_expression,        // 函数表达式
      $.call_expression,
      $.member_expression,
      $.subscript_expression,       // 索引访问表达式 arr[index]
      $.modifier_chain_expression,  // 新增：修饰符链表达式
      $.parenthesized_expression,
      $.state_binding_expression,  // 状态绑定表达式
      $.conditional_expression,
      $.binary_expression,
      $.unary_expression,
      $.assignment_expression,
      $.array_literal,             // 数组字面量
      $.object_literal,            // 对象字面量
      $.template_literal,          // 模板字面量
      $.resource_expression,       // $r()资源表达式
      $.update_expression          // ++/--表达式
    ),

    // 状态绑定表达式（$语法）
    state_binding_expression: $ => seq(
      '$',
      choice(
        $.identifier,
        $.member_expression
      )
    ),

    numeric_literal: $ => /\d+(\.\d+)?([eE][+-]?\d+)?/,
    boolean_literal: $ => choice('true', 'false'),
    null_literal: $ => 'null',

    // 二元表达式
    binary_expression: $ => choice(
      prec.left(10, seq($.expression, '||', $.expression)),
      prec.left(10, seq($.expression, '??', $.expression)),  // 支持空值合并运算符
      prec.left(11, seq($.expression, '&&', $.expression)),
      prec.left(12, seq($.expression, '|', $.expression)),
      prec.left(13, seq($.expression, '^', $.expression)),
      prec.left(14, seq($.expression, '&', $.expression)),
      prec.left(15, seq($.expression, choice('==', '!=', '===', '!=='), $.expression)),
      prec.left(16, seq($.expression, choice('<', '>', '<=', '>=', 'instanceof', 'in'), $.expression)),
      prec.left(17, seq($.expression, choice('<<', '>>', '>>>'), $.expression)),
      prec.left(18, seq($.expression, choice('+', '-'), $.expression)),
      prec.left(19, seq($.expression, choice('*', '/', '%'), $.expression)),
      prec.left(20, seq($.expression, '**', $.expression))
    ),

    // 一元表达式
    unary_expression: $ => prec.right(21, seq(
      choice('!', '~', '-', '+', 'typeof', 'void', 'delete'),
      $.expression
    )),

    // 赋值表达式
    assignment_expression: $ => prec.right(1, seq(
      choice(
        $.identifier,
        $.member_expression
      ),
      choice('=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>='),
      $.expression
    )),

    // 条件表达式
    conditional_expression: $ => prec.right(2, seq(
      $.expression,
      '?',
      $.expression,
      ':',
      $.expression
    )),

    // @ 表达式（用于装饰器冲突解决）
    at_expression: $ => seq('@', $.expression),

    // await 表达式
    await_expression: $ => prec.right(21, seq(
      'await',
      $.expression
    )),

    // 类型断言表达式 - value as Type
    as_expression: $ => prec.left(3, seq(
      $.expression,
      'as',
      $.type_annotation
    )),

    // 其他必需的规则定义会逐步添加
    // 类型注解 - 支持数组类型、联合类型和函数类型
    type_annotation: $ => choice(
      $.conditional_type,  // 条件类型
      $.union_type,      // 联合类型
      $.function_type,   // 函数类型
      $.primary_type     // 基础类型
    ),

    // 基础类型
    primary_type: $ => choice(
      'number',
      'string',
      'boolean',
      'void',
      'any',
      'null',
      'undefined',
      'true',
      'false',
      $.array_type,
      $.tuple_type,      // 元组类型，如 [string, number]
      $.generic_type,    // 泛型类型，如 Promise<void>、Array<string>
      $.qualified_type,  // 限定类型名，如 window.WindowStage
      $.identifier
    ),

    // 泛型类型 - 支持 Type<T> 或 Type<T, U> 形式
    generic_type: $ => prec.left(seq(
      choice(
        $.identifier,
        $.qualified_type  // 支持 namespace.Type<T>
      ),
      $.type_arguments
    )),

    // 类型参数（用于泛型类型）
    type_arguments: $ => seq(
      '<',
      commaSep($.type_annotation),  // 类型参数可以是任意类型注解
      '>'
    ),

    // 限定类型名 - 支持 namespace.Type 形式
    qualified_type: $ => prec.left(seq(
      $.identifier,
      repeat1(seq('.', $.identifier))
    )),

    // 联合类型 - A | B | C
    union_type: $ => prec.left(2, seq(
      $.primary_type,
      repeat1(seq('|', $.primary_type))
    )),

    // 函数类型 - (param: Type) => ReturnType
    function_type: $ => prec.right(3, seq(
      $.parameter_list,
      '=>',
      $.type_annotation
    )),

    // 数组类型
    array_type: $ => seq(
      choice(
        'number',
        'string',
        'boolean',
        'any',
        $.identifier
      ),
      repeat1(seq('[', ']'))
    ),

    // 元组类型 - [A, B, C]
    tuple_type: $ => seq(
      '[',
      commaSep($.type_annotation),
      ']'
    ),

    // 条件类型 - T extends U ? X : Y
    conditional_type: $ => prec.right(1, seq(
      $.primary_type,
      'extends',
      $.type_annotation,
      '?',
      $.type_annotation,
      ':',
      $.type_annotation
    )),

    // 类型参数声明（用于声明泛型类、函数等）
    type_parameters: $ => seq(
      '<',
      commaSep($.type_parameter),
      '>'
    ),

    // 单个类型参数 - 支持约束和默认值
    type_parameter: $ => seq(
      $.identifier,
      optional(seq('extends', $.type_annotation)),  // 泛型约束
      optional(seq('=', $.type_annotation))  // 泛型默认值
    ),

    // 基本语句类型
    expression_statement: $ => seq($.expression, optional(';')),
    if_statement: $ => prec.right(seq(
      'if',
      '(',
      $.expression,
      ')',
      choice($.block_statement, $.statement),
      optional(seq('else', choice($.if_statement, $.block_statement, $.statement)))
    )),
    
    // UI中的if语句（不需要大括号）
    ui_if_statement: $ => seq(
      'if',
      '(',
      $.expression,
      ')',
      '{',
      repeat(choice(
        $.arkts_ui_element,
        $.ui_control_flow,
        $.expression_statement
      )),
      '}',
      optional(seq('else', '{', repeat(choice(
        $.arkts_ui_element,
        $.ui_control_flow, 
        $.expression_statement
      )), '}'))
    ),

    // 方法声明 
    method_declaration: $ => seq(
      repeat($.decorator),
      optional(choice('private', 'public', 'protected')),
      optional('static'),
      optional('async'),
      $.identifier,
      optional($.type_parameters),
      $.parameter_list,
      optional(seq(':', $.type_annotation)),
      choice($.block_statement, ';')
    ),

    parameter_list: $ => seq(
      '(',
      commaSep($.parameter),
      ')'
    ),

    parameter: $ => seq(
      optional('...'),  // 支持剩余参数
      $.identifier,
      optional('?'),  // 支持可选参数
      optional(seq(':', $.type_annotation)),
      optional(seq('=', $.expression))
    ),

    block_statement: $ => seq(
      '{',
      repeat($.statement),
      '}'
    ),

    statement: $ => choice(
      $.expression_statement,
      $.if_statement,
      $.variable_declaration,
      $.return_statement,
      $.try_statement,  // try/catch/finally 语句
      $.throw_statement,  // throw 语句
      $.for_statement,  // for 循环
      $.while_statement,  // while 循环
      $.break_statement,  // break 语句
      $.continue_statement  // continue 语句
    ),

    variable_declaration: $ => seq(
      choice('var', 'let', 'const'),
      commaSep($.variable_declarator),
      ';'
    ),

    variable_declarator: $ => seq(
      $.identifier,
      optional(seq(':', $.type_annotation)),
      optional(seq('=', $.expression))
    ),

    return_statement: $ => seq(
      'return',
      optional($.expression),
      ';'
    ),

    // try/catch/finally 语句
    try_statement: $ => seq(
      'try',
      $.block_statement,
      optional($.catch_clause),
      optional($.finally_clause)
    ),

    catch_clause: $ => seq(
      'catch',
      optional(seq(
        '(',
        $.identifier,  // 异常变量名
        optional(seq(':', $.type_annotation)),  // 可选类型注释
        ')'
      )),
      $.block_statement
    ),

    finally_clause: $ => seq(
      'finally',
      $.block_statement
    ),

    // throw 语句
    throw_statement: $ => seq(
      'throw',
      $.expression,
      ';'
    ),

    // for 循环
    for_statement: $ => seq(
      'for',
      '(',
      choice(
        seq($.variable_declaration, $.expression, ';', optional($.expression)),  // for (let i = 0; i < 10; i++)
        seq(optional($.expression), ';', optional($.expression), ';', optional($.expression))  // for (; i < 10; i++)
      ),
      ')',
      choice($.block_statement, $.statement)
    ),

    // while 循环
    while_statement: $ => seq(
      'while',
      '(',
      $.expression,
      ')',
      choice($.block_statement, $.statement)
    ),

    // break 语句
    break_statement: $ => seq(
      'break',
      optional($.identifier),  // 可选标签
      ';'
    ),

    // continue 语句
    continue_statement: $ => seq(
      'continue',
      optional($.identifier),  // 可选标签
      ';'
    ),

    // 基本表达式支持
    arrow_function: $ => prec.right(1, seq(
      optional('async'),  // 支持异步箭头函数
      choice(
        $.identifier,
        $.parameter_list
      ),
      optional(seq(':', $.type_annotation)),  // 支持返回类型注解
      '=>',
      choice(
        prec(2, $.block_statement),  // 提高优先级，确保 {} 被优先解析为块语句而不是空对象
        $.expression
      )
    )),

    // 函数表达式 - 支持匿名和命名函数表达式
    function_expression: $ => seq(
      optional('async'),  // 支持异步函数表达式
      'function',
      optional($.identifier),  // 可选的函数名
      optional($.type_parameters),
      $.parameter_list,
      optional(seq(':', $.type_annotation)),
      $.block_statement
    ),

    // 调用表达式 - 降低优先级，避免与修饰符链冲突
    // 支持泛型调用，如 func<T>(arg)
    call_expression: $ => prec.left(1, seq(
      $.expression,
      optional($.type_arguments),  // 支持泛型参数
      choice(
        seq('?.', $.argument_list),  // 支持可选链调用 fn?.(args)
        $.argument_list
      )
    )),

    // 参数列表（用于函数调用）
    argument_list: $ => seq(
      '(',
      commaSep(choice(
        $.expression,
        $.spread_element  // 支持展开运算符
      )),
      ')'
    ),

    // 展开元素
    spread_element: $ => seq('...', $.expression),

    // 成员表达式 - 降低优先级，避免与修饰符链冲突
    // 支持可选链 ?.
    member_expression: $ => prec.left(1, seq(
      $.expression,
      choice('.', '?.'),  // 支持 . 和 ?.
      $.identifier
    )),

    // 索引访问表达式 - arr[index]
    subscript_expression: $ => prec.left(19, seq(
      $.expression,
      optional('?.'),  // 支持可选链索引访问 obj?.[expr]
      '[',
      $.expression,
      ']'
    )),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),

    // 接口和类型声明基础支持
    interface_declaration: $ => seq(
      'interface',
      $.identifier,
      optional($.type_parameters),
      $.object_type
    ),

    type_declaration: $ => seq(
      'type',
      $.identifier,
      optional($.type_parameters),
      '=',
      $.type_annotation,
      ';'
    ),

    // enum 声明 - 支持 const enum 和普通 enum
    enum_declaration: $ => seq(
      optional('const'),
      'enum',
      $.identifier,
      $.enum_body
    ),

    // enum 体
    enum_body: $ => seq(
      '{',
      commaSep($.enum_member),
      optional(','),  // 允许末尾逗号
      '}'
    ),

    // enum 成员
    enum_member: $ => seq(
      $.identifier,
      optional(seq('=', $.expression))  // 支持数字和字符串值
    ),

    class_declaration: $ => seq(
      repeat($.decorator),
      optional('abstract'),
      'class',
      $.identifier,
      optional($.type_parameters),
      optional(seq('extends', $.type_annotation)),
      optional($.implements_clause),
      $.class_body
    ),

    class_body: $ => seq(
      '{',
      repeat(choice(
        $.property_declaration,
        $.method_declaration,
        $.constructor_declaration
      )),
      '}'
    ),

    // implements 子句
    implements_clause: $ => seq(
      'implements',
      commaSep(choice(
        $.identifier,
        $.generic_type  // 支持实现泛型接口
      ))
    ),

    constructor_declaration: $ => seq(
      optional(choice('private', 'public', 'protected')),
      'constructor',
      $.parameter_list,
      $.block_statement
    ),

    function_declaration: $ => seq(
      repeat($.decorator),  // 支持装饰器，如@Extend
      optional('async'),
      'function',
      $.identifier,
      optional($.type_parameters),
      $.parameter_list,
      optional(seq(':', $.type_annotation)),
      choice(
        $.block_statement,
        $.extend_function_body  // @Extend函数的特殊函数体
      )
    ),

    // @Extend函数的特殊函数体 - 允许直接以修饰符链开始
    // 注意：$.comment 不需要显式匹配，因为它已在 extras 中定义（会被自动跳过）
    extend_function_body: $ => seq(
      '{',
      $.modifier_chain_expression,  // 至少一个修饰符链
      repeat($.modifier_chain_expression),
      '}'
    ),

    object_type: $ => seq(
      '{',
      repeat(seq(
        $.type_member,
        optional(choice(';', ','))  // 支持分号或逗号分隔
      )),
      '}'
    ),

    type_member: $ => choice(
      // 方法签名 - 需要更高优先级，因为有参数列表
      prec(1, seq(
        $.identifier,
        optional($.type_parameters),
        $.parameter_list,
        optional(seq(':', $.type_annotation))
      )),
      // 属性签名
      seq(
        $.identifier,
        optional('?'),
        ':',
        $.type_annotation
      )
    ),

    // 数组字面量
    array_literal: $ => seq(
      '[',
      commaSep(optional(choice(
        $.expression,
        seq('...', $.expression)  // 支持展开语法
      ))),
      ']'
    ),

    // 对象字面量
    object_literal: $ => seq(
      '{',
      commaSep($.property_assignment),
      optional(','),  // 支持尾随逗号
      '}'
    ),

    // 属性赋值
    property_assignment: $ => choice(
      // 对象方法（包括 async）
      seq(
        optional('async'),
        $.property_name,
        optional($.type_parameters),
        $.parameter_list,
        optional(seq(':', $.type_annotation)),
        $.block_statement
      ),
      seq($.property_name, ':', $.expression),
      $.identifier,  // 简写属性
      seq('...', $.expression)  // 展开运算符
    ),

    // 属性名
    property_name: $ => choice(
      $.identifier,
      $.string_literal,
      $.numeric_literal,
      seq('[', $.expression, ']')  // 计算属性名
    ),

    // 模板字面量
    template_literal: $ => seq(
      '`',
      repeat(choice(
        $.template_chars,
        $.template_substitution
      )),
      '`'
    ),

    // 模板字符
    template_chars: $ => /[^`$\\]+|\\./,

    // 模板替换
    template_substitution: $ => seq(
      '$',
      '{',
      $.expression,
      '}'
    ),

    // 资源表达式 $r()
    resource_expression: $ => seq(
      '$r',
      '(',
      $.string_literal,
      ')'
    ),

    // 更新表达式 ++/--
    update_expression: $ => choice(
      prec.left(22, seq($.expression, choice('++', '--'))),
      prec.right(22, seq(choice('++', '--'), $.expression))
    ),

    // new表达式 - 支持泛型实例化
    new_expression: $ => prec.right(21, seq(
      'new',
      $.expression,
      optional($.type_arguments),  // 支持泛型参数，如 new Class<T>()
      optional(seq(
        '(',
        commaSep($.expression),
        ')'
      ))
    ))
  }
});

// 辅助函数
function commaSep(rule) {
  return optional(seq(rule, repeat(seq(',', rule))));
}
