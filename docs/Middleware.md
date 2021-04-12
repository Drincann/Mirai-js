# 中间件 Middleware

# 使用

```js
bot.on('FriendMessage', new Middleware
       .textProcessor()
       .friendFilter([ 1019933576 ]))
       .done( data => {
    // ...
    data.text;
});
```

`Middleware` 实例的 `done` 方法用于返回一个带有中间件的事件处理器入口。

?> `done` 可以多次调用，你可以在一个实例上定义一个默认的中间件流程，然后每次都使用该实例的 `done` 方法生成事件处理器

其他方法都是预定义的中间件，如 `textProcessor`，经过该中间件处理后，传入事件处理器的 `data` 将拥有一个 `text` 属性，该属性由文本消息拼接而成。



# 预定义中间件

## autoReLogin

`autoReLogin` 用于 Bot 意外下线的事件，如 `BotOfflineEventActive` —— Bot 被挤下线。

经过该中间件时将重新登陆并重置连接。

!> 已知的问题，当 Bot 下线后，当前 session 会失效。框架提供了解决方法：再次调用 `open` 来重置 session。

#### 参数

- `bot: Bot` 必选

  Bot 实例

- `baseUrl: string` 必选

  mirai-api-http 的网络位置。

- `authKey: string` 必选

  mirai-api-http 的认证秘钥。

- `password: string` 必选

  qq 密码



## autoReconnection

`autoReconnection` 用于 WebSocket 的 `close` 事件。

经过该中间件时将重置 WebSocket 连接。

#### 参数

- `bot: Bot` 必选

  Bot 实例

#### 示例

```js
bot.on('close',
    new Middleware()
       .catch(console.log)
       .autoReconnection(bot)
       .done()
);
```



## messageProcessor

`messageProcessor` 用于 `FriendMessage` 、 `GroupMessage`。

该中间件将不同类型的消息分类，放在一个 Map 中，置于 `data.classified` 属性。

#### 属性

- `typeArr: string[]` 必选

  一个由消息类型组成的数组，指定要分类哪些消息，例如 `['Plain', 'Image', 'Voice']`。

#### 示例

```js
bot.on('FriendMessage', new Middleware()
       .messageProcessor(['Plain', 'Image', 'Voice'])
       .done( data => {
    const { Plain, Image, Voice } = data.classified;
    Plain.forEach( v => { console.log(v.text); });
}));
```



## textProcessor

`textProcessor` 用于 `FriendMessage` 、 `GroupMessage`。

该中间件将所有文本类型拼接在一起，置于 `data.text` 属性。

#### 属性

无

#### 示例

```js
bot.on('FriendMessage', new Middleware()
       .textProcessor()
       .done( data => {
    console.log(data.text);
}));
```



## messageIdProcessor

`messageIdProcessor` 用于 `FriendMessage` 、 `GroupMessage`。

该中间件将解析消息 id，并置于 `data.messageId` 属性。

#### 属性

无

#### 示例

```js
bot.on('FriendMessage', new Middleware()
       .textProcessor()
       .done( data => {
    console.log(data.messageId);
}));
```



## groupFilter

`groupFilter` 用于 `GroupMessage`。

该中间件将允许指定的群通过，相当于为允许通过的群设置白名单。

#### 参数

- `groupArr: number[]` 必选

  群号数组。
  
- `allow: boolean` 可选

  该参数描述了第一个参数给出的名单是否允许通过。true 时为允许通过，false 时为禁止通过。

#### 示例

```js
bot.on('FriendMessage', new Middleware()
       .groupFilter([123456789, 789456123])
       .done( data => {
    // do sth.
}));
```



## friendFilter

`groupFilter` 用于 `FriendMessage` 或 `GroupMessage`。

该中间件将允许指定的好友通过，如果作为 `GroupMessage` 的中间件，则是忽略群，直接过滤群成员。

#### 参数

- `friendArr: number[]` 必选

  qq 号数组。
  
- `allow: boolean` 可选

  该参数描述了第一个参数给出的名单是否允许通过。true 时为允许通过，false 时为禁止通过。

#### 示例

```js
bot.on('FriendMessage', new Middleware()
       .friendFilter([1019933576, 3070539027])
       .done( data => {
    // do sth.
}));
```



## groupMemberFilter

`groupMemberFilter` 中间件将允许指定群中的指定群成员通过。

#### 参数

- `groupMemberMap: Map` 必选

  群号作为 Map 的 key，允许通过的群成员数组作为 Map 的 value。
  
- `allow: boolean` 可选

  该参数描述了第一个参数给出的名单是否允许通过。true 时为允许通过，false 时为禁止通过。

#### 示例

```js
bot.on('FriendMessage', new Middleware()
       .groupMemberFilter({
    123456789: [1019933576],
    789456123: [3070539027, 1019933576],
})
       .done( data => {
    // do sth.
}));
```



## atFilter

`atFilter` 中间件将识别消息中的 @ 信息，仅允许 @ 了指定 qq 的消息通过。

