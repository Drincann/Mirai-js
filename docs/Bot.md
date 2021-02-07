# 机器人 Bot

# 静态属性

## GroupPermission

`GroupPermission` 可作为判断群成员权限的途径。

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



# 静态方法

!> 注意，若没有特别指出，则为异步方法

## sendCommand

`sendCommand` 向 mirai-console 发送指令，可用于登录。

#### 参数

- `baseUrl: string` 必选

  mirai-api-http 的网络位置。

- `authKey: string` 必选

  mirai-api-http 的认证秘钥。

- `command: string` 必选

  指令名。

- `args: string[]` 可选

  一个 string 数组，表示指令的参数。

#### 返回值

`{ message }`，message 是控制台返回的字符串消息。

#### 示例

```js
const { message } = await Bot.sendCommand({
    baseUrl: 'http://example.com:8080',
    authKey: 'authKey',
    command: '/login',
    args: ['1019933576', 'password'],
});
```



# 普通方法

## open

`open` 方法用于连接到一个 **mirai-api-http** 服务，并绑定一个已在 **mirai-console** 登录的机器人，重复调用将会重置与服务端的 session。

#### 参数

- `baseUrl: string` 必选

  mirai-api-http 的网络位置。

- `authKey: string` 必选

  mirai-api-http 的认证秘钥。

- `qq: number` 必选

  欲绑定到的 qq 号。

#### 返回值

无

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



## close

`close` 方法用于关闭一个到 `mirai-api-http` 的连接。

#### 参数

- `keepProcessor: boolean` 可选

  是否保留注册在该实例上的事件处理器，默认值 `false`。

- `keepConfig: boolean` 可选

  是否保留在调用 `open` 时提供的 session、baseUrl、qq、authKey 等配置，默认值 `false`。

#### 返回值

无

#### 示例

```js
bot.close({ keepProcessor: true });
```



## sendMessage

`sendMessage`方法向好友或群组发送一条消息。

#### 参数

- `temp: boolean` 可选

  是否是临时会话，默认值 `false`。

- `friend: number` 二选一

  好友 qq 号。

- `group: number` 二选一

  群号。

- `quote: number` 可选

  通过 `messageId` 来引用一条消息。

  `messageId` 可通过本方法返回，或在事件处理器中的 `messageChain` 中获取。

- `message: Message` 二选一

  用来指示发送的消息内容，需要提供一个 `Message` 的实例。

  `Message` 的相关 API 见 [Message](/Message)。

- `messageChain: MessageType[]` 二选一

  用来指示发送的消息内容，是一个 `MessageType` 数组。

  `MessageType` 是 **mirai-api-http** 接口需要的原始类型，见 [MessageType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md)。

#### 返回值

`messageId: number`，标识刚刚发送的消息。

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



## on

?> 这是一个同步方法

`on`方法将在实例上注册一个针对指定事件的事件处理器。

#### 参数

- `eventType: string` 必选

  事件类型，事件类型及消息结构见 [eventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md)。

- `callback: function` 必选

  用于处理该事件的回调函数。

#### 返回值

 `handle: number`，标识在给定的 `eventType` 下的一个唯一的事件处理器，用于移除该处理器。

?> 对于 `handle` 来说，每个 `eventType` 都是一个独立的命名空间，在移除事件处理器时，需要给出对应 `handle` 的 `eventType` 

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

此外，框架使用 `WebSocket` 接收 **mirai-api-http** 推送的消息， `WebSocket` 事件也可以通过该方法处理：

```js
'error'              : (err: Error) => void
'close'              : (code: number, message: string) => void
'unexpected-response': (request: http.ClientRequest, response: http.IncomingMessage) => void
```





## one

?> 这是一个同步方法

`one`方法将在实例上注册一个 **一次性** 的针对指定事件的事件处理器，该处理器仅被调用一次。

#### 参数

- `eventType: string` 必选

  事件类型，事件类型及消息结构见 [eventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md)。

- `callback: function` 必选

  用于处理该事件的回调函数。
  
- `strict: boolean` 可选

  该参数表示是否严格检测开发者的处理器调用，默认值为 `false`。

  当该参数置为 `false` 时，不论接受到的消息是否被中间件拦截，都将马上移除该处理器。

  当该参数置为 `ture` 时，只有开发者提供的处理器被调用结束时才会移除该处理器,

