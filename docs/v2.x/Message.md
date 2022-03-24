# 消息类型 Message

?> 目前该模块仅用于发送消息时消息链的生成



# 使用

```js
await bot.sendMessage({
    group: 123456789,
    message: new Message().addAt(1019933576).addText('Hello world!'),
});
```

每一个以 `add` 开头的方法都将返回实例本身，可以链式追加。

?> `Message` 实例内部维护一个消息链 —— `MessageChain`，每次调用方法都将 `push` 一个 `MessageType` 实例（`MessageType` 在内部维护）。



# 静态方法

## createForwardMessage

在 v2.6.0 开始支持。

该方法提供发送合并转发消息的能力。

这是一个简单工厂，用来生成一个 `ForwardMessage` 实例，表示一条合并转发消息。

你可以在该实例上调用 `addForwardNode` 来为这个合并转发消息添加一条消息记录。

`addForwardNode` 方法有两个重载，接收 `ForwardNode` 或 `messageId` 两种参数。

> ```ts
> interface ForwardNode {
>     senderId?: number;
>     time?: number;
>     senderName?: string;
>     messageChain?: MessageType[] | Message;
> }
> 
> type messageId = number;
> ```

下面是两个例子：

```js
await bot.sendMessage({
    friend: 1019933576,
    message: Message.createForwardMessage().addForwardNode({
        senderId: 1019933576,
        time: 0,
        senderName: '高厉害',
        messageChain: new Message().addText('text')
    })
});
```

```js
const messageid = await bot.sendMessage({
    friend: 1019933576,
    message: new Message().addText('a')
});

await bot.sendMessage({
    friend: 1019933576,
    message: Message.createForwardMessage()
            .addForwardNode(messageid)
});
```



# 普通方法

## addText

`addText` 方法会向实例维护的消息链中添加一个文本消息。

#### 参数

- `text` 必选

  文本消息。



## addAt

`addAt` 方法添加一个 @ 消息。

#### 参数

- `target` 必选

  qq 号。



## addAtAll

`addAtAll` 方法会添加一个全体 @ 消息。

#### 参数

无



## addImageId

`addImageId` 方法会添加一个图片消息。

#### 参数

- `imageId` 必选

  可以通过 `Bot` 的`uploadImage` 实例方法返回，或在消息事件中找到。



## addImageUrl

`addImageUrl`  方法会添加一个图片消息。

#### 参数

- `url` 必选

  资源的网络位置，确保拥有访问权限。



## addImagePath

`addImagePath`  方法会添加一个图片消息。

#### 参数

- `path` 必选

  mirai-api-http 服务端的相对路径，不建议直接使用，可以通过 `Bot` 的`uploadImage` 实例方法返回。



## addFlashImageId

`addFlashImageId`  方法会添加一个闪图消息。

- `imageId` 必选

  可以通过 `Bot` 的`uploadImage` 实例方法返回，或在消息事件中找到。



## addFlashImageUrl

`addFlashImageUrl` 方法会添加一个闪图消息。

#### 参数

- `url` 必选

  资源的网络位置，确保拥有访问权限。



## addFlashImagePath

`addFlashImagePath` 方法会添加一个闪图消息。

#### 参数

- `path` 必选

  mirai-api-http 服务端的相对路径，不建议直接使用，可以通过 `Bot` 的`uploadImage` 实例方法返回。



## addVoiceId

`addVoiceId` 方法会添加一个语音消息。

- `voiceId` 必选
  可以通过 `Bot` 的`uploadVoice` 实例方法返回，或在消息事件中找到。



## addVoiceUrl

`addVoiceUrl` 方法会添加一个语音消息。

#### 参数

- `url` 必选

  资源的网络位置，确保拥有访问权限。



## addVoicePath

?> 必须为 SILKv3 或 AMR 格式的音频文件，参考 `uploadVoice` 的注释

`addVoicePath` 方法会添加一个语音消息。

#### 参数

- `path` 必选

  mirai-api-http 服务端的相对路径，不建议直接使用，可以通过 `Bot` 的`uploadVoice` 实例方法返回。



## addXml

`addXml` 方法会添加一个 XML 消息。

#### 参数

- `xml` 必选



## addJson

`addJson` 方法会添加一个语音消息。

#### 参数

- `json` 必选



## addApp

`addApp` 方法会添加一个 App 消息。

#### 参数

- `app` 必选



## addFace

`addFace` 会添加一个 QQ 表情。

v2.5.0 开始支持

#### 参数

- `name: FaceType` 必选

  FaceType 是多个 string 的联合类型，在 Editor/IDE 中将会有友好的提示。



# 接口

## getMessageChain

`getMessageChain` 令 `Message` 类型是 `MessageChainGetable` 的，任何具有该方法的类型均可认为是一个 `Message` 实例。

由于 js 中不存在接口，所以 `Bot` 和 `Message` 通过该方法耦合。

其返回值是一个 `MessageChain`。

体会一下这个例子：

```js
await bot.sendMessage({
    group: 123456789,
    messageChain: new Message().addAt(1019933576).addText('Hello world!').getMessageChain(),
});
```

