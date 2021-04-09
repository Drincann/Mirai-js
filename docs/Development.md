# 参与开发

一个好的项目需要社区的力量。



## 暴露的接口

**Mirai-js** 包含四个模块：`Bot`、`Message`、`Middleware`、`Waiter`：

- `Bot` 是机器人的核心。
- `Message` 包含一些 **mirai-api-http** 约定的 `MessageType` ，用于 `Bot` 发送信息时方便地生成 `MessageChain`。
- `Middleware` 是 `Bot` 消息流的中间件实现。
- `Waiter` 是 `Bot` 的内部类，用来提供同步对话机制。



## 底层接口

- `./src/core`实现了 **mirai-api-http** 的接口。

- `./src/util`封装了一些非常简单的工具。



## 构建

```shell
npm run build
```

`webpack` 在 `./dist/browser` 下对浏览器模块打包。

`babel` 在 `./dist/node` 下对 node.js 模块打包。



## PR welcome

欢迎贡献代码