# 快速开始

## 加载依赖

### Node.js

从 `npm` 安装：

```bash
npm install mirai-js
```

然后从 `mirai-js` 解构：

```js
const { Bot, Message } = require('mirai-js');
```

### 浏览器

使用 cdn：

```html
<script src="https://cdn.jsdelivr.net/npm/mirai-js/dist/browser/mirai-js.js"></script>
```

然后从 `window.miraiJs` 解构：

```js
const { Bot, Message } = window.miraiJs;
```

或者在支持 UMD 规范的框架中引入:

!> mirai-js@2.7 中实现了 UMD 规范/协议，目前还不稳定。

```sh
npm i mirai-js@2.7.0-beta.1.0.0
```

```vue
<script setup lang="ts">
import { Bot, Message } from "mirai-js";
const bot = new Bot();
</script>
```

## 登录

在 **mirai-console** 中输入`/login qq password`。

> 若想要远程控制 **mirai-console** 登录，可通过 `bot` 的实例方法`sendCommend`发送命令，但在此之前应该首先通过 `open` 方法开启一个会话。

## 建立连接

!> 警告，不应将 `verifyKey`、`password` 暴露在可被公共访问的网络资源上

获得一个`Bot`实例，然后在实例上调用`open`方法连接到你的 **mirai-api-http** 服务：

```js
const bot = new Bot();

// 连接到一个 mirai-api-http 服务
await bot.open({
    baseUrl: 'http://example.com:8080',
    verifyKey: 'verifyKey',
    // 要绑定的 qq，须确保该用户已在 mirai-console 登录
    qq: 1019933576,
});
```

> 重复调用 `open` 方法将重建连接，需要重建连接时，可以传入想要修改的参数。
>
> 若未提供任何参数，将保持原先的配置。

## 发送消息

向好友发送消息：

```js
await bot.sendMessage({
    // 好友 qq 号
    friend: '1019933576',
    // Message 实例，表示一条消息
    message: new Message().addText('hello world!').addImageUrl('http://exapmle/image.jpg')，
});
```

> 注意！这些方法都是异步的

还可以使用 **mirai-api-http** 接口所需的原始格式来作为 message。

向群组发送消息：

```js
await bot.sendMessage({
    // 群号
    group: '123456789',
    // 是 http server 接口所需的原始格式，若提供则优先使用
    message: [
        { type: 'Plain', text: 'hello world!' },
        { type: 'Image', url: 'http://example/image.jpg' },
    ],
});
```

具体的`MessageChain`的消息类型见 [MessageType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md)。

## 接收消息和事件

注册事件处理器，接收好友消息：

```js
// 监听好友消息事件
bot.on('FriendMessage', async data => {
    await bot.sendMessage({
        friend: data.sender.id,
        message: new Message().addText('hello world!'),
    });
});
```

FriendMessage 事件的消息结构：

```json
{
    messageChain,
    sender: {
        id,
        nickname,
        remark
    }
}
```

> 框架以原始的 messageChain 的方式给出具体的消息内容，其结构是一个 MessageType 数组，各种 MessageType 见 **[MessageType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md)**
>
> 不想看没关系，如果你仅关注文本消息，那么我们可以使用框架预定义的中间件轻松解决这个问题。

接收群消息：

```js
// 监听群消息事件
bot.on('GroupMessage', async data => {
    await bot.sendMessage({
        group: data.sender.group.id,
        message: new Message().addText('hello world!'),
    });

    // 你可以像这样来判断群成员的权限
    switch (data.sender.permission) {
        case Bot.groupPermission.OWNER:
            // 群主
            break;
        case Bot.groupPermission.ADMINISTRATOR:
            // 管理员
            break;
        case Bot.groupPermission.MEMBER:
            // 普通群成员
            break;
    }
});
```

GroupMessage 事件的消息结构：

```json
{
    messageChain,
    sender: {
        id,
        memberName,
        permission,
        group: {
            id,
            name,
            permission
        }
    }
}
```

具体的事件类型及消息结构见 [EventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md)。

## 使用中间件

框架还提供了一系列预定义的用于处理消息的中间件：

Node.js：

```js
const { Middleware } = require('mirai-js');
```

浏览器端：

```js
const { Middleware } = window.miraiJs;
```

获得一个 `Middleware` 的实例：

```js
const middleware = new Middleware();
```

在实例上（链式）调用你需要的中间件：

`textProcessor`用于拼接`messageChain`所有的文本信息，并置于`data.text`，`groupFilter`则是过滤出指定群号的群消息事件。

```js
middleware.textProcessor().groupFilter([123456789, 987654321]);
```

通过调用 `done` 方法， 传入你的事件处理器，获得一个带有中间件的事件处理器：

```js
const processor = middleware.done(async data => {
    bot.sendMessage({
        friend: data.sender.id,
        message: new Message().addText(data.text),
    });
});
```

注册到一个事件上：

```js
bot.on('FriendMessage', processor);
```

也可以组合在一起：

```js
bot.on('FriendMessage', new Middleware()
    .textProcessor()
    .groupFilter([123456789, 987654321])
    .done(async data => {
        bot.sendMessage({
            friend: data.sender.id,
            message: new Message().addText(data.text),
        });
    })
);
```

此外，你也可以自定义中间件，使用 `use`：

最后调用 `next` 将控制权移交给下一个中间件。

```js
const processor = middleware.use((data, next) => {
    data.text = data.messageChain
        .filter((val) => val.type == 'Plain')
        .map((val) => val.text)
        .join('');
    next();
}).done(/* callback */);
```

## 已知的问题

当我们的机器人下线并重新登陆后，当前会话会陷入一种未失效但无法操作的状态，强行操作（例如发送消息）将抛出服务端异常（status 500）。

重新登陆后再次调用`open`方法可以避免这个问题。

或者在需要重新登陆的事件下使用预定义的`autoReLogin`中间件，将会在掉线后自动登陆，例子：

```js
bot.on('BotOfflineEventForce',
    new Middleware()
       .autoReLogin({ baseUrl, verifyKey, password })
       .done()
);
```
