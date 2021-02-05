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

`addVoicePath` 方法会添加一个语音消息。

#### 参数

- `path` 必选

  mirai-api-http 服务端的相对路径，不建议直接使用，可以通过 `Bot` 的`uploadVoice` 实例方法返回。



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

