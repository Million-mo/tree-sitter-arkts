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
    [$.block_statement, $.ui_arrow_function_body, $.object_literal],  // 箭头函数体的歧义：普通块/UI块/对象字面量
    [$.ui_arrow_function_body, $.object_literal],  // UI箭头函数体与对象字面量的歧义
    [$.component_parameters, $.object_literal],
    [$.expression, $.property_assignment],
    [$.expression, $.property_name],  // 对象方法中标识符的歧义
    [$.array_literal, $.property_name],  // 计算属性名与数组字面量的歧义
    [$.function_expression, $.function_declaration],  // 函数表达式与函数声明的歧义
    [$.if_statement, $.statement],
    [$.ui_if_statement, $.statement],  // ui_if_statement 与 statement 的歧义
    [$.conditional_expression, $.parameter],  // 条件表达式与可选参数的歧义
    [$.conditional_expression, $.binary_expression],  // 条件表达式与二元表达式的歧义（关键修复！）
    [$.conditional_expression, $.property_assignment],  // 条件表达式与对象属性赋值的歧义（修复 identifier ? identifier : value 语法）
    // 以下是 ArkTS UI 相关的必需冲突
    [$.modifier_chain_expression, $.member_expression],  // 修饰符链 `.xxx()` 与成员访问 `.xxx` 的歧义
    [$.block_statement, $.extend_function_body],  // 普通函数体与 @Extend 函数体的歧义
    [$.block_statement, $.builder_function_body],  // 普通函数体与 @Builder 函数体的歧义
    [$.block_statement, $.ui_arrow_function_body],  // 普通块语句与UI箭头函数体的歧义
    [$.statement, $.builder_function_body],  // 语句与 @Builder 函数体的歧义
    [$.statement, $.ui_arrow_function_body],  // 语句与UI箭头函数体的歧义
    [$.ui_if_statement, $.block_statement, $.object_literal],  // ui_if_statement 与 block_statement/object_literal 的歧义
    [$.expression, $.extend_function_body],  // 表达式与 @Extend 函数体的歧义（modifier_chain 既是 expression 也是 extend_function_body的开始）
    [$.arkts_ui_element, $.expression],  // UI元素既可以是arkts_ui_element也可以是expression（用于ForEach箭头函数返回值）
    [$.component_declaration],  // 支持 @Component export struct 语法的冲突
    [$.decorated_export_declaration, $.component_declaration],  // @Component export struct 既可以匹配 component_declaration 也可以匹配 decorated_export_declaration
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
    [$.argument_list, $.new_expression],  // 参数列表与 new 表达式的冲突
    [$.primary_type, $.parameter],  // 括号类型与函数参数列表的冲突
    [$.expression, $.primary_type, $.parameter],  // 括号类型与函数参数列表的三方冲突
    [$.parenthesized_expression, $.parenthesized_type],  // 括号表达式与括号类型的冲突
    [$.conditional_expression, $.conditional_type]  // 条件表达式与条件类型的冲突
  ],

  rules: {
    source_file: $ => repeat(choice(
      $.import_declaration,
      $.decorated_export_declaration,  // 带装饰器的导出声明（包括 @Component export struct）
      $.decorated_function_declaration,  // 带装饰器的函数声明
      $.component_declaration,  // 非导出的组件声明
      $.interface_declaration,
      $.type_declaration,
      $.enum_declaration,  // 支持 enum 声明
      $.class_declaration,
      $.function_declaration,
      $.variable_declaration,
      $.export_declaration,
      $.expression_statement  // 支持顶层表达式语句（如动态import()）
    )),

    // 注释
    comment: $ => token(choice(
      seq('//', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
    )),

    // 导入声明
    import_declaration: $ => seq(
      'import',
      choice(
        // 混合导入：import defaultExport, { namedExport } from '...'
        seq(
          $.identifier,
          ',',
          '{', commaSep($.import_specifier), '}',
          'from',
          $.string_literal
        ),
        // 默认导入：import identifier from '...'
        seq($.identifier, 'from', $.string_literal),
        // 命名导入：import { ... } from '...'
        seq('{', commaSep($.import_specifier), '}', 'from', $.string_literal),
        // 全部导入：import * as identifier from '...'
        seq('*', 'as', $.identifier, 'from', $.string_literal)
      ),
      optional(';')
    ),

    // 导入说明符 - 支持 as 别名
    import_specifier: $ => choice(
      $.identifier,
      seq($.identifier, 'as', $.identifier)
    ),

    // 带装饰器的导出声明（用于 @Builder export function、@Observed export class、@Component export struct 等）
    decorated_export_declaration: $ => seq(
      repeat1($.decorator),  // 至少一个装饰器
      'export',
      choice(
        // export function with special body
        seq(
          optional('async'),
          'function',
          $.identifier,
          optional($.type_parameters),
          $.parameter_list,
          optional(seq(':', $.type_annotation)),
          choice(
            prec(2, $.builder_function_body),  // @Builder 函数体
            prec(1, $.extend_function_body),   // @Extend 函数体
            $.block_statement         // 普通函数体
          )
        ),
        // export class
        seq(
          optional('abstract'),
          'class',
          $.identifier,
          optional($.type_parameters),
          optional(seq('extends', $.type_annotation)),
          optional($.implements_clause),
          $.class_body
        ),
        // export struct (component)
        seq(
          'struct',
          $.identifier,
          optional($.type_parameters),
          $.component_body
        ),
        // export default
        seq('default', choice(
          $.function_declaration,
          $.class_declaration,
          seq('struct', $.identifier, optional($.type_parameters), $.component_body),  // export default struct
          $.expression
        ))
      ),
      optional(';')
    ),

    // 导出声明（无装饰器）
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
        $.function_declaration,  // 无装饰器的函数
        $.variable_declaration,
        seq('default', choice(
          $.interface_declaration,
          $.component_declaration,
          $.interface_declaration,  // 支持 export default interface
          $.type_declaration,       // 支持 export default type
          $.enum_declaration,       // 支持 export default enum
          $.class_declaration,
          $.function_declaration,
          $.expression
        ))
      ),
      optional(';')
    ),

    // 装饰器 - ArkTS核心特性，支持完整的装饰器类型
    decorator: $ => seq(
      '@',
      choice(
        // 基础装饰器
        'Entry',          // 入口装饰器
        'Component',      // 组件装饰器（V1）
        'ComponentV2',    // 组件装饰器（V2）
        
        // 状态管理 V1 装饰器
        'State',          // 组件内部状态
        'Prop',           // 父子单向同步
        'Link',           // 父子双向同步
        'Provide',        // 与后代组件双向同步（提供方）
        'Consume',        // 与后代组件双向同步（消费方）
        'ObjectLink',     // 嵌套对象双向同步
        'Observed',       // 类对象观测（V1）
        'Watch',          // 状态变化监听
        'StorageLink',    // AppStorage双向同步
        'StorageProp',    // AppStorage单向同步
        'LocalStorageLink',    // LocalStorage双向同步
        'LocalStorageProp',    // LocalStorage单向同步
        
        // 状态管理 V2 装饰器
        'Local',          // 组件内部状态（V2）
        'Param',          // 组件外部输入（V2）
        'Once',           // 初始化同步一次
        'Event',          // 规范组件输出
        'Provider',       // 跨组件层级提供（V2）
        'Consumer',       // 跨组件层级消费（V2）
        'Monitor',        // 状态变量修改监听
        'Computed',       // 计算属性
        'Type',           // 标记类型
        'ObservedV2',     // 类对象观测（V2）
        'Trace',          // 属性追踪（V2）
        
        // UI构建装饰器
        'Builder',        // 自定义构建函数
        'BuilderParam',   // 引用@Builder函数
        'LocalBuilder',   // 维持组件关系
        'Styles',         // 定义组件重用样式
        'Extend',         // 扩展原生组件样式
        'AnimatableExtend',    // 可动画扩展
        
        // 其他装饰器
        'Require',        // 校验构造传参
        'Reusable',       // 组件复用
        'Concurrent',     // 并发函数标记
        'Track',          // 精细化属性观测
        
        // 或者其他自定义装饰器
        $.identifier
      ),
      optional(seq('(', commaSep($.expression), ')'))
    ),

    // 组件声明 - ArkTS核心特性
    // 仅用于非导出的组件声明：@Component struct ...
    // 导出的组件声明使用 decorated_export_declaration：@Component export struct ...
    component_declaration: $ => seq(
      repeat($.decorator),
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
      optional(';')  // 分号可选
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
    build_body: $ => seq(
      '{',
      repeat(choice($.block_statement, $._non_brace_content)),
      '}'
    ),

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
      seq(choice('Column', 'Row', 'Stack', 'Flex', 'Grid', 'GridRow', 'GridCol', 'List', 'ScrollList', 'NavDestination'), '(', optional($.component_parameters), ')', optional($.container_content_body)),
      // 特殊容器项
      seq(choice('ListItem', 'GridItem', 'ListItemGroup'), '(', optional($.component_parameters), ')', optional($.container_content_body)),
      // 自定义组件 - 支持容器内容体
      seq($.identifier, '(', optional(choice($.component_parameters, commaSep($.expression))), ')', optional($.container_content_body))
    )),

    // 容器内容体 - 专门用于布局容器的内容，区别于build_body
    // 注意：$.comment 不需要显式匹配，因为它已在 extras 中定义（会被自动跳过）
    container_content_body: $ => seq(
      '{',
      repeat(choice($.block_statement, $._non_brace_content)),
      '}'
    ),

    // ArkTS UI元素 - 只使用带修饰符的元素（修饰符链是可选的）
    arkts_ui_element: $ => $.ui_element_with_modifiers,

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
      $.for_each_statement,
      $.lazy_for_each_statement  // 支持 LazyForEach
    ),

    // 组件参数
    component_parameters: $ => seq(
      '{',
      commaSepTrailing($.component_parameter),
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
      $.ui_builder_arrow_function, // 项构建函数（专用于UI上下文）
      optional(seq(',', $.expression)), // key生成器
      ')'
    ),

    // LazyForEach语句 - 懒加载版本，语法与ForEach相同
    lazy_for_each_statement: $ => seq(
      'LazyForEach',
      '(',
      $.expression, // 数据源
      ',',
      $.ui_builder_arrow_function, // 项构建函数
      optional(seq(',', $.expression)), // key生成器（可以是箭头函数或其他表达式）
      ')'
    ),

    // UI构建箭头函数 - 专用于ForEach等UI上下文
    ui_builder_arrow_function: $ => prec.right(1, seq(
      optional('async'),
      choice(
        $.identifier,
        $.parameter_list
      ),
      optional(seq(':', $.type_annotation)),
      '=>',
      choice(
        prec(2, $.ui_arrow_function_body),  // UI箭头函数体（优先）
        $.expression  // 单个UI元素表达式
      )
    )),

    // 基础语法元素
    identifier: $ => /[a-zA-Z_$][a-zA-Z0-9_$]*/,
    
    _non_brace_content: $ => token(prec(1, /[^{}]+/)),
    
    string_literal: $ => token(choice(
      seq('"', repeat(choice(/[^"\\\n]/, seq('\\', /./), seq('\\', /\n/))), '"'),
      seq("'", repeat(choice(/[^'\\\n]/, seq('\\', /./), seq('\\', /\n/))), "'")
    )),
    
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
      $.import_expression,          // 动态import()表达式
      $.arrow_function,
      $.function_expression,        // 函数表达式
      $.call_expression,
      $.member_expression,
      $.subscript_expression,       // 索引访问表达式 arr[index]
      // 注意：modifier_chain_expression 不应该是独立的expression，它只在UI组件后面出现
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
      $.update_expression,         // ++/--表达式
      $.non_null_assertion_expression  // 非空断言表达式 (value!)
    ),

    // 状态绑定表达式（$语法）
    state_binding_expression: $ => seq(
      '$',
      choice(
        $.identifier,
        $.member_expression
      )
    ),

    numeric_literal: $ => token(choice(
      /0[xX][0-9a-fA-F]+/,  // 十六进制: 0xFF, 0xABCD
      /0[oO][0-7]+/,        // 八进制: 0o77
      /0[bB][01]+/,         // 二进制: 0b1010
      /\d+(\.\d+)?([eE][+-]?\d+)?/  // 十进制: 123, 1.23, 1.23e10
    )),
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

    // 条件表达式 - 优先级低于二元运算符，高于赋值
    // 使用较高的动态优先级，确保在与对象属性赋值歧义时优先匹配三元表达式
    conditional_expression: $ => prec.dynamic(10, prec.right(4, seq(
      $.expression,
      '?',
      $.expression,
      ':',
      $.expression
    ))),

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

    // 动态 import() 表达式
    import_expression: $ => prec(21, seq(
      'import',
      '(',
      $.expression,  // 支持字符串字面量或变量
      ')'
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
      $.parenthesized_type,  // 括号类型，如 ((param: string) => void)
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

    // 括号类型 - 用于包裹任何类型，如 ((param: string) => void)
    parenthesized_type: $ => prec.dynamic(1, seq(
      '(',
      $.type_annotation,
      ')'
    )),

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
    
    // UI中的if语句（不需要大括号）- 支持 else if 链式调用
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
      optional(choice(
        // else if 分支
        seq('else', $.ui_if_statement),
        // else 分支
        seq('else', '{', repeat(choice(
          $.arkts_ui_element,
          $.ui_control_flow, 
          $.expression_statement
        )), '}')
      ))
    ),

    // switch语句类型

    switch_statement: $ => seq(
      'switch',
      '(',
      $.expression,
      ')',
      '{',
      repeat(choice(
        $.switch_case,
        $.switch_default
      )),
      '}'
    ),

    switch_case: $ => seq(
      'case',
      field('value', $.expression),
      ':',
      repeat(field('consequent', choice(
        $.statement,
        $.block_statement
      )))
    ),

    switch_default: $ => seq(
      'default',
      ':',
      repeat(field('consequent', choice(
        $.statement,
        $.block_statement
      )))
    ),

    // 方法声明 
    method_declaration: $ => seq(
      repeat($.decorator),
      optional(choice('private', 'public', 'protected')),
      optional('static'),
      optional('abstract'),  // 支持抽象方法
      optional('async'),
      $.identifier,
      optional($.type_parameters),
      $.parameter_list,
      optional(seq(':', $.type_annotation)),
      choice(
        prec(3, $.builder_function_body),  // @Builder 函数体（最高优先级）
        prec(2, $.extend_function_body),   // @Extend 函数体
        prec(1, $.block_statement),        // 普通函数体
        ';'                                // 抽象方法
      )
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
      repeat(choice($.block_statement, $._non_brace_content)),
      '}'
    ),

    statement: $ => choice(
      $.expression_statement,
      $.if_statement,
      $.switch_statement,
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
      optional(prec(10, seq('=', $.expression)))  // 提高赋值表达式的优先级
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

    // for 循环 - 支持传统for循环、for...in 和 for...of
    for_statement: $ => seq(
      'for',
      '(',
      choice(
        // for...of 循环: for (let x of array)
        seq(
          choice('const', 'let', 'var'),
          $.identifier,
          'of',
          $.expression
        ),
        // for...in 循环: for (let key in object)
        seq(
          choice('const', 'let', 'var'),
          $.identifier,
          'in',
          $.expression
        ),
        // 传统 for 循环: for (let i = 0; i < 10; i++)
        seq($.variable_declaration, $.expression, ';', optional($.expression)),
        // for 循环简化形式: for (; i < 10; i++)
        seq(optional($.expression), ';', optional($.expression), ';', optional($.expression))
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
        prec(2, $.block_statement),  // 普通块语句
        $.expression  // 表达式
      )
    )),

    // UI箭头函数体 - 用于ForEach等UI上下文中的箭头函数，支持直接返回UI元素
    ui_arrow_function_body: $ => seq(
      '{',
      repeat(choice($.block_statement, $._non_brace_content)),
      '}'
    ),

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

    // 调用表达式 - 降低优先级，避免与修饰筦链冲突
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
    member_expression: $ => choice(
      // 普通成员访问
      prec.left(1, seq(
        $.expression,
        '.',
        $.identifier
      )),
      // 可选链成员访问 - 使用明确的 '?.' token 避免与条件表达式冲突
      prec.left(1, seq(
        $.expression,
        '?.',
        $.identifier
      ))
    ),

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
      optional($.extends_clause),  // 支持接口继承
      $.object_type
    ),

    // extends 子句 - 接口可以继承多个接口
    extends_clause: $ => seq(
      'extends',
      commaSep(choice(
        $.identifier,
        $.generic_type  // 支持继承泛型接口
      ))
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

    // 带装饰器的函数声明（用于 @Builder、@Extend 等）
    decorated_function_declaration: $ => seq(
      repeat1($.decorator),  // 至少一个装饰器
      optional('async'),
      'function',
      $.identifier,
      optional($.type_parameters),
      $.parameter_list,
      optional(seq(':', $.type_annotation)),
      choice(
        prec(2, $.builder_function_body),  // 提高优先级，优先尝试解析为 Builder 函数体
        prec(1, $.extend_function_body),   // @Extend 函数体
        $.block_statement         // 普通函数体
      )
    ),

    // @Builder 函数体 - 与 build_body 相同，支持 UI 组件
    builder_function_body: $ => prec(3, seq(
      '{',
      repeat(choice($.block_statement, $._non_brace_content)),
      '}'
    )),

    function_declaration: $ => seq(
      optional('async'),
      'function',
      $.identifier,
      optional($.type_parameters),
      $.parameter_list,
      optional(seq(':', $.type_annotation)),
      $.block_statement
    ),

    // @Extend函数的特殊函数体 - 允许直接以修饰符链开始
    // 注意：$.comment 不需要显式匹配，因为它已在 extras 中定义（会被自动跳过）
    extend_function_body: $ => prec(2, seq(
      '{',
      repeat(choice($.block_statement, $._non_brace_content)),
      '}'
    )),

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
      // 降低优先级，避免与三元表达式冲突
      prec(-1, seq($.property_name, ':', $.expression)),
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

    // 资源表达式 $r() - 支持多个参数（资源ID + 插值参数）
    resource_expression: $ => seq(
      '$r',
      '(',
      commaSep($.expression),  // 支持多个参数
      ')'
    ),

    // 更新表达式 ++/--
    update_expression: $ => choice(
      prec.left(22, seq($.expression, choice('++', '--'))),
      prec.right(22, seq(choice('++', '--'), $.expression))
    ),

    // 非空断言表达式 - TypeScript/ArkTS 特有的后置运算符
    // 用于告诉编译器某个值不为 null 或 undefined
    non_null_assertion_expression: $ => prec.left(22, seq(
      $.expression,
      '!'
    )),

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

// 支持尾随逗号的辅助函数
function commaSepTrailing(rule) {
  return optional(seq(
    rule,
    repeat(seq(',', rule)),
    optional(',')
  ));
}
