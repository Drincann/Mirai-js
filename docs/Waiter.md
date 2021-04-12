# 等待器 Waiter

`Waiter` 不是侍者的意思，他是一个等待器。

用于在当前异步代码中同步等待消息，主要用于将解决连续对话的问题，必要时可以配合对话锁（一个预定义中间件）使用。

# 普通方法

## wait

`wait` 方法用于等待下一次消息。

#### 参数

- `eventType` 必选

  要等待的消息类型

- `callback` 必选

  用于处理该事件的回调函数, 可以由 `Middleware` 实例的 `done` 方法返回。

  你需要在该实例中返回一个值，该值将被 `resolve` 从而传递到外部。

#### 返回值

一个 `Promise` 实例，将 `resolve` `callback` 的返回值。

#### 示例

考虑下面的场景，我们向机器人发送 `/unload` 指令，由于这个指令比较重要，机器人需要向我们确认，需要我们再次输入 `/confirm` 来确认，或 `/cancel` 来取消。

```js

bot.on('FriendMessage',
    new Middleware()
        .textProcessor()
        .friendLock() // 为防止同一个用户破坏线性对话，需要保证同一时刻只存在一个进行中的对话
        .done(async ({ unlock, text, sender: { id } }) => {
            if (text.includes('/unload')) {
                // 触发指令
                do {
                    // 提示需要确认或取消
                    bot.sendMessage({ friend: id, message: new Message().addText('输入 /confirm 或 /cancel') });
                    // 等待吓一条消息，放在 result 中
                    var result = await bot.waiter.wait('FriendMessage',
                        // 注册一个仅通过该好友消息的处理器，处理器将返回下一条消息的 text
                        new Middleware().textProcessor().friendFilter(id).done(data => data.text));

                    // 判断是否是正确的指令，不是正确的指令则循环再次要求输入
                } while (!['/confirm', '/cancel'].includes(result));
                
                // 进行相关操作
                if (result.includes('/confirm')) {
                    // ...do sth. to unload
                } else {
                    bot.sendMessage({ friend: id, message: new Message().addText('stopped') });
                }
            }
            // 释放锁
            unlock();
        }));
```

只要用正确的中间件过滤你需要等待的消息，这就像写同步代码一样。





# syncWrapper 中间件

`Middleware.syncWrapper` 是 `Waiter` 的包装器，提供**方便的同步 IO 方式**，将在 `data` 下放置一个方法的集合 `waitFor` 对象，该对象拥有三个异步方法：

- `messageChain`

  等待下一条消息，返回 `messageChain`

- `text`

  等待下一条消息，返回下一条消息的文本部分

- `custom`

  等待下一条消息，开发者负责传入一个消息处理器（回调函数），并将需要的消息从消息处理器中返回

#### 参数

无

#### 示例

连续对话，获得随机数

```js
bot.on('GroupMessage',
    new Middleware()
        // 保证连续对话未处理完成时不会多次触发
        .memberLock({ autoUnlock: true })
        // 同步包装器
        .syncWrapper()
        .done(async ({ waitFor, bot, sender: { group: { id: group } } }) => {
            await bot.sendMessage({
                group,
                message: new Message().addPlain('请输入随机数上限'),
            });
            // 等待下一次输入
            const max = Number.parseInt(await waitFor.text());
            await bot.sendMessage({
                group,
                message: new Message().addPlain(Math.floor(Math.random() * (max + 1))),
            });
        })
);
```

<- 1

bot -> 请输入随机数上限

<- 100

bot -> 56