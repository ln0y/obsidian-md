---
aliases: []
tags: ['JSON', 'date/2023-05', 'year/2023', 'month/05']
date: 2023-05-15-星期一 09:55:20
update: 2023-05-22-星期一 17:20:40
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
  "price": 12.5,
  "tags": ["home", "green"]
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
        "country": { "type": "string" }
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
  "required": ["productId"]
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
  "required": ["productId", "productName"]
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
  "required": ["productId", "productName", "price"]
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
  "required": ["productId", "productName", "price"]
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
      "required": ["length", "width", "height"]
    }
  },
  "required": ["productId", "productName", "price"]
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
  "required": ["productId", "productName", "price"]
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

可以使用 `minLength` 和  `maxLength` 关键字来限制字符串的长度。对于这两个关键字，该值必须是非负数。

```json
{
  "type": "string",
  "minLength": 2,
  "maxLength": 3
}

"A" // ❌
"AB" // ✔️
"ABC" // ✔️
"ABCD" // ❌
```

#### 正则表达式

`pattern` 关键字用于将字符串限制为特定的正则表达式。正则表达式语法是在 JavaScript（特别是 [ECMA 262](https://www.ecma-international.org/publications/standards/Ecma-262.htm) ）中定义的。

```json
{
   "type": "string",
   "pattern": "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"
}

"555-1212" // ✔️
"(888)555-1212" // ✔️
"(888)555-1212 ext. 532" // ❌
"(800)FLOWERS"  // ❌
```

#### 格式

`format` 关键字允许对常用的某些类型的字符串值进行基本语义识别。例如，因为 JSON 没有 `“DateTime”` 类型，所以需要将日期编码为字符串。`format` 允许作者指示字符串值应解释为日期。默认情况下，`format`  只是一个注释，不影响验证。

当然，可以给 `format` 提供一个内置格式的选项来启用 `format` 作为验证而不仅仅是注释的功能。这意味着，例如，一个具有日期格式的值不是以一种可以被解析为日期的形式出现，验证将失败。

##### 内置格式

以下是 `JSON Schema` [规范](https://json-schema.org/draft-07/json-schema-validation.html#rfc.section.7.3) 中指定的格式列表。

**日期和时间**

日期和时间在 [RFC 3339 第 5.6 节](https://tools.ietf.org/html/rfc3339#section-5.6) 中表示。这是日期格式的子集，也通常称为 [ISO8601 格式](https://www.iso.org/iso-8601-date-and-time-format.html)。

- `"date-time"`：日期和时间在一起，例如， `2018-11-13T20:20:39+00:00`。
- `"time"`：时间，例如，`20:20:39+00:00` ⭐draft 7
- `"date"`：日期，例如，`2018-11-13` ⭐draft 7
- `"duration"`：持续时间，由  [ISO 8601 ABNF](https://datatracker.ietf.org/doc/html/rfc3339#appendix-A) 定义，例如，`P3D` 表示持续时间为 3 天 ⭐draft 2019-09

**电子邮件地址**

- `"email"`：Internet 电子邮件地址，请参阅 [RFC 5322，第 3.4.1 节](https://tools.ietf.org/html/rfc5322#section-3.4.1)。
- `"idn-email"`：Internet 电子邮件地址的国际化形式，请参阅  [RFC 6531](https://tools.ietf.org/html/rfc6531)。⭐draft 7

**主机名**

- `"hostname"`：Internet 主机名，请参阅 [RFC 1034，第 3.1 节](https://tools.ietf.org/html/rfc1034#section-3.1)。
- `"idn-hostname"`：国际化 Internet 主机名，请参阅  [RFC5890，第 2.3.2.3 节](https://tools.ietf.org/html/rfc5890#section-2.3.2.3)。⭐draft 7

**IP 地址**

- `"ipv4"`：IPv4 地址，根据 [RFC 2673 第 3.2 节中](https://tools.ietf.org/html/rfc2673#section-3.2) 定义的点分四线 ABNF 语法。
- `"ipv6"`：IPv6 地址，如 [RFC 2373 第 2.2 节中](https://tools.ietf.org/html/rfc2373#section-2.2) 所定义。

**资源标识符**

- `"uri"`：根据 [RFC3986 的](https://tools.ietf.org/html/rfc3986) 通用资源标识符 (URI) 。
- `"uri-reference"`：一个 URI 引用（URI 或相对引用），根据 [RFC3986 第 4.1 节](https://tools.ietf.org/html/rfc3986#section-4.1)。⭐draft 6
- `"iri"`：根据 [RFC3987](https://tools.ietf.org/html/rfc3987)，国际化资源标识符，“uri”的国际化等价物。⭐draft 7
- `"iri-reference"`：根据 [RFC3987](https://tools.ietf.org/html/rfc3987)，“uri-reference”的国际化等价物。⭐draft 7
- `"uuid"`：根据 [RFC4122](https://json-schema.org/draft/2019-09/json-schema-validation.html#RFC4122)，一个 UUID 有效的字符串 ⭐draft 2019-09
- `"uri-template"`：一个 URI 模板（任何级别）根据  [RFC6570](https://tools.ietf.org/html/rfc6570)。如果您还不知道 URI 模板是什么，您可能不需要这个值。⭐draft 6

**JSON 指针**

- `"json-pointer"`：一个 JSON 指针，根据 [RFC6901](https://tools.ietf.org/html/rfc6901)。请注意，仅当整个字符串仅包含 JSON 指针内容时才应使用此方法，例如  `/foo/bar`. JSON 指针 URI 片段，例如 `#/foo/bar/` 应该使用  `"uri-reference"`。⭐draft 6
- `"relative-json-pointer"`：一个相对 JSON 指针。⭐draft 7

**正则表达式**

- `"regex"`：正则表达式，根据 [ECMA 262](https://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf)  应有效。⭐draft 7

#### Media

⭐draft 7

`JSON Schema` 有一组关键字来描述和可选地验证存储在 `JSON` 字符串中的非 `JSON` 数据。由于很难为许多媒体类型编写验证器，因此不需要 `JSON Schema` 验证器根据这些关键字验证 `JSON` 字符串的内容。但是，这些关键字对于使用经过验证的 `JSON` 的应用程序仍然有用。

##### contentMediaType

`contentMediaType` 关键字指定了字符串内容的 MIME 类型，如 [RFC 2046](https://tools.ietf.org/html/rfc2046) 中所述。有一个由 [IANA 正式注册](https://www.iana.org/assignments/media-types/media-types.xhtml) 的 [MIME 类型列表](https://www.iana.org/assignments/media-types/media-types.xhtml)，但支持的类型集将取决于应用程序和操作系统。Mozilla 开发者网络也维护着一个 [较短的 MIME 类型列表](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types)，这些类型对网络来说是很重要的。

##### contentEncoding

`contentEncoding` 关键字指定用于存储内容的编码，如 [RFC 2054 第 6.1 部分](https://tools.ietf.org/html/rfc2045) 和 [RFC 4648 规定](https://datatracker.ietf.org/doc/html/rfc4648)。

接受的值为 `7bit`，`8bit`，`binary`， `quoted-printable`，`base16`，`base32`，和 `base64`。如果未指定，则编码与包含的 JSON 文档相同。

在不深入了解这些编码的底层细节的情况下，实际上只有两个选项对现代用法有用：

- 如果内容的编码与所包含的 JSON 文档相同（在实际应用中，几乎总是 UTF-8），则不指定 `contentEncoding`，并将内容按原样包含在一个字符串中。这包括基于文本的内容类型，如 `text/html` 或 `application/xml`。
- 如果内容是二进制数据，将 `contentEncoding` 设置为 `base64`，并使用 Base64 对内容进行编码。这将包括许多图像类型，如 `image/png` 或音频类型，如 `audio/mpeg`。

以下模式指示字符串包含一个 HTML 文档，使用与周围文档相同的编码进行编码：

```json
{
  "type": "string",
  "contentMediaType": "text/html"
}

// ✔️
"<!DOCTYPE html><html xmlns=\"http://www.w3.org/1999/xhtml\"><head></head></html>"
```

以下模式指示字符串包含使用 Base64 编码的 PNG 图像：

```json
{
  "type": "string",
  "contentEncoding": "base64",
  "contentMediaType": "image/png"
}

// ✔️
"iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA..."
```

> 可以在 <https://www.jsonschemavalidator.net/> 中进行测试

### integer/number

`JSON Schema` 中有两种数字类型：`integer` 和 `number`。它们共享相同的验证关键字。

`integer` 类型用于整数。JSON 没有针对整数和浮点值的不同类型。因此，有无小数点并不足以区分整数和非整数。例如，`1` 和 `1.0` 是在 JSON 中表示相同值的两种方式。无论使用哪种表示形式，JSON 模式都将该值视为整数。

```json
{ "type": "integer" }

42 // ✔️
-1 // ✔️
1.0 // ✔️，小数部分为零的数字被视为整数
3.1415926 // ❌，浮点数被拒绝
"42" // ❌，作为字符串的数字被拒绝
```

`number` 类型用于任何数字类型，整数或浮点数。

```json
{ "type": "number" }

42 // ✔️
-1 // ✔️
5.0 // ✔️，简单的浮点数
2.99792458e8 // ✔️，指数符号也有效
"42" // ❌，作为字符串的数字被拒绝
```

#### 倍数

可以使用 `multipleOf` 关键字将数字限制为给定数字的倍数 。它可以设置为任何正数。

```json
{
  "type": "number",
  "multipleOf" : 10
}

0 // ✔️
10 // ✔️
20 // ✔️
23 // ❌，不是 10 的倍数
```

#### 范围

数字的范围是使用 `minimum` 和 `maximum` 关键字的组合指定的 （或 `exclusiveMinimum` 和  `exclusiveMaximum` 用于表示排他范围，即不包含自己）。

如果 _x_ 是要验证的值，则以下必须成立：

> *x* ≥ `minimum` > *x* > `exclusiveMinimum` > *x* ≤ `maximum` > *x* < `exclusiveMaximum`

虽然您可以同时指定 `minimum` 和 `exclusiveMinimum` 或同时 指定 `maximum` 和 `exclusiveMaximum`，但这样做没有意义。

```json
{
  "type": "number",
  "minimum": 0,
  "exclusiveMaximum": 100
}

-1  // ❌，小于0
0 // ✔️
10 // ✔️
99 // ✔️
100 // ❌
101 // ❌
```

> 在 JSON Schema draft4 中，`exclusiveMinimum` 和 `exclusiveMaximum` 工作方式不同。它们是布尔值，指示是否  `minimum` 和 `maximum` 不包括该值。例如：
>
> - 如果 `exclusiveMinimum` 是 `false`，*x* ≥ `minimum`。
> - 如果 `exclusiveMinimum` 是 `true`, *x* > `minimum`。

### object

对象是 JSON 中的映射类型。他们将 `“key”` 映射到 `“value”`。在 JSON 中，`“key”` 必须始终是字符串。这些对中的每一组通常被称为 `“property”`。

对象的 `property`（键值对）是使用 `properties` 关键字定义的 。`properties` 的值是一个对象，其中每个键是属性的名称，每个值是用于验证该属性的模式。未匹配中 `properties` 的属性名称将被忽略。

#### 模式属性

有时您想给一种特定类型的属性名称与特定 `Schema` 相匹配。这就是 `patternProperties` 起作用的地方 ：它将正则表达式映射到 `Schema` 。如果属性名称与给定的正则表达式匹配，则属性值必须针对相应的 `Schema` 进行验证。

在以下示例中，名称以前缀开头的任何属性都 `S_` 必须是字符串，并且任何具有前缀的属性都  `I_` 必须是整数。任何与任一正则表达式都不匹配的属性将被忽略。

```json
{
  "type": "object",
  "patternProperties": {
    "^S_": { "type": "string" },
    "^I_": { "type": "integer" }
  }
}

// ✔️
{ "S_25": "This is a string" }

// ✔️
{ "I_0": 42 }

// ❌，如果名称以 开头S_，则必须是字符串
{ "S_0": 42 }

// ❌，如果名称以 开头I_，则必须是整数
{ "I_42": "This is a string" }

// ✔️这是一个不匹配任何正则表达式的键
{ "keyword": "value" }
```

如果 `patternProperties` 和 `properties` 都匹配中的属性名称，`properties` 的优先级会高

```json
{
  "type": "object",
  "properties": {
    "productId": {
      "type": "integer"
    }
  },
  "patternProperties": {
    "^product": { "type": "string" }
  }
}

// ✔️
{ "productId": 1 }

// ❌
{ "productId": "1" }
```

#### 额外属性

`additionalProperties` 关键字用于控制对额外 `property` 的处理，也就是那些名字没有在 `properties` 关键字中列出或与 `patternProperties` 关键字中的任何正则表达式匹配的属性。默认情况下，任何额外的属性都是允许的。

`additionalProperties` 关键字的值是一个 `Schema`，将用于验证实例中与 `properties` 或不匹配的任何属性 `patternProperties`。将 `additionalProperties` 架构设置 为 `false` 意味着不允许其他属性。

```json
{
  "type": "object",
  "properties": {
    "number": { "type": "number" },
    "street_name": { "type": "string" },
    "street_type": { "enum": ["Street", "Avenue", "Boulevard"] }
  },
  "additionalProperties": false
}

// ✔️
{ "number": 1600, "street_name": "Pennsylvania", "street_type": "Avenue" }

// ❌，额外属性“direction”使对象无效
{ "number": 1600, "street_name": "Pennsylvania", "street_type": "Avenue", "direction": "NW" }
```

您可以使用非布尔值对实例的其他属性设置更复杂的约束。例如，可以允许额外的属性，但前提是它们都是一个字符串：

```json
{
  "type": "object",
  "properties": {
    "number": { "type": "number" },
    "street_name": { "type": "string" },
    "street_type": { "enum": ["Street", "Avenue", "Boulevard"] }
  },
  "additionalProperties": { "type": "string" }
}

// ✔️
{ "number": 1600, "street_name": "Pennsylvania", "street_type": "Avenue" }

// ✔️，这是有效的，因为附加属性的值是一个字符串
{ "number": 1600, "street_name": "Pennsylvania", "street_type": "Avenue", "direction": "NW" }

// ❌，这是无效的，因为附加属性的值不是字符串：
{ "number": 1600, "street_name": "Pennsylvania", "street_type": "Avenue", "office_number": 201 }
```

#### 必须属性

默认情况下，由 `properties` 关键字定义的属性不是必须的。然而，可以使用 `required` 关键字提供一个所需属性的列表。

该 `required` 关键字采用零个或多个字符串的数组。这些字符串中的每一个都必须是唯一的。

- 在 dreft 4 中，`required` 必须至少包含一个字符串。

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string" },
    "address": { "type": "string" }
  },
  "required": ["name", "email", "telephone"]
}

// ✔️
{
  "name": "William Shakespeare",
  "email": "bill@stratford-upon-avon.co.uk",
  "telephone": 12333333333
}

// ✔️，提供额外的属性是可以的，即使是架构中没有定义的属性：
{
  "name": "William Shakespeare",
  "email": "bill@stratford-upon-avon.co.uk",
  "address": "Henley Street, Stratford-upon-Avon, Warwickshire, England",
  "telephone": 12333333333,
  "authorship": "in question"
}

// ❌，缺少必需的“email”属性会使 JSON 文档无效
{
  "name": "William Shakespeare",
  "address": "Henley Street, Stratford-upon-Avon, Warwickshire, England",
  "telephone": 12333333333
}

// ❌，在 JSON 中，具有值的属性null不等同于不存在的属性。这失败，因为null不是“字符串”类型，而是“空”类型
{
  "name": "William Shakespeare",
  "address": "Henley Street, Stratford-upon-Avon, Warwickshire, England",
  "telephone": 12333333333,
  "email": null
}
```

#### 属性名称

⭐draft 6

属性的名称可以根据正则表达式进行验证，而不考虑其值。如果你不想强制执行特定的属性，但又想确保这些属性的名称遵循特定的惯例，这就很有用。例如，你可能想强制要求所有的名字都是有效的 ASCII 符号，这样它们就可以在特定的编程语言中作为属性使用。

```json
{
  "type": "object",
  "propertyNames": {
    "pattern": "^[A-Za-z_][A-Za-z0-9_]*$"
  }
}

// ✔️
{
  "_a_proper_token_001": "value"
}

// ❌
{
  "001 invalid": "value"
}
```

可以通过 [[#扩展封闭 Schema|additionalProperties]] 来指定类型：

```json
{
  "type": "object",
  "propertyNames": {
    "pattern": "^[A-Za-z_][A-Za-z0-9_]*$"
  },
  "additionalProperties": {
    "type": "boolean"
  }
}
```

#### 属性数量

可以使用 `minProperties` 和 `maxProperties` 关键字来限制对象上的属性数量 。这些中的每一个都必须是非负整数。

```json
{
  "type": "object",
  "minProperties": 2,
  "maxProperties": 3
}

{} // ❌
{ "a": 0 } // ❌
{ "a": 0, "b": 1 } // ✔️
{ "a": 0, "b": 1, "c": 2 } // ✔️
{ "a": 0, "b": 1, "c": 2, "d": 3 } // ❌
```

#### 未评估的属性

![[#Unevaluated Properties]]

### array

数组用于有序元素。在 JSON 中，数组中的每个元素可能是不同的类型。

#### 元素

JSON 中数组的使用一般有两种方式：

- **列表验证：** 任意长度的序列，其中每个项目都匹配相同的 `Schema`。
- **元组验证：** 一个固定长度的序列，其中每个项目可能有不同的 `Schema`。在这种用法中，每个项目的索引（或位置）对于如何解释值是有意义的。（在某些编程语言中，这种用法通常被赋予一个完整的单独类型，例如 Python 的 `tuple`）。

```json
{ "type": "array" }

[1, 2, 3, 4, 5] // ✔️
[3, "different", { "types" : "of values" }] // ✔️
{"Not": "an array"} // ❌
```

##### 列表验证

列表验证对于任意长度的数组很有用，其中每个项目都匹配相同的模式。对于这种类型的数组，将 `items` 关键字设置为单个模式，将用于验证数组中所有元素。

> 此情况 `additionalItems` 关键字没有意义，不应使用。

在下面的例子中，我们定义数组中的每一项都是一个数字：

```json
{
  "type": "array",
  "items": {
    "type": "number"
  }
}

[] // ✔️
[1, 2, 3, 4, 5] // ✔️
[1, 2, "3", 4, 5] // ❌
```

##### 元组验证

当数组是一个元素的集合时，元组验证很有用，其中每个项目都有不同的架构并且每个项目的序数索引是有意义的。

例如，您可以表示街道地址，例如：

> 1600 Pennsylvania Avenue NW

作为以下形式的 4 元组：

> 号码、街道名称、街道类型、方向

这些字段中的每一个都将具有不同的模式：

- `number`: 地址编号，必须是数字。
- `street_name`: 街名，必须是字符串。
- `street_type`: 街道类型，应该是来自一组固定值的字符串。
- `direction`：地址所在城市象限，应该是来自不同值组成集合的字符串。

为此，我们将 `items` 关键字设置为一个数组，其中每个项目都是一个模式，对应于文档数组的每个索引。也就是说，一个数组，其中第一个元素验证输入数组的第一个元素，第二个元素验证输入数组的第二个元素，依此类推。

```json
{
  "type": "array",
  "items": [
    { "type": "number" },
    { "type": "string" },
    { "enum": ["Street", "Avenue", "Boulevard"] },
    { "enum": ["NW", "NE", "SW", "SE"] }
  ]
}

[1600, "Pennsylvania", "Avenue", "NW"] // ✔️
[24, "Sussex", "Drive"] // ❌，“Drive”不是可接受的街道类型之一
["Palais de l'Élysée"] // ❌，此地址缺少街道号码
[10, "Downing", "Street"] // ✔️，可以不提供所有项目
[1600, "Pennsylvania", "Avenue", "NW", "Washington"] // ✔️，默认情况下可以在尾部添加其他项目
```

经测试 vscode(version 1.78.2) 对元组类型验证不生效，但是枚举是生效的

![[_attachment/img/e20006dc3d23a6496d0d5e9a5aadcaed_MD5.png]]

> 可以在 <https://www.jsonschemavalidator.net/> 中进行测试

> 在  [draft 2020-12](http://json-schema.org/draft/2020-12/release-notes.html#changes-to-items-and-additionalitems)  中元组验证使用 `prefixItems` 代替 `items`

#### 附加元素

使用 `additionalItems` 关键字控制如果有超过元组内 `items` 属性定义的附加元素，元组是否有效。`additionalItems` 关键字的值是一个模式，所有其他项目必须通过该模式才能验证关键字。如果 `items`  同一模式中不存在“元组验证”关键字，则忽略此关键字。

> 在 Draft 4 中，`additionalItems` 不需要存在“元组验证”`items` 关键字。对任何项目都没有限制，因此所有项目都被视为附加项目。

在这里，我们将重用上面的示例模式，但设置  `additionalItems` 为 `false`，这具有禁止数组中的额外项目的效果。

```json
{
  "type": "array",
  "items": [
    { "type": "number" },
    { "type": "string" },
    { "enum": ["Street", "Avenue", "Boulevard"] },
    { "enum": ["NW", "NE", "SW", "SE"] }
  ],
  "additionalItems": false
}

[1600, "Pennsylvania", "Avenue", "NW"] // ✔️
[1600, "Pennsylvania", "Avenue"] // ✔️，可以不提供所有元素
[1600, "Pennsylvania", "Avenue", "NW", "Washington"] // ❌，不能提供额外的元素
```

您可以通过使用非布尔模式来限制附加项可以具有的值来表达更复杂的约束。在这种情况下，我们可以说允许附加元素，只要它们都是字符串：

```json
{
  "type": "array",
  "items": [
    { "type": "number" },
    { "type": "string" },
    { "enum": ["Street", "Avenue", "Boulevard"] },
    { "enum": ["NW", "NE", "SW", "SE"] }
  ],
  "additionalItems": { "type": "string" }
}

[1600, "Pennsylvania", "Avenue", "NW", "Washington"] // ✔️，额外的字符串元素是可以的
[1600, "Pennsylvania", "Avenue", "NW", 20500] // ❌，额外的元素不是字符串
```

> [!INFO]+ 特别提示
> 在 [draft 2020-12](http://json-schema.org/draft/2020-12/release-notes.html#changes-to-items-and-additionalitems) 中 `items` 和 `additionalItems` 关键字已被 `prefixItems` 和 `items` 取代，其中 `prefixItems` 的功能与旧的 `items` 的 array-of-schemas（元组验证） 相同，新的 items 关键字的功能与旧的 `additionalItems` 关键字相同。
>
> ### Open tuple
>
> ```json
> // Draft 2019-09
> {
>   "items": [
>     { "type": "number" },
>     { "type": "string" }
>   ]
> }
>
> // Draft 2020-12
> {
>   "prefixItems": [
>     { "type": "number" },
>     { "type": "string" }
>   ]
> }
> ```
>
> ### Closed tuple
>
> ```json
> // Draft 2019-09
> {
>   "items": [
>     { "type": "number" },
>     { "type": "string" }
>   ],
>   "additionalItems": false
> }
>
> // Draft 2020-12
> {
>   "prefixItems": [
>     { "type": "number" },
>     { "type": "string" }
>   ],
>   "items": false
> }
> ```

#### 包含

⭐draft 6

虽然 `items` 模式必须对数组中的每一项都有效，但  `contains` 模式只需要针对数组中的一项或多项进行验证。

```json
{
   "type": "array",
   "contains": {
     "type": "number"
   }
}

["life", "universe", "everything", 42] // ✔️，包含一个number元素
["life", "universe", "everything", "forty-two"] // ❌，不包含number元素
[1, 2, 3, 4, 5] // ✔️
```

⭐draft 2019-09

`minContains` 和 `maxContains` 可以与 `contains` 一起使用，以进一步指定一个模式与 `contains` 约束相匹配的次数。这些关键字可以是任何非负数，包括零。

```json
{
  "type": "array",
  "contains": {
    "type": "number"
  },
  "minContains": 2,
  "maxContains": 3
}

["apple", "orange", 2] // ❌，不满足minContains
["apple", "orange", 2, 4] // ✔️
["apple", "orange", 2, 4, 8] // ✔️
["apple", "orange", 2, 4, 8, 16] // ❌，满足maxContains
```

#### 长度

数组的长度可以用 `minItems` 和 `maxItems` 关键字来指定。每个关键字的值必须是一个非负数。这些关键字在做列表验证或元组验证时都有效。

```json
{
  "type": "array",
  "minItems": 2,
  "maxItems": 3
}

[] // ❌
[1] // ❌
[1, 2] // ✔️
[1, 2, 3] // ✔️
[1, 2, 3, 4] // ❌
```

#### 唯一性

只需将 `uniqueItems` 关键字设置为 `true`，可以限制数组中的每个元素都是唯一的。

```json
{
  "type": "array",
  "uniqueItems": true
}

[1, 2, 3, 4, 5] // ✔️
[1, 2, 3, 3, 4] // ❌
[] // ✔️空数组总是通过
```

### boolean

布尔类型只匹配两个特殊值：`true` 和  `false`。请注意，`Schema` 不接受其他约定为 `true` 或  `false` 的值，例如 1 和 0。

```json
{ "type": "boolean" }

true // ✔️
false // ✔️
"true" // ❌
0 // ❌
```

### null

当一个 `Schema` 指定  `type` 为 `null` 时，它只有一个可接受的值：`null`。

```json
{ "type": "null" }

null // ✔️
false // ❌
0 // ❌
"" // ❌
 // ❌
```

### 通用关键字

#### 枚举值

`enum` 关键字用于将值限制为一组固定的值。它必须是一个包含至少一个元素的数组，其中每个元素都是唯一的。

以下是验证路灯颜色的示例：

```json
{
  "enum": ["red", "amber", "green"]
}

"red" // ✔️
"blue" // ❌
```

#### 常量值

⭐draft 6

`const` 关键字被用于限制值为一个常量值。

例如，如果出于出口原因仅支持运送到美国：

```json
{
  "properties": {
    "country": {
      "const": "United States of America"
    }
  }
}

{ "country": "United States of America" } // ✔️
{ "country": "Canada" } // ❌
```

## Schema 组合

`JSON Schema` 包含一些用于将 `Schema` 组合在一起的关键字。请注意，这并不一定意味着将 `Schema` 组合自多个文件或 `JSON` 树 ，尽管这些工具有助于实现这一点，并且在构建复杂 `Schema` 中进行了描述。组合模式可能就像允许同时根据多个标准验证一个值一样简单。

这些关键字对应于众所周知的布尔代数概念，如 `AND`、`OR`、`XOR` 和 `NOT`。您通常可以使用这些关键字来表达无法用标准 `JSON Schema` 关键字表达的复杂约束。

用于组合模式的关键字是：

- allOf : (AND) 必须满足 _所有_ 子模式
- anyOf : (OR) 必须满足 _任意一个或多个_ 子模式
- oneOf : (XOR) 必须满足 _其中恰好一个_ 子模式

所有这些关键字都必须设置为一个数组，其中每个项目都是一个 `Schema`。

此外，还有：

- not : (NOT) _不能_ 满足对给定的子模式

### allOf

要验证 `allOf`，给定的数据必须满足所有的 `Subschemas`。

```json
{
  "allOf": [
    { "type": "string" },
    { "maxLength": 5 }
  ]
}

"short" //✔️
"too long"  // ❌，超过最大长度
```

> 注意：在面向对象继承的意义上， `allOf` 不能用于“扩展” `Schema` 以向其添加更多细节。实例必须对  `allOf` 包含每一个 `Schema` 都有效. 有关更多信息，请参阅有关子模式独立性的部分。

### anyOf

要验证 `anyOf`，数据必须满足任意一个或多个 `Subschemas`。

```json
{
  "anyOf": [
    { "type": "string", "maxLength": 5 },
    { "type": "number", "minimum": 0 }
  ]
}

"short" //✔️
"too long"  // ❌
12 //✔️
-5  // ❌
```

### oneOf

要验证 `oneOf`，数据必须满足且只满足一个给定的 `Subschemas`。

```json
{
  "oneOf": [
    { "type": "number", "multipleOf": 5 },
    { "type": "number", "multipleOf": 3 }
  ]
}

10 //✔️
9 //✔️
2  // ❌，不是 5 或 3 的倍数。
15  // ❌，同时符合两个子模式被拒绝。
```

### not

要验证 `not`，数据不能满足给定的 `Subschemas`。

例如，下面的 `Schema` 针对任何不是字符串的数据进行验证：

```json
{ "not": { "type": "string"} }

42 //✔️
{ "key": "value" } //✔️
"I am a string"  // ❌
```

### 组合属性

#### 不合逻辑的 Schema

请注意，使用这些关键词很容易创建出逻辑上不可能的模式。下面的例子创建了一个不能对任何东西进行验证的模式（因为某些东西不可能同时是一个字符串和一个数字）：

```json
{
  "allOf": [
    { "type": "string" },
    { "type": "number" }
  ]
}

"No way" // ❌
-1 // ❌
```

#### 因子分解

请注意，有可能 " 分解 " 出子模式的共同部分。以下两个模式是等价的。

```json
{
  "oneOf": [
    { "type": "number", "multipleOf": 5 },
    { "type": "number", "multipleOf": 3 }
  ]
}
```

```json
{
  "oneOf": [
    { "type": "number", "multipleOf": 5 },
    { "type": "number", "multipleOf": 3 }
  ]
}
```

### 扩展封闭 Schema

需要注意的是，`additionalProperties` 只识别在与自己相同的 `Subschemas` 中声明的属性。因此，`additionalProperties` 可以限制你使用诸如 [[#allOf]] 等 `Schema` 组合关键字来 " 扩展 " 一个 `Schema`。在下面的例子中，我们可以看到 `additionalProperties` 是如何导致扩展地址 `Schema` 例子的尝试失败的。

```json
{
  "allOf": [
    {
      "type": "object",
      "properties": {
        "street_address": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" }
      },
      "required": ["street_address", "city", "state"],
      "additionalProperties": false
    }
  ],

  "properties": {
    "type": { "enum": ["residential", "business"] }
  },
  "required": ["type"]
}

// ❌，不符合additionalProperties，“type”被认为是额外的。
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "city": "Washington",
  "state": "DC",
  "type": "business"
}
// ❌，不符合required，“type”是必需的。
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "city": "Washington",
  "state": "DC"
}
```

因为 `additionalProperties` 只识别在同一 `Subschemas` 中声明的属性，所以它认为除了 `"street_address"`、`"city"` 和 `"state"` 以外的任何东西都是额外的。用 `allOf` 组合模式并不能改变这一点。你可以使用的变通方法是将 `additionalProperties` 移到扩展 `Schema` 中，并从扩展 `Schema` 中重新声明这些属性。

```json
{
  "allOf": [
    {
      "type": "object",
      "properties": {
        "street_address": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" }
      },
      "required": ["street_address", "city", "state"]
    }
  ],

  "properties": {
    "street_address": true,
    "city": true,
    "state": true,
    "type": { "enum": ["residential", "business"] }
  },
  "required": ["type"],
  "additionalProperties": false
}
```

现在，`additionalProperties` 关键字能够识别所有必要的属性，并且 `Schema` 如期工作。看看 `unevaluatedProperties` 关键字如何解决这个问题，而不需要重新声明属性。

#### Unevaluated Properties

⭐draft 2019-09

在上面我们看到了在使用 `Schema` 组合 " 扩展 " 模式时使用 `additionalProperties` 的问题，`unevaluatedProperties` 关键字与 `additionalProperties` 相似，只是它可以识别在子模式中声明的属性。因此，上面的例子可以重写，而不需要重新声明属性。

```json
{
  "allOf": [
    {
      "type": "object",
      "properties": {
        "street_address": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" }
      },
      "required": ["street_address", "city", "state"]
    }
  ],

  "properties": {
    "type": { "enum": ["residential", "business"] }
  },
  "required": ["type"],
  "unevaluatedProperties": false
}

// ✔️
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "city": "Washington",
  "state": "DC",
  "type": "business"
}
// ❌
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "city": "Washington",
  "state": "DC",
  "type": "business",
  "something that doesn't belong": "hi!"
}
```

`unevaluatedProperties` 的工作方式是收集任何在处理 `Schema` 时被成功验证的属性，并使用这些属性作为允许的属性列表。这允许你做更复杂的事情，比如有条件地添加属性。下面的例子中，只有当 `"type"` 是 `"business"` 时，才允许 `"department"` 属性。

```json
{
  "type": "object",
  "properties": {
    "street_address": { "type": "string" },
    "city": { "type": "string" },
    "state": { "type": "string" },
    "type": { "enum": ["residential", "business"] }
  },
  "required": ["street_address", "city", "state", "type"],

  "if": {
    "type": "object",
    "properties": {
      "type": { "const": "business" }
    },
    "required": ["type"]
  },
  "then": {
    "properties": {
      "department": { "type": "string" }
    }
  },
  "unevaluatedProperties": false
}

// ✔️
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "city": "Washington",
  "state": "DC",
  "type": "business",
  "department": "HR"
}
// ❌
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "city": "Washington",
  "state": "DC",
  "type": "residential",
  "department": "HR"
}
```

![[_attachment/img/6a33824b2257d64ef733ab6df5d70a3b_MD5.png]]

在这个 `Schema` 中，如果 `"type”` 是 `"business"`，那么在 `then` 模式中声明的属性只算作 `"evaluated"` 属性。

## Subschemas 条件验证

### 必要依赖

`dependentRequired` 关键字有条件地要求，如果一个对象存在某个特定的属性，则另一个属性也必须存在。例如，假设我们有一个表示客户的 `Schema`，如果您有他们的信用卡号，您还需要确保您有账单地址。如果您没有他们的信用卡号，则不需要帐单邮寄地址。我们使用 `dependentRequired` 关键字表示一个属性对另一个属性的依赖性。`dependentRequired` 关键字的值是一个对象。对象中的每个条目都从属性的名称 _p_ 映射到一个字符串数组，其中列出了 _p_ 存在时所需的属性。

在下面的例子中，只要提供一个 `"credit_card"` 属性，就必须有一个 `"billing_address"` 属性：

```json
{
  "type": "object",

  "properties": {
    "name": { "type": "string" },
    "credit_card": { "type": "number" },
    "billing_address": { "type": "string" }
  },

  "required": ["name"],

  "dependentRequired": {
    "credit_card": ["billing_address"]
  }
}

//✔️
{
  "name": "John Doe",
  "credit_card": 5555555555555555,
  "billing_address": "555 Debtor's Lane"
}

// ❌，这个实例有一个credit_card，但缺少一个billing_address。
{
  "name": "John Doe",
  "credit_card": 5555555555555555
}

//✔️。这没关系，因为我们既没有credit_carda也没有billing_address。
{
  "name": "John Doe"
}

//✔️。请注意，依赖项不是双向的。有一个没有信用卡号的帐单地址是可以的。
{
  "name": "John Doe",
  "billing_address": "555 Debtor's Lane"
}
```

要解决上面的最后一个问题（依赖项不是双向的），您当然可以明确定义双向依赖项：

```json
{
  "type": "object",

  "properties": {
    "name": { "type": "string" },
    "credit_card": { "type": "number" },
    "billing_address": { "type": "string" }
  },

  "required": ["name"],

  "dependentRequired": {
    "credit_card": ["billing_address"],
    "billing_address": ["credit_card"]
  }
}

// ❌，这个实例有一个credit_card，但缺少一个billing_address。
{
  "name": "John Doe",
  "credit_card": 5555555555555555
}

// ❌，这有一个billing_address，但缺少一个credit_card。
{
  "name": "John Doe",
  "billing_address": "555 Debtor's Lane"
}
```

### 模式依赖

`dependenciesSchemas` 关键字要求当给定的属性存在时，有条件地应用子模式。这个 `Schema` 的应用方式与 `allOf` 应用 `Schema` 的方式相同。没有任何东西被合并或扩展。两个 `Schema` 都是独立应用的。

```json
{
  "type": "object",

  "properties": {
    "name": { "type": "string" },
    "credit_card": { "type": "number" }
  },

  "required": ["name"],

  "dependentSchemas": {
    "credit_card": {
      "properties": {
        "billing_address": { "type": "string" }
      },
      "required": ["billing_address"]
    }
  }
}

//✔️
{
  "name": "John Doe",
  "credit_card": 5555555555555555,
  "billing_address": "555 Debtor's Lane"
}

 // ❌，这个实例有一个credit_card，但缺少一个 billing_address：
{
  "name": "John Doe",
  "credit_card": 5555555555555555
}

//✔️。这有一个billing_address，但缺少一个 credit_card。这通过了，因为这里billing_address 看起来像一个附加属性：
{
  "name": "John Doe",
  "billing_address": "555 Debtor's Lane"
}
```

> 在 2019-09 草案之前，`dependentRequired` 和 `dependentSchemas` 是一个叫做 `dependencies` 的关键字。如果依赖值是一个数组，它将表现得像 `dependentRequired`，如果依赖值是一个模式，它将表现得像 `dependentSchemas`。

### 条件语句

⭐draft 7

`if`、`then` 和 `else` 关键字允许根据另一个 `Schema` 的结果来应用一个 `Subschema`，这很像传统编程语言中的 `if`/`then`/`else` 结构。

如果 `if` 是有效的，那么 `then` 也必须是有效的（`else` 被忽略）。如果 `if` 是无效的，则 `else` 是有效的（`then` 被忽略）。

如果没有定义 `then` 或 `else`，`if` 的行为就像它们的值为真一样。

如果 `then` 和/或 `else` 出现在一个没有 `if` 的模式中，那么 `then` 和 `else` 将被忽略。

我们可以用真值表的形式来说明，显示 `if`、`then` 和 `else` 何时有效的组合以及整个模式的有效性：

| if  | then | else | whole schema |
| --- | ---- | ---- | ------------ |
| T   | T    | n/a  | T            |
| T   | F    | n/a  | F            |
| F   | n/a  | T    | T            |
| F   | n/a  | F    | F            |
| n/a | n/a  | n/a  | T            |

例如，假设您想编写一个 `Schema` 来处理美国和加拿大的地址。这些国家/地区有不同的邮政编码格式，我们希望根据国家/地区选择要验证的格式。如果地址在美国，则该 `postal_code` 字段是“邮政编码”：五个数字后跟可选的四位后缀。如果地址在加拿大，则该 `postal_code` 字段是一个六位字母数字字符串，其中字母和数字交替出现。

```json
{
  "type": "object",
  "properties": {
    "street_address": {
      "type": "string"
    },
    "country": {
      "default": "United States of America",
      "enum": ["United States of America", "Canada"]
    }
  },
  "if": {
    "properties": { "country": { "const": "United States of America" } }
  },
  "then": {
    "properties": { "postal_code": { "pattern": "[0-9]{5}(-[0-9]{4})?" } }
  },
  "else": {
    "properties": { "postal_code": { "pattern": "[A-Z][0-9][A-Z] [0-9][A-Z][0-9]" } }
  }
}

//✔️
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "country": "United States of America",
  "postal_code": "20500"
}

//✔️
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "postal_code": "20500"
}

//✔️
{
  "street_address": "24 Sussex Drive",
  "country": "Canada",
  "postal_code": "K1M 1M4"
}

// ❌
{
  "street_address": "24 Sussex Drive",
  "country": "Canada",
  "postal_code": "10000"
}
// ❌
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "postal_code": "K1M 1M4"
}
```

> 在此示例中，`"country"` 不是必需的属性。因为 `"if"` 模式也不要求 `"country"` 属性，它会通过，然后应用 `"then"` 模式。因此，如果没有定义 `"country"` 属性，则默认行为是将 `"postal_code"` 验证为美国邮政编码。`"default"` 关键字没有效果，但将其包含在 `Schema` 中，对读者比较友好，可以更容易地识别默认行为。

不幸的是，上面的方法不能扩展到两个以上的国家。然而，你可以在 `allOf` 里面包裹成对的 `if` 和 `then`，以创建一个可以扩展的内容。在这个例子中，我们将使用美国和加拿大的邮政编码，但也增加了荷兰的邮政编码，它是 4 位数字后加两个字母。读者可以将此扩展到世界上其他的邮政编码，作为一个练习。

```json
{
  "type": "object",
  "properties": {
    "street_address": {
      "type": "string"
    },
    "country": {
      "default": "United States of America",
      "enum": ["United States of America", "Canada", "Netherlands"]
    }
  },
  "allOf": [
    {
      "if": {
        "properties": { "country": { "const": "United States of America" } }
      },
      "then": {
        "properties": { "postal_code": { "pattern": "[0-9]{5}(-[0-9]{4})?" } }
      }
    },
    {
      "if": {
        "properties": { "country": { "const": "Canada" } },
        "required": ["country"]
      },
      "then": {
        "properties": { "postal_code": { "pattern": "[A-Z][0-9][A-Z] [0-9][A-Z][0-9]" } }
      }
    },
    {
      "if": {
        "properties": { "country": { "const": "Netherlands" } },
        "required": ["country"]
      },
      "then": {
        "properties": { "postal_code": { "pattern": "[0-9]{4} [A-Z]{2}" } }
      }
    }
  ]
}

//✔️
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "country": "United States of America",
  "postal_code": "20500"
}

//✔️
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "postal_code": "20500"
}

//✔️
{
  "street_address": "24 Sussex Drive",
  "country": "Canada",
  "postal_code": "K1M 1M4"
}

//✔️
{
  "street_address": "Adriaan Goekooplaan",
  "country": "Netherlands",
  "postal_code": "2517 JX"
}

 // ❌
{
  "street_address": "24 Sussex Drive",
  "country": "Canada",
  "postal_code": "10000"
}

 // ❌
{
  "street_address": "1600 Pennsylvania Avenue NW",
  "postal_code": "K1M 1M4"
}
```

> 在 `"if"` 模式中，`"required"` 关键字是必要的，否则如果没有定义 `"country"`，则它们都将被应用。在 `"United States of America"` 的 `"IF"` 模式中不使用 `"required"`，就可以在没有定义 `"country"` 的情况下有效地将其作为默认值。

> 即使 `"country"` 是必填字段，仍然建议在每个 `"if"` 模式中使用 `"required"` 关键字。验证结果将相同，因为 `"required"` 失败，并且它会增加错误结果的噪音，因为它将针对所有三个 `"then"` 模式验证 `"postal_code"`，导致不相关的错误。

![[_attachment/img/d78af3dbf6b804bcef9306199f031521_MD5.png]]

### 蕴含

在 Draft 7 之前，你可以使用 [[#Schema 组合|Schema Composition]] 关键字和一个叫做 `"implication"` 的布尔代数概念来表达一个 `"if-then"` 的条件。`A->B`（读作，A 隐含 B）意味着如果 A 是真的，那么 B 也一定是真的。它可以表示为 `!A || B`，可以表示为 `JSON Schema`。

```json
{
  "type": "object",
  "properties": {
    "restaurantType": { "enum": ["fast-food", "sit-down"] },
    "total": { "type": "number" },
    "tip": { "type": "number" }
  },
  "anyOf": [
    {
      "not": {
        "properties": { "restaurantType": { "const": "sit-down" } },
        "required": ["restaurantType"]
      }
    },
    { "required": ["tip"] }
  ]
}

 //✔️
{
  "restaurantType": "sit-down",
  "total": 16.99,
  "tip": 3.4
}

 // ❌
{
  "restaurantType": "sit-down",
  "total": 16.99
}

 //✔️
{
  "restaurantType": "fast-food",
  "total": 6.99
}
//✔️
{ "total": 5.25 }
```

蕴涵的变化可以用来表达你用 `if `/ `then` / `else` 关键字表达的内容。 `if` / `then` 可表示为 `A -> B`，`if` / `else` 可表示为 `!A -> B`，`if` / `then` / `else` 可表示为 `A -> B AND !A -> C`

等同于：

```json
{
  "type": "object",
  "properties": {
    "restaurantType": { "enum": ["fast-food", "sit-down"] },
    "total": { "type": "number" },
    "tip": { "type": "number" }
  },
  "if": {
    "properties": { "restaurantType": { "const": "sit-down" } },
    "required": ["restaurantType"]
  },
  "then": {
    "required": ["tip"]
  }
}
```

> 由于此 `Schema` 不是很直观，因此建议您将在 `$defs` 中的条件语句与描述性名称一起， 结合 `"allOf": [{ "$ref": "#/$defs/sit-down-restaurant-implies-tip-is-required" }]` 一起 `$ref` 入您的 `Schema` 中。

```json
{
  "type": "object",
  "properties": {
    "restaurantType": { "enum": ["fast-food", "sit-down"] },
    "total": { "type": "number" },
    "tip": { "type": "number" }
  },
  "allOf": [{ "$ref": "#/$defs/sit-down-restaurant-implies-tip-is-required" }],
  "$defs": {
    "sit-down-restaurant-implies-tip-is-required": {
      "anyOf": [
        {
          "not": {
            "properties": { "restaurantType": { "const": "sit-down" } },
            "required": ["restaurantType"]
          }
        },
        { "required": ["tip"] }
      ]
    }
  }
}
```

## 声明方言

`JSON Schema` 的一个版本称为方言 (`Dialect`)。方言表示可用于评估模式的一组关键字和语义。每个 `JSON Schema` 版本都是 `JSON Schema` 的 新方言。`JSON Schema` 为您提供了一种声明模式符合哪种方言的方法，并提供了描述您自己的自定义方言的方法。

### $schema

该 `$schema` 关键字用于声明模式是针对哪种 JSON 方言编写的。`$schema`  关键字的值也是模式的标识符，可用于根据方言 `$schema`  标识验证模式是否有效。描述另一个模式的模式称为“元模式 (meta-schema)”。

`$schema` 适用于整个文档并且必须在根级别。它不适用于外部引用的 ( `$ref`, `$recursiveRef`) 文档。这些模式需要声明自己的  `$schema`.

如果 `$schema` 未使用，则实现可能允许您在外部指定一个值，或者它可能会假设应该使用哪个规范版本来评估模式。建议所有 `JSON Schema` 都有一个 `$schema` 关键字来与读者和工具进行交流，以了解预期的规范版本。因此，大多数情况下，您会希望在 `Schema` 的根目录下使用它：

```json
"$schema": "https://json-schema.org/draft-07/schema"
```

> Draft 4 的标识符是 `https://json-schema.org/draft-04/schema#`。
>
> Draft 4 定义了一个没有特定方言 ( `https://json-schema.org/schema#`) 的 $schema，这意味着使用最新的方言。这已被弃用，不应再使用。
>
> 您可能会遇到对没有 `JSON Schema` 的 Draft 5 版本的引用。Draft 5 指的是 Draft 4 版本的无变化修订版。它不会添加、删除或更改任何功能。它只更新参考资料、进行澄清和修复错误。Draft 5 描述了 Draft4 版本。如果您来这里寻找有关 Draft 5 的信息，您会在 Draft 4 下找到它。我们不再使用“Draft”术语来指代补丁版本以避免这种混淆。

> Draft 6 的标识符是 `https://json-schema.org/draft-06/schema#`

> Draft 7 的标识符是 `https://json-schema.org/draft-07/schema#`

> Draft 2019-09 的标识符是 `https://json-schema.org/draft/2019-09/schema`

> Draft 2020-12 的标识符是 `https://json-schema.org/draft/2020-12/schema`

## 构建复杂 Schema

在编写中等复杂度的计算机程序时，人们普遍认为，将程序“构建”为可复用的方法比到处复制粘贴重复的代码要好。同样在 `JSON Schema` 中，对于除最琐碎的模式之外，构建在很多地方可以复用的模式非常有用。本章将介绍可用于复用和构建模式的工具以及使用这些工具的一些实例。

### 模式识别

与任何其他代码一样，将模式分解为在必要时相互引用的逻辑单元，则模式更易于维护。为了引用模式，我们需要一种识别模式的方法。模式文档由非相对 URI 所标识。

模式文档不需要有标识符，但如果您想从另一个模式引用一个模式，则需要一个标识符。在本文档中，我们将没有标识符的模式称为“匿名模式”。

在以下部分中，我们将看到如何确定模式的“标识符”。

> URI 术语有时可能不直观。在本文中，使用了以下定义：
>
> **URI** 或  **非相对 URI**：含有模式的完整 URI（ `https`）。它可能包含一个 URI 片段 ( `#foo`)。有时本文档会使用“非相对 URI”来明确表示不允许使用相对 URI。
>
> **相对引用**：不包含模式 ( `https`) 的部分 URI 。它可能包含一个片段 ( `#foo`)。
>
> **URI- 引用**：相对引用或非相对 URI。它可能包含一个 URI 片段 ( `#foo`)。
>
> **绝对 URI**：包含模式 ( `https`) 但不包含 URI 片段 ( `#foo`) 的完整 URI 。

> 尽管 `Schema` 是由 URI 识别的，但这些标识符不一定是网络可寻址的。它们只是标识符。通常，实现不会发出 HTTP 请求 ( `https://`) 或从文件系统 ( `file://`) 读取以获取 `Schema`。相反，它们提供了一种将 `Schema` 加载到内部 `Schema` 数据库中的方法。当 `Schema` 被其 URI 标识符引用时，将从内部 `Schema` 数据库中检索该 `Schema`。

#### 基本 URI

使用非相对 URI 可能很麻烦，因此 JSON 模式中使用的任何 URI 都可以是 URI 引用，根据模式的基本 URI 进行解析，从而产生非相对 URI。本节介绍如何确定 `Schema` 的基本 URI。

> 基本 URI 确定和相对引用解析由 [RFC-3986](https://datatracker.ietf.org/doc/html/rfc3986#section-5) 定义。如果您熟悉这在 HTML 中的工作原理，那么本节应该会感到非常熟悉。

#### 检索 URI

用于获取 `Schema` 的 URI 称为“检索 URI”（当前资源的 URI）。通常可以将匿名 `Schema` 传递给实例，在这种情况下，该 `Schema` 将没有检索 URI。

让我们假设使用 URI：`https://example.com/schemas/address` 来引用 `Schema` 并检索以下 `Schema`。

```json
{
  "type": "object",
  "properties": {
    "street_address": { "type": "string" },
    "city": { "type": "string" },
    "state": { "type": "string" }
  },
  "required": ["street_address", "city", "state"]
}
```

此 `Schema` 的基本 URI 与检索 URI 相同  `https://example.com/schemas/address`。

简单说就是没有指定基本 URI，那么检索 URI 就是基本 URI。

#### $id

您可以在 `Schema` 根目录中使用 `$id` 关键字来设置基本 URI 。`$id` 的值是一个没有根据 [检索 URI](https://json-schema.apifox.cn/#retrieval-uri) 解析片段的 URI 引用。生成的 URI 是模式的基本 URI。

> 在**Draft 4**  中，`$id` 只是 `id`（没有 $）。

> 在**Draft 4-7**  中，允许在 `$id`（或 Draft4 中的 `id`）中有片段。但是，设置包含 URI 片段的基本 URI 时的行为未定义，不应使用，因为实现可能会以不同方式对待它们。

> 这类似于  [HTML](https://html.spec.whatwg.org/multipage/semantics.html#the-base-element) 中的 `<base>` [标签](https://html.spec.whatwg.org/multipage/semantics.html#the-base-element)。

> 当 `$id` 关键字出现在子模式中时，它的含义略有不同。有关更多信息，请参阅捆绑部分。

让我们假设 URI `https://example.com/schema/address` 和  `https://example.com/schema/billing-address` 两者都指向以下模式。

```json
{
  "$id": "/schemas/address",
  "type": "object",
  "properties": {
    "street_address": { "type": "string" },
    "city": { "type": "string" },
    "state": { "type": "string" }
  },
  "required": ["street_address", "city", "state"]
}
```

无论使用两个 URI 中的哪一个来访问此 `Schema`，基本 URI 都将是 `https://example.com/schemas/address`，这是 `$id` 针对检索 URI 的 URI 引用解析的结果。

但是，在设置基本 URI 时使用相对引用可能会出现问题。例如，我们不能将此模式用作匿名 `Schema`，因为没有检索 URI 并且您无法解析相对引用。出于这个原因和其他原因，建议您在使用 `$id` 声明基本 URI 时尽量使用绝对 URI.

无论检索 URI 是什么或者它是否用作匿名 `Schema`，以下 `Schema` 的基本 URI 将始终是 `https://example.com/schemas/address` 。

```json
{
  "$id": "https://example.com/schemas/address",

  "type": "object",
  "properties": {
    "street_address": { "type": "string" },
    "city": { "type": "string" },
    "state": { "type": "string" }
  },
  "required": ["street_address", "city", "state"]
}
```

#### JSON 指针

除了标识 `Schema`，您还可以标识 `Subschema`。最常见的方法是在 [指向](https://tools.ietf.org/html/rfc6901) 子模式的 URI 片段中使用 [JSON 指针](https://tools.ietf.org/html/rfc6901)。

JSON 指针描述了一个以斜线分隔的路径来遍历文档中对象中的键。因此， `/properties/street_address` 意味着：

1. 找到键的值  `properties`
2. 在该对象中，找到键的值  `street_address`

URI `https://example.com/schemas/address#/properties/street_address`  标识以下模式中子模式  `{ "type": "string" }`。

```diff
{
  "$id": "https://example.com/schemas/address",
  "type": "object",
  "properties": {
+   "street_address": { "type": "string" },
    "city": { "type": "string" },
    "state": { "type": "string" }
  },
  "required": ["street_address", "city", "state"]
}
```

#### $anchor

标识 `Subschema` 的一种不太常见的方法是使用 `$anchor` 关键字并在 URI 片段中使用该名称在 `Schema` 中创建命名锚点。锚点必须以字母开头，后跟任意数量的字母、数字、`-`、`_`、`:`、 或 `.`。

> 在 Draft 4 中，您以与 Draft 6-7 中相同的方式声明锚点，`$id` 只是只是 `id`（没有美元符号）。

> 在 Draft 6-7 中，使用 `$id` 仅包含 URI 片段的定义了命名锚点。URI 片段的值是锚点的名称。
>
> JSON Schema 没有定义当 `$id` 同时包含片段和非片段 URI 部分时应该如何解析。因此，在设置命名锚点时，不应在 URI 引用中使用非片段 URI 部分。

> 如果一个命名的锚点在定义时不遵循这些命名规则，则它的行为未定义。您的锚点可能在某些实现中起作用，但在其他实现中不起作用。

URI `https://example.com/schemas/address#street_address`  标识以下 `Schema` 的子模式 `{"$anchor": "#street_address", "type": "string"}`

```diff
{
  "$id": "https://example.com/schemas/address",

  "type": "object",
  "properties": {
    "street_address":
+      {
+       "$anchor": "street_address",
+       "type": "string"
+     },
    "city": { "type": "string" },
    "state": { "type": "string" }
  },
  "required": ["street_address", "city", "state"]
}
```

#### $ref

一个模式可以使用 `$ref` 关键字引用另一个模式。`$ref` 的值是根据模式的 [Base URI](https://json-schema.apifox.cn/#base-uri) 解析的 URI 引用。当获取 `$ref` 的值时，一个实现是使用解析的标识符来检索引用的模式并将该模式应用于实例中。

> 在**Draft 4-7**  中，`$ref` 表现略有不同。当一个对象包含一个 `$ref` 属性时，该对象被认为是一个引用，而不是一个模式。因此，您放入该对象的任何其他属性都不会被视为 JSON 模式关键字，并且会被验证器忽略。`$ref` 只能在需要模式的地方使用。

在这个例子中，假设我们要定义一个客户记录，其中每个客户可能都有一个送货地址和一个账单地址。地址总是相同的结构（有街道地址、城市和州），所以我们不想在存储地址的所有地方都存储同一个模式。这不仅会使模式更加冗长，而且会使将来更新变得更加困难。如果这个公司将来从事国际业务，想为所有地址添加一个国家/地区字段，那么最好在一个地方而不是在使用地址的所有地方进行此操作。

```json
{
  "$id": "https://example.com/schemas/customer",

  "type": "object",
  "properties": {
    "first_name": { "type": "string" },
    "last_name": { "type": "string" },
    "shipping_address": { "$ref": "/schemas/address" },
    "billing_address": { "$ref": "/schemas/address" }
  },
  "required": ["first_name", "last_name", "shipping_address", "billing_address"]
}
```

`$ref` 中的 URI 引用根据模式的 [基本 URI](https://json-schema.apifox.cn/#base-uri) ( `https://example.com/schemas/customer`) 进行解析，结果为  `https://example.com/schemas/address`. 该实现检索该模式并使用它来获取“shipping_address”和“billing_address”属性的值。

> `$ref` 在匿名模式中使用时，相对引用可能无法解析。假设此示例用作匿名模式。

```json
{
  "type": "object",
  "properties": {
    "first_name": { "type": "string" },
    "last_name": { "type": "string" },
    "shipping_address": { "$ref": "https://example.com/schemas/address" },
    "billing_address": { "$ref": "/schemas/address" }
  },
  "required": ["first_name", "last_name", "shipping_address", "billing_address"]
}
```

在 `/properties/shipping_address` 的 `$ref` 可以在没有非相对基础 URI 的情况下正常解析，但是在 `/properties/billing_address` 的 `$ref` 不能解析到非相对 URI，因此不能用于检索地址模式。

#### $defs

有时，我们有一小段仅用于当前模式的子模式，将它们定义为单独的模式是没有意义的。虽然我们可以使用 JSON 指针或命名锚点来识别任何子模式，但 `$defs` 关键字为我们提供了一个标准化的位置来保存想在当前模式文档中复用的子模式。

让我们扩展之前的客户模式示例，以使用名称属性的通用架构。为此定义一个新模式没有意义，它只会在这个模式中使用，所以使用 `$defs` 非常合适。

```json
{
  "$id": "https://example.com/schemas/customer",

  "type": "object",
  "properties": {
    "first_name": { "$ref": "#/$defs/name" },
    "last_name": { "$ref": "#/$defs/name" },
    "shipping_address": { "$ref": "/schemas/address" },
    "billing_address": { "$ref": "/schemas/address" }
  },
  "required": ["first_name", "last_name", "shipping_address", "billing_address"],

  "$defs": {
    "name": { "type": "string" }
  }
}
```

`$ref` 不仅有助于避免重复。它对于编写更易于阅读和维护的模式也很有用。模式的复杂部分可以 `$defs` 用描述性名称定义并在需要的地方引用。这允许模式的读者在深入研究更复杂的部分之前，更快速、更轻松地在高层次上理解模式。

> 引用外部子模式是可能的，但是一般来说，你希望将 `$ref` 限制在引用外部模式或 `$defs` 中定义的内部子模式。

#### 递归

该 `$ref` 关键字可以被用来创建一个自我递归模式。例如，您可能有一个 `person` 模式包含一个 children 的数组，每个 `children` 也是 `person`  的实例。

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "children": {
      "type": "array",
      "items": { "$ref": "#" }
    }
  }
}
```

英国王室的家庭树片段例子：

```json
{
  "name": "Elizabeth",
  "children": [
    {
      "name": "Charles",
      "children": [
        {
          "name": "William",
          "children": [{ "name": "George" }, { "name": "Charlotte" }]
        },
        {
          "name": "Harry"
        }
      ]
    }
  ]
}
```

上面，我们创建了一个引用自身的模式，有效地在验证器中创建了一个“循环”，这是合法且有用的。但是请注意，`$ref` 对另一个 `$ref` 的引用可能会导致解析器中的无限循环，这是明确禁止的。

```json
{
  "$defs": {
    "alice": { "$ref": "#/$defs/bob" },
    "bob": { "$ref": "#/$defs/alice" }
  }
}
```

## 参考

- [JSON Schema specification](http://json-schema.org/specification.html)
- [Getting Started Step-By-Step](http://json-schema.org/learn/getting-started-step-by-step.html)
- [JSON Schema Docs](https://www.learnjsonschema.com/)
- [Understanding JSON Schema](http://json-schema.org/understanding-json-schema/)
- [JSON Schema 规范（中文版）](https://json-schema.apifox.cn/)
- <https://github.com/NewFuture/miniprogram-json-schema>
