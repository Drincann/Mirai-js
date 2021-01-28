# Mirai.js

node.js 平台下的，基于 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 的 Mirai 机器人框架



## 使用

运行你的 Mirai http server，详见 [mirai-api-http](https://github.com/project-mirai/mirai-api-http)。[如何启动？](#如何启动mirai-console)

把项目 clone 到本地：

```bash
$ git clone https://github.com/GAOSILIHAI/Mirai-js.git
```

从`Mirai-js`解构`Bot`和`Message`：

```js
const { Bot, Message } = require('./src/Mirai-js');
```

获得一个`Bot`实例，调用`open`方法连接到你的 Mirai http server：

```js
const bot = new Bot();

// 创建一个会话
await bot.open({
    // mirai-api-http 的服务端地址，
    baseUrl: 'http://example:8080',
    // 要绑定的 qq，须确保该用户已在 mirai-console 登录
    qq: 1019933576,
    // authKey 用于验证连接者的身份，在插件配置文件中设置
    authKey: 'authKey',
});
```

>  ! 注意，所有方法都是异步的，返回一个`Promise`实例。

若想要远程控制 mirai-console 登录，可通过`Bot`的类方法`sendCommend`发送命令：

```js
await Bot.sendCommand({
    baseUrl: 'http://example:8080',
    authKey: 'authKey',
    // 指令名
    command: '/login',
    // 指令参数列表，这条指令等价于 /login 1019933576 password
    args: ['1019933576', 'password'],
});
```

向好友、群组发送消息：

```js
bot.sendMessage({
    // 好友 qq 号
    friend: '1019933576',
    // 群号，若与 friend 同时提供，则同时发送到好友和群
    group: '123456789',
    // massageId，引用该 messageId 确定的一条消息，由
    // sendMessage 返回，或在事件处理器中获得
    quote: 'messageId',
    // Message 实例
    message: new Message().addText('hello world!').addImageUrl('http://exapmle/image.jpg')，
})
```

还可以使用 http server 接口所需的原始格式来作为 message：

```js
bot.sendMessage({
    // 好友 qq 号
    friend: '1019933576',
    // 群号，若与 friend 同时提供，则同时发送到好友和群
    group: '123456789',
    // massageId，引用该 messageId 确定的一条消息，由
    // sendMessage 返回，或在事件处理器中获得
    quote: 'messageId',
    // obj 数组，是 http server 接口所需的原始格式，若提供则优先使用
    messageChain: [
    	{ type: 'Plain', text: 'hello world!'},
        { type: 'Image', url:;'http://example/image.jpg'},
	],
});
```

具体的`MessageChain`的消息类型见 [MessageType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md)

监听事件：

```js
// 监听好友消息事件
bot.on('FriendMessage', async ({
    messageChain,
    sender: {
        id: fromQQ,
        nickname: fromQQNickName,
        remark
    }
}) => {
    console.log({ fromQQ, fromQQNickName, remark });
    const { id: messageId } = messageChain[0];

    bot.sendMessage({
        friend: fromQQ,
        quote: messageId,
        messageChain
    });
});

// 监听群消息事件
bot.on('GroupMessage', async ({
    messageChain,
    sender: {
        id: fromQQ,
        memberName: fromNickname,
        permission: fromQQPermission,
        group: {
            id: fromGroup,
            name: groupName,
            permission: botPermission
        }
    }
}) => {
    console.log({ fromQQ, fromNickname, fromQQPermission });
    console.log({ fromGroup, groupName, botPermission });
    const { id: messageId } = messageChain[0];

    bot.sendMessage({
        group: fromGroup,
        quote: messageId,
        messageChain
    });
});
```

具体的事件表示及返回数据格式见 [http server API](https://github.com/project-mirai/mirai-api-http/blob/master/docs/API.md)、[EventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md)



## 如何启动mirai-console

[mirai-api-http](https://github.com/project-mirai/mirai-api-http) 是 [mirai-console](https://github.com/mamoe/mirai-console) 的一个插件，[mirai-console](https://github.com/mamoe/mirai-console) 负责与 Mirai 内核交互。

关于详细的 Mirai 生态，见 [该文档](https://github.com/mamoe/mirai/blob/dev/docs/mirai-ecology.md)。

启动 Mirai http server，一个推荐途径是：

使用 [mirai-console-loader](https://github.com/iTXTech/mirai-console-loader) 作为 [mirai-console](https://github.com/mamoe/mirai-console) 的启动器，安装 [mirai-api-http](https://github.com/project-mirai/mirai-api-http)，安装方法见 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 的 README。