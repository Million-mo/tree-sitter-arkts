# ArkTS 泛型支持文档

## 概述

tree-sitter-arkts 现已全面支持 ArkTS 的泛型特性，包括泛型类、泛型接口、泛型函数、泛型约束、泛型默认值等。

## 支持的泛型特性

### 1. 泛型类

```typescript
class CustomStack<Element> {
  private items: Element[];

  constructor() {
    this.items = [];
  }

  public push(e: Element): void {
    this.items.push(e);
  }

  public pop(): Element {
    return this.items.pop();
  }
}

// 使用
let s = new CustomStack<string>();
```

### 2. 泛型接口

```typescript
interface GenericInterface<T> {
  value: T;
  getValue(): T;
}

class GenericClass<T> implements GenericInterface<T> {
  value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}
```

### 3. 泛型函数

```typescript
function identity<T>(arg: T): T {
  return arg;
}

// 调用方式
let result1 = identity<number>(42);
let result2 = identity<string>("Hello");
```

### 4. 泛型约束

使用 `extends` 关键字约束类型参数：

```typescript
interface Hashable {
  hash(): number;
}

class HashMap<Key extends Hashable, Value> {
  public set(k: Key, v: Value): void {
    let h = k.hash();
  }
}
```

### 5. 多个泛型参数

```typescript
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}

let result = pair<string, number>("hello", 42);
```

### 6. 泛型默认值

```typescript
class Container<T = string> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }
}
```

### 7. 泛型数组类型

```typescript
function getFirst<T>(arr: Array<T>): T {
  return arr[0];
}

// 嵌套泛型
let matrix: Array<Array<number>>;
let promiseArray: Promise<Array<string>>;
```

### 8. 元组类型

```typescript
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}
```

### 9. 泛型类型别名

```typescript
type StringArray = Array<string>;
type NumberArray = Array<number>;
```

### 10. 条件类型

```typescript
export type IsString<T> = T extends string ? true : false;
```

### 11. 泛型组件（ArkTS 特有）

```typescript
@Component
struct GenericComponent<T> {
  @State data: T;

  build() {
    Text(this.data.toString())
  }
}
```

## 语法节点

### 新增的语法节点：

1. **type_parameter** - 类型参数定义（支持约束和默认值）
2. **type_arguments** - 类型参数列表
3. **generic_type** - 泛型类型
4. **tuple_type** - 元组类型
5. **conditional_type** - 条件类型
6. **implements_clause** - 实现子句（支持泛型接口）
7. **subscript_expression** - 索引访问表达式

### 改进的语法节点：

1. **type_parameters** - 现在支持泛型约束和默认值
2. **type_member** - 支持接口中的方法签名
3. **object_type** - 支持分号和逗号分隔
4. **call_expression** - 支持泛型函数调用
5. **new_expression** - 支持泛型类实例化

## 冲突解决

为了支持泛型，添加了以下冲突规则：

- `[$.binary_expression, $.conditional_expression, $.call_expression]` - 处理 `<` 符号的歧义
- `[$.expression, $.array_type]` - 处理表达式与数组类型的歧义
- `[$.tuple_type, $.array_literal]` - 处理元组类型与数组字面量的歧义
- `[$.boolean_literal, $.primary_type]` - 处理 true/false 作为字面量或类型

## 测试文件

- `test/test_generics.ets` - 完整的泛型功能测试
- `test/test_generic_component.ets` - 泛型组件测试

## 参考文档

- [HarmonyOS ArkTS 泛型介绍](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/introduction-to-arkts-V5)

## 已知限制

1. 泛型组件在 build() 方法中的 UI 元素调用后不应添加分号（这是 ArkUI DSL 的规范）
2. 条件类型的完整语法支持可能需要进一步测试

## 更新日志

**2025-10-16**
- ✅ 添加泛型类支持
- ✅ 添加泛型接口支持
- ✅ 添加泛型函数支持
- ✅ 添加泛型约束支持（extends）
- ✅ 添加泛型默认值支持
- ✅ 添加多个泛型参数支持
- ✅ 添加元组类型支持
- ✅ 添加条件类型支持
- ✅ 添加泛型实例化支持（new Class<T>()）
- ✅ 添加泛型函数调用支持（func<T>()）
- ✅ 添加索引访问表达式支持（arr[index]）
- ✅ 改进接口方法签名支持
- ✅ 改进 implements 子句支持
