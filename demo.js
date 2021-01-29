const { Bot, Message, MiddleWare } = require('./src/Mirai-js');

(async () => {
    try {
        const bot = new Bot()

        // 在 mirai - console 登录一个账号
        await Bot.sendCommand({
            baseUrl: 'http://example:8080',
            authKey: 'authKey',
            // 指令名
            command: '/login',
            // 指令参数列表，这条指令等价于 /login 1019933576 password
            args: ['1019933576', 'password'],
        });

        // 创建一个会话
        await bot.open({
            // mirai-api-http 的服务端地址，
            baseUrl: 'http://example:8080',
            // 要绑定的 qq，须确保该用户已在 mirai-console 登录
            qq: 1019933576,
            // authKey 用于验证连接者的身份，在插件配置文件中设置
            authKey: 'authKey',
        });


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
                message: new Message().addText('hello world!'),
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
        });


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
    } catch (err) {
        const { msg, code } = err;
        console.log({ msg, code })
    }
})();