#### 参数

- `atArr: number[]` 必选

  qq 号数组

- `allow: boolean` 可选

  该参数描述了第一个参数给出的名单是否允许通过。true 时为允许通过，false 时为禁止通过。

#### 示例

```js
bot.on('GroupMessage', new Middleware()
       .atFilter([1019933576])
       .done( data => {
    // do sth.
}));
```



## memberLock

`memberLock`是一个用于 `GroupMessage` 事件的对话锁，保证群中同一成员**不能**在中途触发处理器。

!> 注意是不能触发，而不是等待，事件遇到关上的锁时时将直接返回（单线程保证了大部分并发的安全性）

经过该中间件时默认进入锁保护的区域，同时在 `data` 放置一个 `unlock` 方法，开发者必须在处理器中调用该方法才能释放锁。

#### 参数

- ` autoUnlock: boolean` 可选

  若该选项置为 `true`，则将在下游中间结束时自动调用 `unlock`，默认为 `false`。

#### 示例

```js
bot.on('GroupMessage', new Middleware()
       .memberLock({ autoUnlock: false })
       .done( data => {
    // do sth.
    data.unlock();
}));
```



## friendLock

`friendLock`是一个用于 `FriendMessage` 事件的对话锁，保证同一好友**不能**在中途触发处理器。

经过该中间件时默认进入锁保护的区域，同时在 `data` 放置一个 `unlock` 方法，开发者必须在处理器中调用该方法才能释放锁。

#### 参数

` autoUnlock: boolean` 可选

若该选项置为 `true`，则将在下游中间结束时自动调用 `unlock`，默认为 `false`。

#### 示例

```js
bot.on('FriendMessage', new Middleware()
       .friendLock({ autoUnlock: false })
       .done( data => {
    // do sth.
    data.unlock();
}));
```



## friendRequestProcessor

`friendRequestProcessor` 中间件用于方便地处理 `NewFriendRequestEvent` 事件，经过该中间件后，将在 data 下放置三个方法

- `agree` 同意好友请求
- `refuse` 拒绝好友请求
- `refuseAndAddBlacklist` 拒绝好友请求并加入黑名单

#### 参数

- `bot` 必选

  `Bot` 的实例

#### 示例

```js
bot.on('NewFriendRequestEvent', new Middleware()
       .friendRequestProcessor(bot)
       .done( data => {
    data.agree();
}))
```



## memberJoinRequestProcessor

`memberJoinRequestProcessor` 中间件用于方便地处理 `MemberJoinRequestEvent` 事件，经过该中间件后，将在 data 下放置五个方法

- `agree` 同意

- `refuse` 拒绝

- `ignore` 忽略

- `refuseAndAddBlacklist` 拒绝并移入黑名单

- `ignoreAndAddBlacklist` 忽略并移入黑名单

#### 参数

- `bot` 必选

  `Bot` 的实例

#### 示例

```js
bot.on('MemberJoinRequestEvent', new Middleware()
       .memberJoinRequestProcessor(bot)
       .done( data => {
    data.agree();
}))
```



## invitedJoinGroupRequestProcessor

`invitedJoinGroupRequestProcessor` 中间件用于方便地处理 `BotInvitedJoinGroupRequestEvent` 事件，经过该中间件后，将在 data 下放置两个方法

- `agree` 同意

- `refuse` 拒绝

#### 参数

- `bot` 必选

  `Bot` 的实例

#### 示例

```js
bot.on('BotInvitedJoinGroupRequestEvent', new Middleware()
       .invitedJoinGroupRequestProcessor(bot)
       .done( data => {
    data.agree();
}))
```



# 自定义中间件

## use

使用 `use` 方法，将插入一个自定义的中间件。

#### 参数

- `callback` 必选

  `(data: Object, next: function) => void`

  处理完成后根据情况选择是否调用`next`，以将控制权转移到下一个中间件。

#### 示例

```js
bot.on('FriendMessage', new Middleware()
.use( (data, next) => {
    /* do sth. */ 
    next();
}).done( data => {
    /* do sth. */ 
}));
```



# 错误处理

## catch

`catch` 方法将会在中间件调用链外注册一个错误处理器。

!> 若未注册错误处理器，则默认行为是抛出异常，由于此时外层（如果有） `try catch` 的栈帧已经结束，程序会意外终止

#### 参数

- `callback: function` 必选

  `(error) => void`，接收一个 `error` 参数。

#### 示例

```js
bot.on('FriendMessage', new Middleware()
.use( (data, next) => {
    /* do sth. */ 
    next();
}).catch( error => {
    /* do sth. */ 
}).done( data => {
    /* do sth. */ 
}));
```



# 异步

`Middleware` 生成的事件处理器已经进行了异步包装，调用入口将直接返回一个 `Promise` 实例。该实例将在 `done` 中传入的回调函数返回后回调。


```js
let returnValue = await new Middleware()
/* middleware */
.done(data => {
    // ...
    return /* sth. */;
});
```