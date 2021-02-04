# Mirai.js

Mirai-js，一个运行在 Node.js 平台的，简单的 QQ 机器人开发框架。

```js
bot.on('FriendMessage', data => {
    await bot.sendMessage({
        friend: data.sender.id,
        message: new Message().addText('hello world!'),
    });
});
```

开发文档请参考：[https://drinkal.github.io/Mirai-js](https://drinkal.github.io/Mirai-js)



## 开源协议

根据 `mirai` 的开源协议，`Mirai-js` 使用 [AGPLv3](https://github.com/project-mirai/mirai-api-http/blob/master/LICENSE) 协议开源。