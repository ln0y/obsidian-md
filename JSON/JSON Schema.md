---
aliases: []
tags: ['JSON', 'date/2023-05', 'year/2023', 'month/05']
date: 2023-05-15-星期一 09:55:20
update: 2023-05-16-星期二 16:59:28
---

## 简介

JSON Schema 是基于 JSON 格式，用于定义 JSON 数据结构以及校验 JSON 数据内容。 JSON Schema 官网地址：[json-schema.org/](http://json-schema.org/)

> JsonSchema 类似于 xml 的 schema 和 DTD 的作用，主要是用来规范 json 的格式。

## JSON Schema 用法

假设我们正在使用 `JSON` 对

## 关键字及其描述

| 关键字           | 描述                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| $schema          | 表示该 JSON Schema 文件遵循的规范                                                                                                  |
| title            | 为该 JSON Schema 文件提供一个标题                                                                                                  |
| description      | 关于该 JSON Schema 文件的描述信息                                                                                                  |
| type             | 表示待校验元素的类型（例如，最外层的 type 表示待校验的是一个 JSON 对象，内层 type 分别表示待校验的元素类型为，整数，字符串，数字） |
| properties       | 定义待校验的 JSON 对象中，各个 key-value 对中 value 的限制条件                                                                     |
| required         | 定义待校验的 JSON 对象中，必须存在的 key                                                                                           |
| minimum          | 用于约束取值范围，表示取值范围应该大于或等于 minimum                                                                               |
| exclusiveMinimum | 如果 minimum 和 exclusiveMinimum 同时存在，且 exclusiveMinimum 的值为 true，则表示取值范围只能大于 minimum                         |
| maximum          | 用于约束取值范围，表示取值范围应该小于或等于 maximum                                                                               |
| exclusiveMaximum | 如果 maximum 和 exclusiveMaximum 同时存在，且 exclusiveMaximum 的值为 true，则表示取值范围只能小于 maximum                         |
| multipleOf       | 用于约束取值，表示取值必须能够被 multipleOf 所指定的值整除                                                                         |
| maxLength        | 字符串类型数据的最大长度                                                                                                           |
| minLength        | 字符串类型数据的最小长度                                                                                                           |
| pattern          | 使用正则表达式约束字符串类型数据                                                                                                   |

## JSON Schema 关键字详解

JsonSchema 代码：

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "TestInfo",
  "description": "some information about test",
  "type": "object",
  "properties": {
    "name": {
      "description": "Name of the test",
      "type": "string"
    },
    "age": {
      "description": "age of test",
      "type": "integer"
    }
  },
  "required": ["name"]
}
```

详细解释：

- $schema: 用于指定 JSONSchema 的版本信息，该值由官方提供，不可乱写。该关键字可以省略。
- title：当前 schema 的标题信息。可以省略
- description：当前节点的描述
- type：当前节点的类型，最外层 type 代表 json 的最外层是什么样的类型。例如上方的例子中，符合该 JsonSchema 的 json 数据必需是一个 JsonObject 而不能是一个 JsonArray
- properties：代表当前节点的子节点信息。例如上方的例子中，符合该 JsonSchema 的 json 数据的信息可以存在“name”节点和“age”节点。按照上面的配置 required 信息来看，name 是必需要有的，而 age 是非必需的。
- required： 是一个数组类型，代表当前节点下必需的节点 key。例如上方例子中，规定了 json 的格式必需要有 name 节点。

符合上述 JsonSchema 的 json 数据如下：

第一种（不含有 age 节点，只含有 name 一个节点或者 name 及其若干个节点）：

```json
{
  "name": "shaofeer"
}
```

第二种（含有 age 节点，age 节点的值必需为 integer 类型）：

```json
{
  "name": "shaofeer",
  "age": 123,
  "create_time": "2019-12-12"
}
```

## type 的常用取值

| type 取值      | 对应的数据类型 |
| -------------- | -------------- |
| object         | Object         |
| array          | List           |
| integer/number | float 或 int   |
| null           | None           |
| boolean        | Boolean        |
| string         | String         |

## 关键字详解

### 最外层 type 为 object 时

- properties

> 该关键字的值是一个对象。

用于指定 JSON 对象中的各种不同 key 应该满足的校验逻辑，如果待校验 JSON 对象中所有值都能够通过该关键字值中定义的对应 key 的校验逻辑， **每个 key 对应的值，都是一个 JSON Schema**，则待校验 JSON 对象通过校验。 从这里，我们可以看到，只要待校验 JSON 对象的所有 key 分别都通过对应的 JSON Schema 的校验检测，这个对象才算是通过校验。

```json
{
  "properties": {
    "name": {
      "description": "姓名必须由2-3个字组成",
      "type": "string",
      "maxLength": 3,
      "minLength": 2
    },
    "age": {
      "description": "年龄必须大于18岁。并且不能超过60岁",
      "type": "integer",
      "minimum": 18,
      "maximum": 60
    }
  }
}
```

解释：**每个 key 对应的值，都是一个 JSON Schema:** 例如上方例子中，每一个 key(name/age) 对应的值都是一个 JSONSchema，JSONSchema 中的关键字及描述都可以使用。

- required

> 该关键字的值是一个数组，而数组中的元素必须是字符串，而且必须是唯一的。

该关键字限制了 JSON 对象中必须包含哪些一级 key。 如果一个 JSON 对象中含有 required 关键字所指定的所有一级 key，则该 JSON 对象能够通过校验。

```json
{ "required": ["id", "name", "price"] }
```

- minProperties、maxProperties

> 这两个关键字的值都是非负整数。规定最多节点个数与最少节点个数。

指定了待校验 JSON 对象中一级 key 的个数限制，minProperties 指定了待校验 JSON 对象可以接受的最少一级 key 的个数，而 maxProperties 指定了待校验 JSON 对象可以接受的最多一级 key 的个数。

另外，需要注意的是，省略 minProperties 关键字和该关键字的值为 0，具有相同效果。而，如果省略 maxProperties 关键字则表示对一级 key 的最大个数没有限制。例如，如果限制一个 JSON 对象的一级 key 的最大个数为 5，最小个数为 1，则 JSON Schema 如下：

```json
{
  "minProperties": 1,
  "maxProperties": 5
}
```

- patternProperties

> 该关键字的值是一个对象，该 JSON 对象的每一个一级 key 都是一个正则表达式，value 都是一个 JSON Schema。 指定符合正则表达式的 key 的规则。 只有待校验 JSON 对象中的一级 key，通过与之匹配的 patternProperties 中的一级正则表达式， 对应的 JSON Schema 的校验，才算通过校验。例如，如果 patternProperties 对应的值如下

```json
{
  "patternProperties": {
    "^a": {
      "type": "number"
    },
    "^b": {
      "type": "string"
    }
  }
}
```

上面的 JSON Schema 表示，待校验 JSON 对象中，所有以 a 开头的一级 key 的 value 都必须是 number，所有以 b 开头的一级 key 的 value 都必须是 string。

- additionalProperties

> 该关键字的值是一个 JSON Schema。

如果待校验 JSON 对象中存在，既没有在 properties 中被定义，又没有在 patternProperties 中被定义，那么这些一级 key 必须通过 additionalProperties 的校验。

### 最外层 type 为 array 时

- items:

> 该关键字的值是一个有效的 JSON Schema 或者一组有效的 JSON Schema。

当该关键字的值是一个有效的 JSON Schema 时，只有待校验 JSON 数组中的所有元素均通过校验，整个数组才算通过校验。例如，如果 items 关键字的具体定义如下：

```json
{
  "type": "array",
  "items": {
    "type": "string",
    "minLength": 5
  }
}
```

上面的 JSON Schema 的意思是，待校验 JSON 数组的元素都是 string 类型，且最小可接受长度是 5。那么下面这个 JSON 数组明显是符合要求的，具体内容如下：

```json
["myhome", "green"]
```

那么下面这个 JSON 数据则是不符合要求，因为第一个元素的长度小于 5，具体内容如下：

```json
["home", "green"]
```

以上对于 items 的介绍是对于所有元素来规定的。

**注意** 下面对 items 的详解，趋向于每一个元素的规则。

这里需要注意的是，如果 items 定义的有效的 JSON Schema 的数量和待校验 JSON 数组中元素的数量不一致，那么就要采用 **“取小原则”**。即，如果 items 定义了 3 个 JSON Schema，但是待校验 JSON 数组只有 2 个元素，这时，只要待校验 JSON 数组的前两个元素能够分别通过 items 中的前两个 JSON Schema 的校验，那么，我们认为待校验 JSON 数组通过了校验。而，如果待校验 JSON 数组有 4 个元素，这时，只要待校验 JSON 数组的前三个元素能够通过 items 中对应的 JSON Schema 的校验，我们就认为待校验 JSON 数组通过了校验。

例如，如果 items 的值如下：

```json
{
  "type": "array",
  "items": [
    {
      "type": "string",
      "minLength": 5
    },
    {
      "type": "number",
      "minimum": 10
    },
    {
      "type": "string"
    }
  ]
}
```

上面的 JSON Schema 指出了待校验 JSON 数组应该满足的条件，数组的第一个元素是 string 类型，且最小可接受长度为 5，数组的第二个元素是 number 类型，最小可接受的值为 10，数组的第三个元素是 string 类型。那么下面这两个 JSON 数组明显是符合要求的，具体内容如下：

```json
["green", 10, "good"]
["helloworld", 11]
```

下面这两个 JSON 数组却是不符合要求的，具体内容如下：

```json
["green", 9, "good"]
["good", 12]
```

- additionalItems

> 该关键字的值是一个有效的 JSON Schema。主要规定除了 items 内部规定的元素之外的元素规则。只有在 items 是一个 schema 数组的时候才可以使用。

需要**注意**的是，该关键字只有在 items 关键字的值为一组有效的 JSON Schema 的时候，才可以使用，用于规定超出 items 中 JSON Schema 总数量之外的待校验 JSON 数组中的剩余的元素应该满足的校验逻辑。当然了，只有这些剩余的所有元素都满足 additionalItems 的要求时，待校验 JSON 数组才算通过校验。

其实，你可以这么理解，当 items 的值为一组有效的 JOSN Schema 的时候，一般可以和 additionalItems 关键字组合使用，items 用于规定对应位置上应该满足的校验逻辑，而 additionalItems 用于规定超出 items 校验范围的所有剩余元素应该满足的条件。如果二者同时存在，那么只有待校验 JSON 数组同时通过二者的校验，才算真正地通过校验。

另外，需要注意的是，如果 items 只是一个有效的 JSON Schema，那么就不能使用 additionalItems，原因也很简单，因为 items 为一个有效的 JSON Schema 的时候，其规定了待校验 JSON 数组所有元素应该满足的校验逻辑。additionalItems 已经没有用武之地了。

如果一个 additionalItems 的值如下：

```json
{
  "type": "array",
  "items": [
    {
      "type": "string",
      "minLength": 5
    },
    {
      "type": "number",
      "minimum": 10
    }
  ],
  "additionalItems": {
    "type": "string",
    "minLength": 2
  }
}
```

上面的 JSON Schema 的意思是，待校验 JSON 数组第一个元素是 string 类型，且可接受的最短长度为 5 个字符，第二个元素是 number 类型，且可接受的最小值为 10，剩余的其他元素是 string 类型，且可接受的最短长度为 2。那么，下面三个 JSON 数组是能够通过校验的，具体内容如下：

```json
["green", 10, "good"]
["green", 11]
["green", 10, "good", "ok"]
```

下面 JSON 数组是无法通过校验的，具体内容如下：

```json
["green", 10, "a"]
["green", 10, "ok", 2]
```

- minItems、maxItems

> 这两个关键字的值都是非负整数。 指定了待校验 JSON 数组中元素的个数限制，minItems 指定了待校验 JSON 数组可以接受的最少元素个数，而 maxItems 指定了待校验 JSON 数组可以接受的最多元素个数。

另外，需要注意的是，省略 minItems 关键字和该关键字的值为 0，具有相同效果。而，如果省略 maxItems 关键字则表示对元素的最大个数没有限制。

例如，如果限制一个 JSON 数组的元素的最大个数为 5，最小个数为 1，则 JSON Schema 如下：

```json
"minItems": 1,
"maxItems": 5
```

- uniqueItems

> 该关键字的值是一个布尔值，即 boolean（true、false）。

当该关键字的值为 true 时，只有待校验 JSON 数组中的所有元素都具有**唯一性**时，才能通过校验。当该关键字的值为 false 时，任何待校验 JSON 数组都能通过校验。 另外，需要注意的是，省略该关键字和该关键字的值为 false 时，具有相同的效果。例如：

```json
"uniqueItems": true
```

### 当 type 的值为 integer 或者 number 时

> integer 和 number 的区别，integer 相当于 python 中的 int 类型，而 number 相当于 python 中的 int 或 float 类型

- multipleOf

> 该关键字的值是一个大于 0 的 number，即可以是大于 0 的 int，也可以是大于 0 的 float。只有待校验的值能够被该关键字的值**整除**，才算通过校验。

如果含有该关键字的 JSON Schema 如下：

```json
{
  "type": "integer",
  "multipleOf": 2
}
```

> 那么，2、4、6 都是可以通过校验的，但是，3、5、7 都是无法通过校验的，当然了，2.0、4.0 也是无法通过校验的，但是，并不是因为 multipleOf 关键字，而是因为 type 关键字。

如果含有 multipleOf 关键字的 JSON Schema 如下：

```json
{
  "type": "number",
  "multipleOf": 2.0
}
```

> 那么，2、2.0、4、4.0 都是可以通过校验的，但是，3、3.0、3、3.0 都是无法通过校验的。

- maximum 、exclusiveMaximum

> `maximum` 该关键字的值是一个 number，即可以是 int，也可以是 float。该关键字规定了待校验元素可以通过校验的最大值。即传入的值必须小于 maximum。 `exclusiveMaximum` 该关键字和 `maximum` 一样，规定了待校验元素可以通过校验的最大值，不同的是待校验元素可以等于 exclusiveMaximum 指定的值。即比 maximum 多了一个他自身这个边界值.

```json
{
  "type": "number",
  # 设定 maximum 为12.3 则传入值必须小于12.3
  # "maximum": 12.3,
  # 设定 exclusiveMaximum为12.3 则传入值是小于等于12.3
  "exclusiveMaximum": 12.3
}
```

- minimum、exclusiveMinimum

> `minimum`、`exclusiveMinimum` 关键字的用法和含义与 `maximum`、`exclusiveMaximum` 相似。唯一的区别在于，一个约束了待校验元素的最小值，一个约束了待校验元素的最大值。

### 当 type 取值为 string 时

- maxLength

> 该关键字的值是一个非负整数。该关键字规定了待校验 JSON 元素可以通过校验的最大长度，即待校验 JSON 元素的最大长度必须小于或者等于该关键字的值。

- minLength

> 该关键字的值是一个非负整数。该关键字规定了待校验 JSON 元素可以通过校验的最小长度，即待校验 JSON 元素的最小长度必须大于或者等于该关键字的值。

- pattern

> 该关键字的值是一个正则表达式。只有待校验 JSON 元素符合该关键字指定的正则表达式，才算通过校验。

- format

> 该关键字的值可以是以下取值：`date`、`date-time`（时间格式）、`email`（邮件格式）、`hostname`（网站地址格式）、`ipv4`、`ipv6`、`uri` 等等。

```json
{
  "type": "string",
  "format": "email"
}
```

使用 format 关键字时，**在实例化 validator 时必须给它传 `format_checker` 参数,fromat_checker 参数的值即使各种版本的 JSON 模式规范的验证器类**，如：

[Draft7Validator](https://python-jsonschema.readthedocs.io/en/latest/validate/#jsonschema.Draft7Validator) [Draft6Validator](https://python-jsonschema.readthedocs.io/en/latest/validate/#jsonschema.Draft6Validator) [Draft4Validator](https://python-jsonschema.readthedocs.io/en/latest/validate/#jsonschema.Draft4Validator)

当你实例化 validator 时,如果没有给它传 format_checker 参数, jsonschema 是不会自动校验 schema 中的 format 关键字的.因此,你需要做以下步骤: 1.额外导入 JSON Schema 某个版本的模式规范如：from jsonschema import draft7_format_checker 2.实例化 validator 时传入：validate(instance=json_data, schema=my_schema, format_checker=draft7_format_checker)

### 全类型可用

- enum

> 该关键字的值是一个数组，该数组至少要有一个元素，且数组内的每一个元素都是唯一的。 如果待校验的 JSON 元素和数组中的某一个元素相同，则通过校验。否则，无法通过校验。

**注意：** 该数组中的元素值可以是任何值，包括 null。省略该关键字则表示无须对待校验元素进行该项校验。例如：

```json
{
  "type": "number",
  "enum": [2, 3, null, "hello"]
}
```

- const

> 该关键字的值可以是任何值，包括 null。如果待校验的 JSON 元素的值和该关键字指定的值相同，则通过校验。否则，无法通过校验。

- allOf

> 该关键字的值是一个非空数组，数组里面的每个元素都必须是一个有效的 JSON Schema。 只有待校验 JSON 元素通过数组中**所有的**JSON Schema 校验，才算真正通过校验。

- anyOf

> 该关键字的值是一个非空数组，数组里面的每个元素都必须是一个有效的 JSON Schema。 如果待校验 JSON 元素能够通过数组中的**任何一个**\~~~~JSON Schema 校验，就算通过校验。

- oneOf

> 该关键字的值是一个非空数组，数组里面的每个元素都必须是一个有效的 JSON Schema。 如果待校验 JSON 元素**能且只能**通过数组中的**某一个**JSON Schema 校验，才算真正通过校验。**不能通过任何一个校验和能通过两个及以上的校验**，都**不算真正**通过校验。

- not

> 该关键字的值是一个 JSON Schema。只有待校验 JSON 元素**不能通过**该关键字指定的 JSON Schema 校验的时候，待校验元素才算通过校验。

- default

> 该关键字的值是没有任何要求的。该关键字常常用来指定待校验 JSON 元素的默认值，当然，这个默认值最好是符合要求的，即能够通过相应的 JSON Schema 的校验。 另外，需要注意的是，该关键字除了**提示作用**外，并不会产生任何实质性的影响。

### type 关键字

> 需要特别注意的是，type 关键字的值可以是一个 string，也可以是一个数组。 如果 type 的值是一个 string，则其值只能是以下几种：null、boolean、object、array、integer/number、string。 如果 type 的值是一个数组，则数组中的元素都必须是 string，且其取值依旧被限定为以上几种。**只要带校验 JSON 元素是其中的一种**，则通过校验。

**注意，** 以上 JSON Schema 只是为了展示部分关键字的用法，可能和实际应用略有不同。

### dependencies 关键字

> 依赖关系

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "properties": {},
  "dependencies": {
    "age": ["name"]
  }
}
```

