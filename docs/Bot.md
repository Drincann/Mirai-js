# 机器人 Bot

## 静态属性

### GroupPermission

`GroupPermission` 可作为判断群成员权限的途径

#### 属性

- `GroupPermission.OWNER`：`"OWNER"`

- `GroupPermission.ADMINISTRATOR`：`"ADMINISTRATOR"`

- `GroupPermission.MEMBER`：`"MEMBER"`

#### 示例

```js
// 你可以像这样来判断群成员的权限
switch (data.sender.permission) {
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
```

#### 实现

```js
Bot.GroupPermission = {
    get OWNER() {
        return 'OWNER';
    },
    get ADMINISTRATOR() {
        return 'ADMINISTRATOR';
    },
    get MEMBER() {
        return 'MEMBER';
    },
};
```



## 静态方法

!> 注意，若没有特别指出，则为异步方法

### sendCommand

`sendCommand` 向 mirai-console 发送指令，可用于登录。

#### 参数

- `baseUrl` 必选

  mirai-api-http 的网络位置。

- `authKey` 必选

  mirai-api-http 的认证秘钥。

- `command` 必选

  指令名。

- `args` 可选

  一个 string 数组，表示指令的参数。

#### 返回值

`{ message }`，message 是控制台返回的字符串消息。

#### 示例

```js
await Bot.sendCommand({
    baseUrl: 'http://example.com:8080',
    authKey: 'authKey',
    command: '/login',
    args: ['1019933576', 'password'],
});
```



## 普通方法

### open

`open` 方法用于连接到一个 **mirai-api-http** 服务，并绑定一个已在 **mirai-console** 登录的机器人，重复调用将会重置与服务端的 session。

#### 参数

- `baseUrl` 必选

  mirai-api-http 的网络位置。

- `authKey` 必选

  mirai-api-http 的认证秘钥。

- `qq` 必选

  欲绑定到的 qq 号。

#### 示例

```js
await bot.open({
    baseUrl: 'http://example.com:8080',
    authKey: 'authKey',
    // 要绑定的 qq，须确保该用户已在 mirai-console 登录
    qq: 1019933576,
});
```

```js
// 重复调用时不需要提供参数
await bot.open();
```



### close

`close` 方法用于关闭一个到 `mirai-api-http` 的连接。

#### 参数

- `keepProcessor` 可选

  是否保留注册在该实例上的事件处理器，默认值 `false`。

- `keepConfig` 可选

  是否保留在调用 `open` 时提供的 session、baseUrl、qq、authKey 等配置，默认值 `false`。

#### 示例

```js
bot.close({ keepProcessor: true });
```



### sendMessage

`sendMessage`方法向好友或群组发送一条消息。

#### 参数

- `temp` 可选

  是否是临时会话，默认值 `false`。

- `friend` 二选一

  好友 qq 号。

- `group` 二选一

  群号。

- `quote` 可选

  通过 `messageId` 来引用一条消息。

  `messageId` 可通过本方法返回，或在事件处理器中的 `messageChain` 中获取。

- `message` 二选一

  用来指示发送的消息内容，需要提供一个 `Message` 的实例。

  `Message` 的相关 API 见 [Message](/Message)。

- `messageChain` 二选一

  用来指示发送的消息内容，是一个 `MessageType` 数组。

  `MessageType` 是 **mirai-api-http** 接口需要的原始类型，见 [MessageType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md)。

#### 返回值

`messageId`，标识刚刚发送的消息。

#### 示例

```js
bot.on('FriendMessage', async data => {
    const { id: messageId } = data.messageChain[0];
    await bot.sendMessage({
        friend: fromQQ,
        quote: messageId,
        message: new Message().addText('hello world!'),
    });
});
```



### on

?> 这是一个同步方法

`on`方法将在实例上注册一个针对指定事件的事件处理器。

#### 参数

- `eventType` 必选

  事件类型，事件类型及消息结构见 [eventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md)。

- `callback` 必选

  用于处理该事件的回调函数。

#### 返回值

一个 `handle`，标识一个唯一的事件处理器，用于移除该处理器。

