# Mirai.js

node.js 平台下的，基于 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 的 Mirai 机器人框架



## 使用

### 准备

运行你的 Mirai http server，详见 [mirai-api-http](https://github.com/project-mirai/mirai-api-http)。[如何启动？](#如何启动mirai-console)

把项目 clone 到本地：

```bash
$ git clone https://github.com/GAOSILIHAI/Mirai-js.git
```

从`Mirai-js`解构`Bot`和`Message`：

```js
const { Bot, Message } = require('./src/Mirai-js');
```



### 登录

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

注意该方法的返回值，已知的问题：

> 'Login failed: Mirai 无法完成滑块验证. 使用协议 ANDROID_PHONE 强制要求滑块验证, 请更换协议后重试. 另请参阅: https://github.com/project-mirai/mirai-login-solver-selenium'



### 绑定已登录的 qq

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

>  ! 注意，除注册事件处理器的方法外，其他方法均是异步的。



### 发送消息

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

具体的`MessageChain`的消息类型见 [MessageType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md)。



### 注册事件处理器

注册事件处理器：

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

    // 你可以像这样来判断群成员的权限
    switch (fromQQPermission) {
        case Bot.GroupPermission.OWNER:
            // 群主
            break;
        case Bot.GroupPermission.ADMINISTRATOR:
            // 管理员
            break;
        case Bot.GroupPermission.MEMBER:
            // 普通群成员
            break;
    }
});
```

具体的事件表示及返回数据格式见 [http server API](https://github.com/project-mirai/mirai-api-http/blob/master/docs/API.md)、[EventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md)。



### 使用中间件

框架还提供了一系列用于处理消息的中间件：

```js
const { MiddleWare } = require('./src/Mirai-js');
```

注册事件监听器时，在回调函数处，通过`MiddleWare`的实例链式调用需要的中间件，最后调用`done`并传入你的回调函数来生成带有中间件的事件处理器。

```js
// 使用中间件
bot.on('FriendMessage', new MiddleWare().filter(['Plain', 'Image']).filtText().done(({
    // 第一个中间件，分类过的 messageChain
    classified,
    // 第二个中间件，文本部分
    text,

    messageChain,
    sender: {
        id: fromQQ,
        nickname: fromQQNickName,
        remark
    }
}) => {
    console.log({ fromQQ, fromQQNickName, remark, messageChain, classified, text });

    bot.sendMessage({
        friend: fromQQ,
        message: new Message().addText(text),
    });
}));
```





## 如何启动mirai-console

[mirai-api-http](https://github.com/project-mirai/mirai-api-http) 是 [mirai-console](https://github.com/mamoe/mirai-console) 的一个插件，[mirai-console](https://github.com/mamoe/mirai-console) 负责与 Mirai 内核交互。

关于详细的 Mirai 生态，见 [该文档](https://github.com/mamoe/mirai/blob/dev/docs/mirai-ecology.md)。

启动 Mirai http server，一个推荐途径是：

使用 [mirai-console-loader](https://github.com/iTXTech/mirai-console-loader) 作为 [mirai-console](https://github.com/mamoe/mirai-console) 的启动器，安装 [mirai-api-http](https://github.com/project-mirai/mirai-api-http)，安装方法见 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 的 README。





## 已知的问题

当我们的机器人下线并重新登陆后，当前会话会陷入一种未失效但无法操作的状态，强行操作（例如发送消息）将抛出服务端异常（status 500）。

重新登陆后再次调用`open`方法可以避免这个问题。

或者在需要重新登陆的时间下使用`autoReLogin`中间件，将会在掉线后自动登陆，例子：

```js
bot.on('BotOfflineEventForce',
    new MiddleWare()
       .autoReLogin({ bot, baseUrl, authKey, password })
       .done()
);
```

原理如下：

```js
bot.on('BotOfflineEventForce', async data => {
    try {
        // 重新登陆
        await Bot.sendCommand({
            baseUrl,
            authKey,
            command: '/login',
            args: [qq, password],
        });
        
        // 重建会话
        await bot.open();
    } catch (error) {
        console.log(error);
    }
});
```

在`BotOfflineEventForce`即机器人被挤下线后，发送`login`指令重新登陆，登陆完成后再次调用`open`，不需要传入任何参数（或者可以传入你想更改的参数），然后我们便成功重建了一个会话。
