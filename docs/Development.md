# 参与开发

主要维护者：[drincann](https://github.com/drincann?tab=repositories)

一个好的项目需要社区的力量。



## 概况

**Mirai-js** 包含三个模块：`Bot`、`Message`、`Middleware`：

- `Bot` 是机器人的核心逻辑。

- `Message` 包含一些 **mirai-api-http** 约定的 `MessageType` ，用于 `Bot` 发送信息时方便地生成 `MessageChain`。

- `Middleware` 是 `Bot` 消息处理的中间件。

此外：

- `./src/core`实现了 **mirai-api-http** 提供的 http 接口。

- `./src/util`封装了一些非常简单的工具。



## 待办

- [x] 文档
  - [ ] 提供更好的文档
- [ ] 功能
  - [ ] 更好地、简洁地生成`MessageChain`的方法
  - [x] 实现更多的`MessageType`
  - [ ] 实现更多的`Middleware`
  - [x] 实现`Middleware`的可扩展，例如可自定义中间件的接口，或者其他
  - [x] 中断功能，参考 issue#2
- [ ] 其他一切好的想法

欢迎提 issue 或在 discussions 中讨论

pr welcome
