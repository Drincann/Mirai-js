const { Bot, Message, Middleware } = require('./src/Mirai-js');

(async () => {
    try {
        const baseUrl = 'http://example.com:8080';
        const authKey = 'authKey';
        const qq = 1019933576;
        const password = 'password';
        const bot = new Bot();

        // 在 mirai - console 登录一个账号
        await Bot.sendCommand({
            baseUrl,
            authKey,
            // 指令名
            command: '/login',
            // 指令参数列表，这条指令等价于 /login 1019933576 password
            args: [qq, password],
        });

        // 创建一个会话
        await bot.open({
            // mirai-api-http 的服务端地址，
            baseUrl,
            // 要绑定的 qq，须确保该用户已在 mirai-console 登录
            qq,
            // authKey 用于验证连接者的身份，在插件配置文件中设置
            authKey,
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

            // 复读机 ;)
            const { id: messageId } = messageChain[0];

            bot.sendMessage({
                group: fromGroup,
                quote: messageId,
                messageChain
            });

            // 你可以像这样来判断群成员的权限
            switch (fromQQPermission) {
                case Bot.groupPermission.OWNER:
                    // 群主
                    break;
                case Bot.groupPermission.ADMINISTRATOR:
                    // 管理员
                    break;
                case Bot.groupPermission.MEMBER:
                    // 普通群成员
                    break;
            }
        });


        // 使用中间件
        // 过滤分类 message
        bot.on('FriendMessage', new Middleware()
            .messageProcessor(['Plain', 'Image'])
            .textProcessor().done(({
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

        // 自动重新登陆
        bot.on('BotOfflineEventForce',
            new Middleware()
                .autoReLogin({ bot, baseUrl, authKey, password })
                .done()
        );
    } catch (err) {
        console.log(err)
    }
})();
