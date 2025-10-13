; ArkTS Tags for Code Navigation and Symbol Indexing

; Component declarations - ArkTS特有的组件
(component_declaration
  name: (identifier) @name
  (#set! "kind" "component")) @definition.component

; Class declarations
(class_declaration
  name: (identifier) @name
  (#set! "kind" "class")) @definition.class

; Interface declarations
(interface_declaration
  name: (identifier) @name
  (#set! "kind" "interface")) @definition.interface

; Type declarations
(type_declaration
  name: (identifier) @name
  (#set! "kind" "type")) @definition.type

; Function declarations
(function_declaration
  name: (identifier) @name
  (#set! "kind" "function")) @definition.function

; Method declarations
(method_declaration
  name: (identifier) @name
  (#set! "kind" "method")) @definition.method

; Build method - ArkTS特有的构建方法
(build_method
  (#set! "kind" "method")
  (#set! "name" "build")) @definition.method

; Constructor declarations
(constructor_declaration
  (#set! "kind" "constructor")
  (#set! "name" "constructor")) @definition.constructor

; Property declarations
(property_declaration
  name: (identifier) @name
  (#set! "kind" "property")) @definition.property

; Variable declarations
(variable_declarator
  name: (identifier) @name
  (#set! "kind" "variable")) @definition.variable

; Parameters
(parameter
  name: (identifier) @name
  (#set! "kind" "parameter")) @definition.parameter

; Import declarations - 导入的符号
(import_declaration
  (identifier) @name
  (#set! "kind" "import")) @reference.import

; Export declarations - 导出的符号
(export_declaration
  (component_declaration
    name: (identifier) @name)
  (#set! "kind" "export")) @reference.export

(export_declaration
  (class_declaration
    name: (identifier) @name)
  (#set! "kind" "export")) @reference.export

(export_declaration
  (function_declaration
    name: (identifier) @name)
  (#set! "kind" "export")) @reference.export

(export_declaration
  (interface_declaration
    name: (identifier) @name)
  (#set! "kind" "export")) @reference.export

(export_declaration
  (type_declaration
    name: (identifier) @name)
  (#set! "kind" "export")) @reference.export

; Call expressions - 函数调用
(call_expression
  function: (identifier) @name
  (#set! "kind" "call")) @reference.call

; Member expressions - 成员访问
(member_expression
  property: (identifier) @name
  (#set! "kind" "member")) @reference.member

; UI Component calls - ArkTS UI组件调用
(ui_component
  [
    "Text"
    "Button"
    "Image"
    "TextInput"
    "TextArea"
    "Column"
    "Row"
    "Stack"
    "Flex"
    "Grid"
    "List"
    "ScrollList"
    "ListItem"
    "GridItem"
  ] @name
  (#set! "kind" "ui_component")) @reference.ui_component

; Decorators - ArkTS装饰器
(decorator
  [
    "Component"
    "State"
    "Prop"
    "Link"
    "Provide"
    "Consume"
    "Builder"
    "Styles"
    "Extend"
    "AnimatableExtend"
    "Watch"
    "StorageLink"
    "StorageProp"
    "LocalStorageLink"
    "LocalStorageProp"
    "ObjectLink"
    "Observed"
  ] @name
  (#set! "kind" "decorator")) @reference.decorator

(decorator
  (identifier) @name
  (#set! "kind" "decorator")) @reference.decorator

; Type references
(type_annotation
  (identifier) @name
  (#set! "kind" "type_reference")) @reference.type

; Array type references
(array_type
  (identifier) @name
  (#set! "kind" "type_reference")) @reference.type

; Property assignments in object literals
(property_assignment
  (property_name
    (identifier) @name)
  (#set! "kind" "property")) @definition.property

; Component parameters - ArkTS组件参数
(component_parameter
  name: (identifier) @name
  (#set! "kind" "component_parameter")) @definition.parameter

; ForEach statements - ArkTS特有的循环结构
(for_each_statement
  (#set! "kind" "control_flow")
  (#set! "name" "ForEach")) @reference.control_flow

; State binding expressions - ArkTS状态绑定
(state_binding_expression
  (identifier) @name
  (#set! "kind" "state_binding")) @reference.state_binding

(state_binding_expression
  (member_expression
    property: (identifier) @name)
  (#set! "kind" "state_binding")) @reference.state_binding

; Resource expressions - ArkTS资源引用
(resource_expression
  (#set! "kind" "resource")
  (#set! "name" "$r")) @reference.resource