#### 返回值

无

#### 示例

```js
// 监听好友消息事件
bot.one('FriendMessage', async data => {
	// ...
});
```



## off

?> 这是一个同步方法

`off` 方法用于移除一个事件处理器。

#### 参数

- `eventType: string` 必选

  欲移除的事件处理器的事件类型，事件类型及消息结构见 [eventType](https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md)。

  ?> 每个 `eventType` 都是一个独立的命名空间，不同 `eventType` 下的 `handle` 可能重复，在移除时必须给出对应的 `eventType`

- `handle: number | number[]` 可选

  欲移除的事件处理器的唯一标识。
  
  或一个可通过 `forEach` 迭代的数组，该方法将会遍历所有在数组中给出的 `handle`，并移除对应的事件处理器。
  
  当不提供该参数时，将移除指定 `eventType` 下的所有事件处理器。
  
  要一次调用移除指定多个事件下的事件处理器，可以使用 `offAll`。

#### 返回值

无

#### 示例

```js
const handle = bot.on('FriendMessage', async data => {
	// ...
});

bot.off('FriendMessage', handle);
```



## offAll

?> 这是一个同步方法

`offAll` 方法用于移除所有事件下的事件处理器。

#### 参数

- `eventType: string | string[]` 可选

  给出该参数，表示要移除特定事件的所有处理器，可以是一个 `string`，也可以是一个 `string` 数组。

  当给出一个 `string` 时，与 `off` 方法等价。

#### 返回值

无

#### 示例

```js
bot.offAll();
```

```js
bot.offAll(['FriendMessage', 'GroupMessage']);
```



## recall

`recall` 方法用于撤回一条消息。

#### 参数

- `messageId: number` 必选

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



## uploadImage

`uploadImage` 方法用于向服务器上传一张图片，返回的信息可用于发送图片消息。

#### 参数

- `type: string` 可选

  图片类型，必须为下列值之一 `["friend", "group", "temp"]`，默认值 `"group"`。

  不同类型返回的 `imageId` 形式不同。

  !> type 指定为 'friend' 或 'temp' 时发送的图片显示红色感叹号，无法加载，group 则正常

- `img: Buffer` 二选一

  图片二进制数据。

- `filename: string` 二选一

  本地文件的路径。

#### 返回值

`{ imageId: string, url: string, path: string }`

返回一个包含 "图片 id"、"图片在腾讯服务器的 url" 和 "图片在 mirai-api-http 服务端的位置" 的 Map，用法见示例。

#### 示例

```js
const { imageId, url, path } = await uploadImage({ filename });

await bot.sendMessage({
    friend: 1019933576,
    message: new Message().addImageUrl(url).addImagePath(path).addImageId(imageId),
});
```



## uploadVoice

`uploadVoice` 方法用于向服务器上传一段语音，返回的信息可用于发送语音消息。

?> FIXME: 目前该方法存在很大问题，返回的 voiceId 无法发送给好友，不过可以发到群里，但无法在短时间内正常播放。

#### 参数

- `type: string` 请忽略该参数

  语音类型，必须为下列值之一 `["friend", "group", "temp"]`，目前仅 `"group"` 可用。

- `voice: Buffer` 二选一

  语音二进制数据。

- `filename: string` 二选一

  本地文件的路径。

#### 返回值

`{ voiceId: string, url: string, path: string } `

返回一个包含 "语音 id"、"语音在腾讯服务器的 url" 和 "语音在 mirai-api-http 服务端的位置" 的 Map，用法见示例。

#### 示例

```js
const { voiceId, url, path } = await uploadVoice({ filename });

await bot.sendMessage({
    friend: 1019933576,
    message: new Message().addVoiceUrl(url).addVoicePath(path).addVoiceId(voiceId),
});
```



## getFriendList

`getFriendList` 方法用于获取好友列表。

#### 参数

无

#### 返回值

`[ { id: number, name: string, remark: string }, ...]`

一个 Map 数组，每个 Map 给出一个好友信息，`id`代表 qq 号，`name` 代表昵称，`remark` 代表备注。

#### 示例

```js
const friendList = await bot.getFriendList();
```



