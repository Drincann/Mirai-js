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

`Middleware` 实例的 `done` 方法用于返回一个带有中间件的事件处理器。

其他方法都是预定义的中间件。

如 `textProcessor`，经过该中间件处理后，传入事件处理器的 `data` 将拥有一个 `text` 属性，该属性由文本消息拼接而成。



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



## groupFilter

`groupFilter` 用于 `GroupMessage`。

该中间件将允许指定的好友通过，相当于为允许通过的群设置白名单。

#### 参数

- `groupArr: number[]` 必选

  允许通过的群号数组

#### 示例

```js
bot.on('FriendMessage', new Middleware()
       .groupFilter([123456789, 789456123])
       .done( data => {
    // do sth.
}));
```



## friendFilter

`groupFilter` 用于 `FriendMessage`。

该中间件将允许指定的好友通过。

#### 参数

- `friendArr: number[]` 必选

  允许通过的 qq 号数组。

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

- `groupMemberMap: Map`:  必选

  群号作为 Map 的 key，允许通过的群成员数组作为 Map 的 value。

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