#### 示例

```js
// 监听好友消息事件
bot.on('FriendMessage', async data => {
	// ...
});
```

#### 消息结构

这里收集了 [eventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md) 中未提到的事件类型。

好友消息 "FriendMessage"：

```json
{
    "type": "FriendMessage",   // 消息类型：GroupMessage或FriendMessage或TempMessage或各类Event
    "messageChain": [          // 消息链，是一个消息对象构成的数组
      {
          "type": "Source",
          "id": 123456,
          "time": 123456789
      },
      {
          "type": "Plain",
          "text": "Miral牛逼"
      }
    ],
    "sender": {                // 发送者信息
        "id": 1234567890,      // 发送者的QQ号码
        "nickname": "",        // 发送者的昵称
        "remark": ""           // 发送者的备注
    }
}
```

群消息 "GroupMessage"：

```json
{
    "type": "GroupMessage",            // 消息类型：GroupMessage或FriendMessage或TempMessage或各类Event
	"messageChain": [                  // 消息链，是一个消息对象构成的数组
      {
	    "type": "Source",
	    "id": 123456,
        "time": 123456789
	  },
      {
        "type": "Plain",
        "text": "Miral牛逼"
      }
    ],
    "sender": {                         // 发送者信息
        "id": 123456789,                // 发送者的QQ号码
        "memberName": "化腾",            // 发送者的群名片
        "permission": "MEMBER",         // 发送者的群限权：OWNER、ADMINISTRATOR或MEMBER
        "group": {                      // 消息发送群的信息
            "id": 1234567890,           // 发送群的群号
            "name": "Miral Technology", // 发送群的群名称
            "permission": "MEMBER"      // 发送群中，Bot的群限权
        }
    }
}
```

此外，还有 `WebSocket` 事件：

```js
'error'              : (err: Error) => void
'close'              : (code: number, message: string) => void
'unexpected-response': (request: http.ClientRequest, response: http.IncomingMessage) => void
```

框架采用 `WebSocket` 接收 **mirai-api-http** 推送的消息。



### one

?> 这是一个同步方法

`one`方法将在实例上注册一个 **一次性** 的针对指定事件的事件处理器，该处理器仅被调用一次。

#### 参数

- `eventType` 必选

  事件类型，事件类型及消息结构见 [eventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md)。

- `callback` 必选

  用于处理该事件的回调函数。

#### 示例

```js
// 监听好友消息事件
bot.one('FriendMessage', async data => {
	// ...
});
```

#### 

### off

?> 这是一个同步方法

`off` 方法用于移除一个事件处理器

#### 参数

- `eventType` 必选

  欲移除的事件处理器的事件类型，事件类型及消息结构见 [eventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md)。

- `handle` 必选

  欲移除的事件处理器的唯一标识。

#### 示例

```js
const handle = bot.on('FriendMessage', async data => {
	// ...
});

// ...

bot.off('FriendMessage', handle);
```



### offAll

?> 这是一个同步方法

`offAll` 方法用于移除所有事件下的事件处理器。

#### 参数

无

#### 示例

```js
bot.offAll();
```



### recall

`recall` 方法用于撤回一条消息。

#### 参数

- `messageId` 必选

  欲撤回消息的标识

#### 返回值

无

#### 示例

```js
const messageId = await bot.sendMessage({
    friend: fromQQ,
    quote: messageId,
    message: new Message().addText('hello world!'),
});

await bot.recall({ messageId });
```



### uploadImage

`uploadImage` 方法用于向服务器上传一张图片，返回的信息可用于发送图片消息。

#### 参数

- `type` 可选

  图片类型，必须为下列值之一 `["friend", "group", "temp"]`，默认值 `"group"`。

  不同类型返回的图片 id 形式不同。

  !> type 指定为 'friend' 或 'temp' 时发送的图片显示红色感叹号，无法加载，group 则正常

- `img` 二选一

  图片二进制数据

- `filename` 二选一

  图片的本地文件路径

#### 返回值

`{ imageId, url, path }`

#### 示例





