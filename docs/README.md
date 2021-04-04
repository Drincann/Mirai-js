> Mirai-js，一个运行在 Node.js、浏览器下的，简单的 QQ 机器人开发框架。

```js
bot.on('FriendMessage', async data => {
    await bot.sendMessage({
        friend: data.sender.id,
        message: new Message().addText('hello world!'),
    });
});
```

QQ 群: 730757181

--> [开发你的机器人应用](Preparation)