## getGroupList

`getGroupList` 方法用于获取群列表。

#### 参数

无

#### 返回值

`[ { id: number, name: string, permission: string }, ...]`

一个 Map 数组，每个 Map 给出一个群信息，`id`代表群号，`name` 代表群名称，`permission` 代表机器人在该群的权限。

#### 示例

```js
const groupList = await bot.getGroupList();
```

```js
// 你可以像这样来判断群成员的权限
switch (permission) {
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



## getMemberList

`getMemberList` 方法用于获得指定群的成员列表。

#### 参数

- `group: number` 必选

  群号

#### 返回值

`[ { id: number, name: string, permission: string }, ...]`

一个 Map 数组，每个 Map 给出一个群成员信息，`id`代表成员 qq 号，`name` 代表成员群名片，`permission` 代表群成员权限。

#### 示例

```js
const memberList = await bot.getMemberList();
```



## getMemberInfo

`getMemberInfo` 方法用于获取指定群成员的名片和头衔信息。

#### 参数

- `group: number` 必选

  群成员所在群号

- `qq: number` 必选

  群成员 qq 号

#### 返回值

`{ name: string, title: string }`

分别代表群名片和群头衔

#### 示例

```js
const { name, title } = await getMemberInfo({ group: 123456789, qq: 1019933576 });
```



## setMemberInfo

`setMemberInfo` 方法用于设置指定群成员的名片和头衔信息。

#### 参数

- `group: number` 必选

  群成员所在群号

- `qq: number` 必选

  群成员 qq 号

- `name: string` 可选

  要设置的群名片

- `title: string` 可选

  要设置的群头衔

#### 返回值

无

#### 示例

```js
await setMemberInfo({ group: 123456789, qq: 1019933576, title: 'title' });
```



## mute

`mute` 方法用于禁言群成员。

#### 参数

- `group: number` 必选

  群号

- `qq: number` 必选

  群成员 qq 号

- `time: number` 必选

  禁言时长，单位：s（秒）

#### 返回值

无

#### 示例

```js
await mute({ group: 123456789, qq: 1019933576, time: 3600 });
```



## muteAll

`muteAll` 方法用于全员禁言。

#### 参数

- `group: number` 必选

  群号

#### 返回值

无

#### 示例

```js
await muteAll({ group: 123456789 });
```



## unmute

`mute` 方法用于j解除群成员禁言。

#### 参数

- `group: number` 必选

  群号

- `qq: number` 必选

  群成员 qq 号

#### 返回值

无

#### 示例

```js
await unmute({ group: 123456789, qq: 1019933576 });
```



## muteAll

`muteAll` 方法用于解除全员禁言。

#### 参数

- `group: number` 必选

  群号

#### 返回值

无

#### 示例

```js
await unmuteAll({ group: 123456789 });
```



## removeMember

`removeMember` 方法用于移除群成员。

#### 参数

- `group: number` 必选

  群号。

- `qq: number` 必选

  群成员 qq 号。

- `message: string` 可选

  移除群成员时的附加信息，默认为空串 `""`。

#### 返回值

无

#### 示例

```js
await removeMember({ group: 123456789, qq: 1019933576, message: "message" });
```



## quitGroup

`quitGroup` 方法用于令机器人退出指定群。

#### 参数

- `group: number` 必选

  群号。

#### 返回值

无

#### 实例

```js
await quitGroup({ group: 123456789 })
```



## getConfig

`getConfig` 方法用于获取 **mirai-api-http** 的 session 配置。

#### 参数

无

#### 返回值

`{ cacheSize, enableWebsocket }`



## setConfig

`setConfig` 方法用于设置 **mirai-api-http** 的 session 配置。

?> 该配置由框架控制

#### 参数

- `cacheSize` 可选
- `enableWebSocket` 可选

#### 返回值

无



# 错误处理

## Bot 实例的方法

`Bot` 实例的方法将在出错后抛出异常，message 将给出具体原因。



## WebSocket 连接

若未添加对 `WebSocket` 的事件 `error`、`close`、`unexpected-response` 的处理器，当事件触发时将向控制台分别打印：

>ws error
>
>{ ... }

> ws close
>
> { code, message }

> ws unexpectedResponse
>
> { req, res }