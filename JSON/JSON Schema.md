---
aliases: []
tags: ['JSON', 'date/2023-05', 'year/2023', 'month/05']
date: 2023-05-15-星期一 09:55:20
update: 2023-05-18-星期四 18:09:09
---

## 简介

JSON Schema 是基于 JSON 格式，用于定义 JSON 数据结构以及校验 JSON 数据内容。 JSON Schema 官网地址：[json-schema.org/](http://json-schema.org/)

> JsonSchema 类似于 xml 的 schema 和 DTD 的作用，主要是用来规范 json 的格式。

## 如何校验 JSON

假设我们正在使用 `JSON` 对产品目录进行描述，此目录下的产品具有以下属性：

- id：`productId`
- 名称：`productName`
- 价格：`price`
- 标签：`tags`

例如：

```json
{
  "productId": 1,
  "productName": "A green door",
  "price": 12.50,
  "tags": [ "home", "green" ]
}
```

这很简单，但是该示例中有一些疑问。

- `productId` 是什么？
- `productName` 是必须的吗？
- `price` 可以为 0 吗？
- 所有的 `tags` 都是字符串吗？

当你谈论数据格式时，你想要有关键的元数据，包括这些键的有效输入。要回答这些问题就需要 `JSON Schema` 了。

## 什么是 Schema

如果您曾经使用过 XML Schema、RelaxNG 或 ASN.1，您可能已经知道什么是 Schema，并且可以愉快地跳到下一部分。如果这一切对您来说听起来像天书，那么您来对地方了。要定义 JSON Schema 是什么，我们可能应该首先定义 [JSON](https://www.json.org/json-zh.html) 是什么。

JSON 代表“JavaScript Object Notation”，一种简单的数据交换格式。它最初是作为万维网的符号。由于 JavaScript 存在于大多数 Web 浏览器中，并且 JSON 基于 JavaScript，因此很容易支持。然而，它已被证明足够有用且足够简单，以至于它现在被用于许多其他不涉及网上冲浪的环境中。

从本质上讲，JSON 建立在以下数据结构上：

- 对象（object）
`{ "key1": "value1", "key2": "value2" }`

- 数组（array）
`[ "first", "second", "third" ]`

- 数字（integer/number）
`42` `3.1415926`

- 字符串（string）
`"This is a string"`

- 布尔值（boolean）
`true` `false`

- null
`null`

通过这些简单的数据类型，各种结构化数据都可以被表示。然而，这种巨大的灵活性伴随着巨大的责任，因为同一个概念可以以多种方式表示。例如，您可以想象以不同的方式在 JSON 中表示一个人的信息：

```json
{
  "name": "George Washington",
  "birthday": "February 22, 1732",
  "address": "Mount Vernon, Virginia, United States"
}
```

```json
{
  "first_name": "George",
  "last_name": "Washington",
  "birthday": "1732-02-22",
  "address": {
    "street_address": "3200 Mount Vernon Memorial Highway",
    "city": "Mount Vernon",
    "state": "Virginia",
    "country": "United States"
  }
}
```

尽管第二种显然比第一种更正式,但是两种表述同样有效。记录的设计在很大程度上取决于它在应用程序中的预期用途，因此这里没有正确或错误的答案。然而，当应用程序说“给我一个人的 JSON 记录”时，准确地知道该记录应该如何组织是很重要的。例如，我们需要知道哪些字段是预期的，以及这些值是如何表示的。这就是 JSON Schema 的用武之地。以下 JSON Schema 片段描述了上面第二个示例的结构。现在不要太担心细节。它们将在后续章节中进行解释。

```json
{
  "type": "object",
  "properties": {
    "first_name": { "type": "string" },
    "last_name": { "type": "string" },
    "birthday": { "type": "string", "format": "date" },
    "address": {
      "type": "object",
      "properties": {
        "street_address": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "country": { "type" : "string" }
      }
    }
  }
}
```

您可能已经注意到 **`JSON Schema` 本身是用 `JSON` 编写的**。它是数据本身，而不是计算机程序。它只是一种用于“描述其他数据结构”的声明性格式。这既是它的优点也是它的缺点（它与其他类似的模式语言共享）。简明地描述数据的表面结构并根据它自动验证数据很容易。但是，由于 JSON Schema 不能包含任意代码，因此在表达数据元素之间的关系上有所限制。因此，用于足够复杂的数据格式的任何“验证工具”都可能有两个验证阶段：一个在模式（或结构）级别，一个在语义级别。后一种检查可能需要使用更通用的编程语言来实现。

## 定义 Schema

接着让我们一步步来完成上述 [[#如何校验 JSON|产品目录]] 的 `JSON Schema`

首先我们先定义一个基本的 `JSON Schema`

```json
// product.schema.json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/product.schema.json",
  "title": "Product",
  "description": "A product in the catalog",
  "type": "object"
}
```

- 关键字 [`$schema`](https://json-schema.org/draft/2020-12/json-schema-core.html#section-8.1.1) 声明此 `Schema` 是根据标准的特定草案编写的，并出于多种原因使用，主要是版本控制。(因为 `JSON Schema` 本身是用 `JSON` 编写的，所以也需要标准“校验”)
- 关键字 [`$id`](https://json-schema.org/draft/2020-12/json-schema-core.html#section-8.2.1) 定义 `Schema` 的 URI，以及 `Schema` 中其他 URI 引用所依据的基本 URI。
- [`title`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-9.1) 和 [`description`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-9.1) 是注释关键字仅用于描述。 它们不会对正在验证的数据添加约束。`Schema` 的意图用这两个关键字来说明。
- 验证关键字 [`type`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.1.1) 定义了我们 JSON 数据的第一个约束，在这种情况下它必须是一个 JSON 对象。

### 定义 properties

`productId` 是一个数字值，用于唯一地识别一个产品。由于这是一个产品的标准标识符，没有这个标识符的产品就没有意义，所以它是必须的。

接下来我们继续更新 `JSON Schema` 往里添加：

- 验证关键字 [`properties`](https://json-schema.org/draft/2020-12/json-schema-core.html#section-10.3.2.1)。
- `productId` 关键字。
    - `description` 注释关键字和 `type` 验证关键字——我们在上一节中介绍了这两个。
- 验证关键字 [`required`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.5.3) 中添加 `productId`。

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/product.schema.json",
  "title": "Product",
  "description": "A product from Acme's catalog",
  "type": "object",
  "properties": {
    "productId": {
      "description": "The unique identifier for a product",
      "type": "integer"
    }
  },
  "required": [ "productId" ]
}
```

![[_attachment/img/c6155d866c9e8df74813830631ee65cb_MD5.png]]

- `productName` 是一个描述产品名字的字符串值。因为没有名字的产品就没有什么意义，所以它也是必需的。
- 由于 `required` 验证关键字是一个字符串数组，我们可以根据需要记录多个键；包括 `productName`.
- `productId` 和 `productName` 之间实际上没有任何区别 ——我们将两者都包括在内是为了完整性，因为计算机通常会注意标识符，而人类通常会注意名称。

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/product.schema.json",
  "title": "Product",
  "description": "A product from Acme's catalog",
  "type": "object",
  "properties": {
    "productId": {
      "description": "The unique identifier for a product",
      "type": "integer"
    },
    "productName": {
      "description": "Name of the product",
      "type": "string"
    }
  },
  "required": [ "productId", "productName" ]
}
```

![[_attachment/img/1051e1b4b5bd2f80b23b3a7d8d924ddc_MD5.png]]

### 深入 properties

- `price` 关键字下添加了前面介绍的常用 `description` 注释关键字和 `type` 验证关键字。它也被包含在由 `required` 验证关键字定义的键数组中。
- 我们使用 [`exclusiveMinimum`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.2.5) 验证关键字指定 `price` 的值大于零 。
  - 如果我们想包含零作为有效值，我们会用 [`minimum`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.2.4) 验证关键字。

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/product.schema.json",
  "title": "Product",
  "description": "A product from Acme's catalog",
  "type": "object",
  "properties": {
    "productId": {
      "description": "The unique identifier for a product",
      "type": "integer"
    },
    "productName": {
      "description": "Name of the product",
      "type": "string"
    },
    "price": {
      "description": "The price of the product",
      "type": "number",
      "exclusiveMinimum": 0
    }
  },
  "required": [ "productId", "productName", "price" ]
}
```

![[_attachment/img/246953fdeed949977bd3f8efae4eacd1_MD5.png]]

接下来，轮到 `tags` 关键字。

要求是这样的：

- 如果有 `tags`，就必须至少有一个标签。
- 所有标签必须是唯一的；在一个产品中没有重复。
- 所有标签都必须是文本。
- 标签很好棒，但不是必须的。

所以：

- `tags` 依旧添加了 `type` 和 `description`。
- 这次 `type` 验证关键字的值是 `array`。
- 引入了 `items` 验证关键字，这样我们就可以定义数组中出现的内容。在这个例子中：给 `type` 验证关键字设置为 `string`。
- 验证关键字 [`minItems`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.4.2) 用于确保数组中至少有几项。
- 验证关键字 [`uniqueItems`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.4.3) 指出数组中的所有项目必须彼此唯一。
- 这次我们没有将此键添加到 `required` 验证关键字数组中，因为它是可选的。

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/product.schema.json",
  "title": "Product",
  "description": "A product from Acme's catalog",
  "type": "object",
  "properties": {
    "productId": {
      "description": "The unique identifier for a product",
      "type": "integer"
    },
    "productName": {
      "description": "Name of the product",
      "type": "string"
    },
    "price": {
      "description": "The price of the product",
      "type": "number",
      "exclusiveMinimum": 0
    },
    "tags": {
      "description": "Tags for the product",
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "uniqueItems": true
    }
  },
  "required": [ "productId", "productName", "price" ]
}
```

### 嵌套数据结构

到此为止，我们一直在处理一个非常扁平的模式 -- 只有一个层次。本节展示了嵌套数据结构。

- 我们添加一个 `size` 关键字。由于类型验证关键字是对象，我们可以使用 `properties` 验证关键字来定义一个嵌套数据结构。
  - 在这个例子中，为了简洁起见，我们省略了描述注解关键字。虽然在这种情况下，通常最好是彻底注释，但结构和键名对大多数开发者来说是相当熟悉的。
- 你会注意到 `size` 下的 `required` 只适用于当前维度。

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/product.schema.json",
  "title": "Product",
  "description": "A product from Acme's catalog",
  "type": "object",
  "properties": {
    "productId": {
      "description": "The unique identifier for a product",
      "type": "integer"
    },
    "productName": {
      "description": "Name of the product",
      "type": "string"
    },
    "price": {
      "description": "The price of the product",
      "type": "number",
      "exclusiveMinimum": 0
    },
    "tags": {
      "description": "Tags for the product",
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "uniqueItems": true
    },
    "size": {
      "type": "object",
      "properties": {
        "length": {
          "type": "number"
        },
        "width": {
          "type": "number"
        },
        "height": {
          "type": "number"
        }
      },
      "required": [ "length", "width", "height" ]
    }
  },
  "required": [ "productId", "productName", "price" ]
}
```

![[_attachment/img/05e0c22e016e56a8b9742685c6305b0e_MD5.png]]

### Schema 引用

到目前为止，我们的 JSON 模式是完全独立的。为了重用、可读性和可维护性等原因，在许多数据结构之间共享 JSON 模式是很常见的。

对于这个例子，我们引入了一个新的 JSON Schema 资源和其中的两个属性：

- 我们使用 `minimum` 前面提到的验证关键字。
- 我们添加 [`maximum`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.2.2) 验证关键字。
- 结合起来，这些给了我们一个用于验证的范围。

```json
// geographical-location.schema.json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/geographical-location.schema.json",
  "title": "Longitude and Latitude",
  "description": "A geographical coordinate on a planet (most commonly Earth).",
  "type": "object",
  "properties": {
    "latitude": {
      "type": "number",
      "minimum": -90,
      "maximum": 90
    },
    "longitude": {
      "type": "number",
      "minimum": -180,
      "maximum": 180
    }
  },
  "required": ["latitude", "longitude"]
}
```

接下来，我们添加对此新 `Schema` 的引用，以便将其合并。

```json
// product.schema.json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/product.schema.json",
  "title": "Product",
  "description": "A product from Acme's catalog",
  "type": "object",
  "properties": {
    // ...
    "warehouseLocation": {
      "description": "Coordinates of the warehouse where the product is located.",
      "$ref": "https://example.com/geographical-location.schema.json"
    }
  },
  "required": [ "productId", "productName", "price" ]
}
```

![[_attachment/img/fa7bf5947cf635c5931dc0c08f0cfe51_MD5.png]]

## JSON Schema Validation

### 数据类型

`type` 关键字是 JSON Schema 的基础。它指定 Schema 的数据类型。

JSON Schema 的核心定义了以下基本类型：

- string
- number
- integer
- object
- array
- boolean
- null

`type` 关键字可以是一个字符串或数组：

- 如果是字符串，则是上述基本类型之一的名称。
- 如果是数组，则必须是字符串数组，其中每个字符串是其中一种基本类型的名称，每个元素都是唯一的。在这种情况下，如果 JSON 片段与 **任何** 给定类型匹配，则它是有效的。

> 以下例子都基于 JSON Schema Draft 7 “https://json-schema.org/draft-07/schema#”

### string

`string` 类型用于文本字符串。它可能包含 Unicode 字符。

#### 长度

可以使用 `minLength` 和 `maxLength` 关键字来限制字符串的长度。对于这两个关键字，该值必须是非负数。

```json
{
  "type": "string",
  "minLength": 2,
  "maxLength": 3
}

"A" // not ok
"AB" // ok
"ABC" // ok
"ABCD" // not ok
```

#### 正则表达式

`pattern` 关键字用于将字符串限制为特定的正则表达式。正则表达式语法是在 JavaScript（特别是 [ECMA 262](https://www.ecma-international.org/publications/standards/Ecma-262.htm) ）中定义的。

```json
{
   "type": "string",
   "pattern": "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"
}

"555-1212" // OK
"(888)555-1212" // OK
"(888)555-1212 ext. 532" // not OK
"(800)FLOWERS"  // not OK
```

#### 格式

`format` 关键字允许对常用的某些类型的字符串值进行基本语义识别。例如，因为 JSON 没有 `“DateTime”` 类型，所以需要将日期编码为字符串。`format` 允许作者指示字符串值应解释为日期。默认情况下，`format` 只是一个注释，不影响验证。

当然，可以给 `format` 提供一个内置格式的选项来启用 `format` 作为验证而不仅仅是注释的功能。这意味着，例如，一个具有日期格式的值不是以一种可以被解析为日期的形式出现，验证将失败。

##### 内置格式

以下是 `JSON Schema` [规范](https://json-schema.org/draft-07/json-schema-validation.html#rfc.section.7.3) 中指定的格式列表。

**日期和时间**

日期和时间在 [RFC 3339 第 5.6 节](https://tools.ietf.org/html/rfc3339#section-5.6) 中表示。这是日期格式的子集，也通常称为 [ISO8601 格式](https://www.iso.org/iso-8601-date-and-time-format.html)。

- `"date-time"`：日期和时间在一起，例如， `2018-11-13T20:20:39+00:00`。
- `"time"`：时间，例如，`20:20:39+00:00` ⭐draft 7
- `"date"`：日期，例如，`2018-11-13` ⭐draft 7
- `"duration"`：持续时间，由 [ISO 8601 ABNF](https://datatracker.ietf.org/doc/html/rfc3339#appendix-A) 定义，例如，`P3D` 表示持续时间为 3 天 ⭐draft 2019-09

**电子邮件地址**

- `"email"`：Internet 电子邮件地址，请参阅 [RFC 5322，第 3.4.1 节](https://tools.ietf.org/html/rfc5322#section-3.4.1)。
- `"idn-email"`：Internet 电子邮件地址的国际化形式，请参阅 [RFC 6531](https://tools.ietf.org/html/rfc6531)。⭐draft 7

**主机名**

- `"hostname"`：Internet 主机名，请参阅 [RFC 1034，第 3.1 节](https://tools.ietf.org/html/rfc1034#section-3.1)。
- `"idn-hostname"`：国际化 Internet 主机名，请参阅 [RFC5890，第 2.3.2.3 节](https://tools.ietf.org/html/rfc5890#section-2.3.2.3)。⭐draft 7

**IP 地址**

- `"ipv4"`：IPv4 地址，根据 [RFC 2673 第 3.2 节中](https://tools.ietf.org/html/rfc2673#section-3.2) 定义的点分四线 ABNF 语法。
- `"ipv6"`：IPv6 地址，如 [RFC 2373 第 2.2 节中](https://tools.ietf.org/html/rfc2373#section-2.2) 所定义。

**资源标识符**

- `"uri"`：根据 [RFC3986 的](https://tools.ietf.org/html/rfc3986) 通用资源标识符 (URI) 。
- `"uri-reference"`：一个 URI 引用（URI 或相对引用），根据 [RFC3986 第 4.1 节](https://tools.ietf.org/html/rfc3986#section-4.1)。⭐draft 6
- `"iri"`：根据 [RFC3987](https://tools.ietf.org/html/rfc3987)，国际化资源标识符，“uri”的国际化等价物。⭐draft 7
- `"iri-reference"`：根据 [RFC3987](https://tools.ietf.org/html/rfc3987)，“uri-reference”的国际化等价物。⭐draft 7
- `"uuid"`：根据 [RFC4122](https://json-schema.org/draft/2019-09/json-schema-validation.html#RFC4122)，一个 UUID 有效的字符串 ⭐draft 2019-09
- `"uri-template"`：一个 URI 模板（任何级别）根据 [RFC6570](https://tools.ietf.org/html/rfc6570)。如果您还不知道 URI 模板是什么，您可能不需要这个值。⭐draft 6

**JSON 指针**

- `"json-pointer"`：一个 JSON 指针，根据 [RFC6901](https://tools.ietf.org/html/rfc6901)。请注意，仅当整个字符串仅包含 JSON 指针内容时才应使用此方法，例如 `/foo/bar`. JSON 指针 URI 片段，例如 `#/foo/bar/` 应该使用 `"uri-reference"`。⭐draft 6
- `"relative-json-pointer"`：一个相对 JSON 指针。⭐draft 7

**正则表达式**

- `"regex"`：正则表达式，根据 [ECMA 262](https://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf) 应有效。⭐draft 7

### integer/number

JSON Schema 中有两种数字类型：integer 和 number。它们共享相同的验证关键字。

`integer` 类型用于整数。JSON 没有针对整数和浮点值的不同类型。因此，有无小数点并不足以区分整数和非整数。例如，`1` 和 `1.0` 是在 JSON 中表示相同值的两种方式。无论使用哪种表示形式，JSON 模式都将该值视为整数。

```json
{ "type": "integer" }

42 // OK
-1 // OK
1.0 // OK，小数部分为零的数字被视为整数
3.1415926 // not OK，浮点数被拒绝
"42"  // not OK，作为字符串的数字被拒绝
```

`number` 类型用于任何数字类型，整数或浮点数。

```json
{ "type": "number" }

42 // OK
-1 // OK
5.0 // OK，简单的浮点数
2.99792458e8 // OK，指数符号也有效
"42"  // not OK，作为字符串的数字被拒绝
```

#### 倍数

可以使用 `multipleOf` 关键字将数字限制为给定数字的倍数 。它可以设置为任何正数。

```json
{
  "type": "number",
  "multipleOf" : 10
}

0 // OK
10 // OK
20 // OK
23  // not OK，不是 10 的倍数
```

#### 范围

数字的范围是使用 `minimum` 和 `maximum` 关键字的组合指定的 （或 `exclusiveMinimum` 和 `exclusiveMaximum` 用于表示排他范围，即不包含自己）。

如果 _x_ 是要验证的值，则以下必须成立：

> _x_ ≥ `minimum`
> _x_ > `exclusiveMinimum`
> _x_ ≤ `maximum`
> _x_ < `exclusiveMaximum`

虽然您可以同时指定 `minimum` 和 `exclusiveMinimum` 或同时 指定 `maximum` 和 `exclusiveMaximum`，但这样做没有意义。

```json
{
  "type": "number",
  "minimum": 0,
  "exclusiveMaximum": 100
}

-1  // not OK，小于0
0 // OK
10 // OK
99 // OK
100  // not OK
101  // not OK
```

>在 JSON Schema draft4 中，`exclusiveMinimum` 和 `exclusiveMaximum` 工作方式不同。它们是布尔值，指示是否 `minimum` 和 `maximum` 不包括该值。例如：
>
> - 如果 `exclusiveMinimum` 是 `false`，_x_ ≥ `minimum`。
> - 如果 `exclusiveMinimum` 是 `true`, _x_ > `minimum`。

### object

对象是 JSON 中的映射类型。他们将“key”映射到“value”。在 JSON 中，“key”必须始终是字符串。这些对中的每一组通常被称为“property”。

## 参考

- [JSON Schema specification](http://json-schema.org/specification.html)
- [Getting Started Step-By-Step](http://json-schema.org/learn/getting-started-step-by-step.html)
- [JSON Schema Docs](https://www.learnjsonschema.com/)
- [JSON Schema 规范（中文版）](https://json-schema.apifox.cn/)
- <https://github.com/NewFuture/miniprogram-json-schema>
