; ArkTS Syntax Highlighting Rules

; Keywords
[
  "import"
  "export"
  "default"
  "from"
  "as"
  "struct"
  "interface"
  "type"
  "class"
  "extends"
  "implements"
  "abstract"
  "function"
  "let"
  "const"
  "var"
  "if"
  "else"
  "for"
  "while"
  "do"
  "switch"
  "case"
  "default"
  "break"
  "continue"
  "return"
  "try"
  "catch"
  "finally"
  "throw"
  "new"
  "this"
  "super"
  "typeof"
  "instanceof"
  "in"
  "of"
  "void"
  "delete"
  "async"
  "await"
  "static"
  "readonly"
  "public"
  "private"
  "protected"
  "constructor"
] @keyword

; ArkTS specific keywords
[
  "build"
  "ForEach"
] @keyword.special

; Built-in types
[
  "any"
  "number"
  "string"
  "boolean"
  "void"
  "null"
  "undefined"
] @type.builtin

; Operators
[
  "="
  "+="
  "-="
  "*="
  "/="
  "%="
  "&="
  "|="
  "^="
  "<<="
  ">>="
  ">>>="
  "+"
  "-"
  "*"
  "/"
  "%"
  "++"
  "--"
  "**"
  "&"
  "|"
  "^"
  "~"
  "<<"
  ">>"
  ">>>"
  "&&"
  "||"
  "!"
  "=="
  "!="
  "==="
  "!=="
  "<"
  ">"
  "<="
  ">="
  "?"
  ":"
  "??"
  "?."
  "..."
] @operator

; Punctuation
[
  ";"
  ","
  "."
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

; Decorators - ArkTS特有的重要特性
(decorator
  "@" @punctuation.special
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
  ] @attribute.builtin)

(decorator
  "@" @punctuation.special
  (identifier) @attribute)

; UI Components - ArkTS特有的UI组件
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
  ] @function.builtin)

; Component declaration
(component_declaration
  "struct" @keyword
  name: (identifier) @type)

; Class declaration
(class_declaration
  "class" @keyword
  name: (identifier) @type)

; Interface declaration
(interface_declaration
  "interface" @keyword
  name: (identifier) @type)

; Type declaration
(type_declaration
  "type" @keyword
  name: (identifier) @type)

; Function declaration
(function_declaration
  "function" @keyword
  name: (identifier) @function)

; Method declaration
(method_declaration
  name: (identifier) @function.method)

; Build method - ArkTS特有
(build_method
  "build" @keyword.special)

; Variable declarations
(variable_declarator
  name: (identifier) @variable)

; Parameter
(parameter
  name: (identifier) @variable.parameter)

; Property declaration
(property_declaration
  name: (identifier) @property)

; Member expression
(member_expression
  property: (identifier) @property)

; Call expression
(call_expression
  function: (identifier) @function.call)

; Identifiers
(identifier) @variable

; Literals
(string_literal) @string
(template_literal) @string
(template_substitution
  "${" @punctuation.special
  "}" @punctuation.special)
(escape_sequence) @string.escape

(numeric_literal) @number
(boolean_literal) @boolean
(null_literal) @constant.builtin

; Resource expression - ArkTS特有的$r()语法
(resource_expression
  "$r" @function.builtin)

; State binding expression - ArkTS特有的$语法
(state_binding_expression
  "$" @punctuation.special)

; Comments
(comment) @comment

; Type annotations
(type_annotation) @type

; Array type
(array_type) @type

; Modifier chain expression - ArkTS UI修饰符链
(modifier_chain_expression
  "." @punctuation.delimiter
  (identifier) @function.method)

; Import/Export
(import_declaration
  "import" @keyword
  "from" @keyword)

(export_declaration
  "export" @keyword)

; Control flow
(if_statement
  "if" @keyword.conditional)

(ui_if_statement
  "if" @keyword.conditional)

(for_each_statement
  "ForEach" @keyword.repeat)

; Error highlighting for unmatched brackets
(ERROR) @error