> 上述 schema 表示，age 依赖于 name，如果 age 出现，name 必须出现

### $ref 关键字

使用该关键字可以引用一个规范

```json
{
  "warehouseLocation": {
    "description": "Coordinates of the warehouse where the product is located.",
    "$ref": "https://example.com/geographical-location.schema.json"
  }
}
```

### if-then-else 关键字

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "foo": {
      "type": "string"
    },
    "bar": {
      "type": "string"
    }
  },
  "if": {
    "properties": {
      "foo": {
        "enum": ["bar", "123"]
      }
    },
    "required": ["foo"]
  },
  "then": {
    "required": ["bar"]
  },
  "else": {
    "required": ["cc"]
  }
}
```

符合上述规则的 json（最简单的两种方式）：

```json
{
  "foo": "bar22",
  "cc": 123
}

{
  "foo": "bar",
  "bar": "123"
}
```

概述：

```text
if条件为：key为foo的值是bar或者123 返回true，否则返回false
if返回true执行then：
    then的规则，bar必须存在
if返回false执行else
    else规则，cc必须存在
```

> 官方的参考文档如下： [json-schema.org/latest/json…](http://json-schema.org/latest/json-schema-validation.html) [json-schema.org/implementat…](https://json-schema.org/implementations.html)

## 参考

- [JSON Schema specification](http://json-schema.org/specification.html)
- [Getting Started Step-By-Step](http://json-schema.org/learn/getting-started-step-by-step.html)
- [JSON Schema Docs](https://www.learnjsonschema.com/)
- [JSON Schema 规范（中文版）](https://json-schema.apifox.cn/)
- <https://github.com/NewFuture/miniprogram-json-schema>
