const responseFirendRequest = require('./core/responseFirendRequest');
const responseMemberJoinRequest = require('./core/responseMemberJoinRequest');
const responseBotInvitedJoinGroupRequest = require('./core/responseBotInvitedJoinGroupRequest');

/**
 * @description 为事件处理器提供中间件
 * @use 在 MiddleWare 的实例上链式调用需要的中间件方法，最后
 * 调用 done 并传入一个回调函数，该函数将在中间件结束后被调用
 */
class Middleware {
    constructor() {
        this.middleware = [];
        this.catcher = undefined;
        this.entry = undefined;
    }

    /**
     * @description 自动重新登陆
     * @param {Bot}    bot      欲重新登陆的 Bot 实例
     * @param {string} baseUrl  mirai-api-http server 的地址
     * @param {string} authKey  mirai-api-http server 设置的 authKey
     * @param {string} password 欲重新登陆的 qq 密码
     */
    autoReLogin({ bot, baseUrl, authKey, password }) {
        const { Bot } = require('./Mirai-js');
        this.middleware.push(async (data, next) => {
            await Bot.sendCommand({
                baseUrl,
                authKey,
                command: '/login',
                args: [data.qq, password],
            });
            await bot.open();
            next();
        });
        return this;
    }

    /**
     * @description 过滤出指定类型的消息，消息类型为 key，对应类型的
     *              message 数组为 value，置于 data.classified
     * @param {array[string]} typeArr message 的类型，例如 Plain Image Voice
     */
    messageProcessor(typeArr) {
        this.middleware.push((data, next) => {
            const result = {};
            typeArr.forEach((type) => {
                result[type] = data.messageChain.filter((message) => message.type == type);
            });
            data.classified = result;
            next();
        });
        return this;
    }

    /**
     * @description 过滤出字符串类型的 message，并拼接在一起，置于 data.text
     */
    textProcessor() {
        this.middleware.push((data, next) => {
            data.text = data.messageChain
                .filter((val) => val.type == 'Plain')
                .map((val) => val.text)
                .join('');
            next();
        });
        return this;
    }

    /**
     * @description 过滤指定的群消息
     * @param {array[number]} groupArr 允许通过的群号数组
     * @param {boolean}       allow    允许通过还是禁止通过
     */
    groupFilter(groupArr, allow = true) {
        const groupSet = new Set(groupArr);

        this.middleware.push((data, next) => {
            // 检查参数
            if (!(data?.sender?.group?.id)) {
                throw new Error('Middleware.groupFilter 消息格式出错');
            }

            // 如果 id 在 set 里，根据 allow 判断是否交给下一个中间件处理
            if (groupSet.has(data.sender.group.id)) {
                allow && next();
            }
        });
        return this;
    }

    /**
     * @description 过滤指定的好友消息
     * @param {array[number]} friendArr 好友 qq 号数组
     * @param {boolean}       allow     允许通过还是禁止通过
     */
    friendFilter(friendArr, allow = true) {
        const groupSet = new Set(friendArr);

        this.middleware.push((data, next) => {
            // 检查参数
            if (!(data?.sender?.id)) {
                throw new Error('Middleware.friendFilter 消息格式出错');
            }

            // 如果 id 在 set 里，根据 allow 判断是否交给下一个中间件处理
            if (groupSet.has(data.sender.id)) {
                allow && next();
            }
        });
        return this;
    }

    /**
     * @description 过滤指定群的群成员的消息
     * @param {Map} groupMemberMap 群和成员的 Map
     * 结构 { number => array[number], } key 为允许通过的群号，value 为该群允许通过的成员 qq
     */
    groupMemberFilter(groupMemberMap) {
        this.middleware.push((data, next) => {
            // 检查参数
            if (!(data?.sender?.id)) {
                throw new Error('Middleware.friendFilter 消息格式出错');
            }

            // 检查是否是群消息
            if (data.sender.group) {
                return;
            }

            // 检查是否是允许通过的群成员，是则交给下一个中间件处理
            if (data.sender.group in groupMemberMap &&
                data.sender.id in groupMemberMap[data.sender.group.id]) {
                next();
            }
        });
        return this;
    }

    /**
     * @description 这是一个对话锁，保证群中同一成员不能在中途触发处理器
     * @use 在你需要保护的过程结束后调用 data.unlock 即可
     */
    memberLock() {
        const memberMap = {/* group -> memberSet */ };
        this.middleware.push((data, next) => {
            // 检查参数
            if (!data.sender?.group?.id) {
                throw new Error('Middleware.memberLock 消息格式出错');
            }

            // 若该 group 不存在对应的 Set，则添加
            if (!(memberMap[data.sender?.group?.id] instanceof Set)) {
                memberMap[data.sender?.group?.id] = new Set();
            }

            // 是否正在对话
            if (memberMap[data.sender?.group?.id].has(data.sender?.id)) {
                // 正在对话则返回
                return;
            } else {
                // 未在对话，则加入对应的 Set，然后继续
                memberMap[data.sender?.group?.id].add(data.sender?.id);
                data.unlock = () => friendSet.delete(data.sender?.id);
                next();
            }
        });
        return this;
    }

    /**
     * @description 这是一个对话锁，保证同一好友不能在中途触发处理器
     * @use 在你需要保护的过程结束后调用 data.unlock 即可
     */
    friendLock() {
        const friendSet = new Set();
        this.middleware.push((data, next) => {
            // 检查参数
            if (!data.sender?.id) {
                throw new Error('Middleware.memberLock 消息格式出错');
            }

            // 是否正在对话
            if (friendSet.has(data.sender?.id)) {
                // 正在对话则返回
                return;
            } else {
                // 未在对话，则加入 Set，然后继续
                friendSet.add(data.sender?.id);
                data.unlock = () => friendSet.delete(data.sender?.id);
                next();
            }
        });
        return this;
    }

    /**
     * @description 过滤包含指定 @ 信息的消息
     * @param {array[number]} atArr 必选，qq 号数组
     * @param {boolean}       allow 可选，允许通过还是禁止通过
     */
    atFilter(friendArr, allow = true) {
        const friendSet = new Set(friendArr);

        this.middleware.push((data, next) => {
            // 检查参数
            if (!(data?.messageChain)) {
                throw new Error('Middleware.atFilter 消息格式出错');
            }

            // 如果 id 在 set 里，根据 allow 判断是否交给下一个中间件处理
            for (const message of data.messageChain) {
                if (message?.type == 'At' && friendSet.has(message?.target)) {
                    return allow && next();
                }
            }
            !allow && next();
        });
        return this;
    }

    /**
     * @description 用于 NewFriendRequestEvent 的中间件，经过该中间件后，将在 data 下放置三个方法
     * agree、refuse、refuseAndAddBlacklist，调用后将分别进行好友请求的 同意、拒绝和拒绝并加入黑名单
     * @param {Bot} bot 必选，Bot 实例
     */
    friendRequestProcessor(bot) {
        // 检查参数
        if (!bot) {
            throw new Error('Middleware.NewFriendRequestEvent 缺少必要的 bot 参数');
        }
        this.middleware.push((data, next) => {
            // 事件类型
            if (data.type != 'NewFriendRequestEvent') {
                throw new Error('Middleware.NewFriendRequestEvent 消息格式出错');
            }

            // ! 这个地方与 Bot 耦合
            // ? baseUrl, sessionKey 放在内部获取，使用最新的实例状态
            const { baseUrl, sessionKey } = bot.config;
            const { eventId, fromId, groupId } = data;

            // 同意
            data.agree = async (message) => {
                await responseFirendRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 0,
                });
            }

            // 拒绝
            data.refuse = async (message) => {
                await responseFirendRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 1,
                });
            }

            // 拒绝并加入黑名单
            data.refuseAndAddBlacklist = async (message) => {
                await responseFirendRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 2,
                });
            }

            next();
        });
        return this;
    }

    /**
     * FIXME: mirai-core 的问题，有时候收不到 MemberJoinRequestEvent 事件
     * 该功能未经测试
     * @description 用于 MemberJoinRequestEvent 的中间件，经过该中间件后，将在 data 下放置五个方法
     * agree                 同意
     * refuse                拒绝
     * ignore                忽略
     * refuseAndAddBlacklist 拒绝并移入黑名单
     * ignoreAndAddBlacklist 忽略并移入黑名单
     * @param {Bot} bot 必选，Bot 实例
     */
    memberJoinRequestProcessor(bot) {
        // 检查参数
        if (!bot) {
            throw new Error('Middleware.memberJoinRequestProcessor 缺少必要的 bot 参数');
        }
        this.middleware.push((data, next) => {
            // 事件类型
            if (data.type != 'NewFriendRequestEvent') {
                throw new Error('Middleware.memberJoinRequestProcessor 消息格式出错');
            }

            // ! 这个地方与 Bot 耦合
            // ? baseUrl, sessionKey 放在内部获取，使用最新的实例状态
            const { baseUrl, sessionKey } = bot.config;
            const { eventId, fromId, groupId } = data;

            // 同意
            data.agree = async (message) => {
                await responseMemberJoinRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 0,
                });
            }

            // 拒绝
            data.refuse = async (message) => {
                await responseMemberJoinRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 1,
                });
            }

            // 忽略
            data.ignore = async (message) => {
                await responseMemberJoinRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 2,
                });
            }

            // 拒绝并加入黑名单
            data.refuseAndAddBlacklist = async (message) => {
                await responseMemberJoinRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 3,
                });
            }

            // 忽略并加入黑名单
            data.ignoreAndAddBlacklist = async (message) => {
                await responseMemberJoinRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 4,
                });
            }

            next();
        });
        return this;
    }


    /**
     * FIXME: 目前被邀请入群不会触发 BotInvitedJoinGroupRequestEvent 事件
     * 该功能未经测试
     * @description 用于 BotInvitedJoinGroupRequestEvent 的中间件，经过该中间件后，将在 data 下放置两个方法
     * agree                 同意
     * refuse                拒绝
     * @param {Bot} bot 必选，Bot 实例
     */
    invitedJoinGroupRequestProcessor(bot) {
        // 检查参数
        if (!bot) {
            throw new Error('Middleware.invitedJoinGroupRequestProcessor 缺少必要的 bot 参数');
        }
        this.middleware.push((data, next) => {
            // 事件类型
            if (data.type != 'BotInvitedJoinGroupRequestEvent') {
                throw new Error('Middleware.invitedJoinGroupRequestProcessor 消息格式出错');
            }

            // ! 这个地方与 Bot 耦合
            // ? baseUrl, sessionKey 放在内部获取，使用最新的实例状态
            const { baseUrl, sessionKey } = bot.config;
            const { eventId, fromId, groupId } = data;

            // 同意
            data.agree = async (message) => {
                await responseBotInvitedJoinGroupRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 0,
                });
            }

            // 拒绝
            data.refuse = async (message) => {
                await responseBotInvitedJoinGroupRequest({
                    baseUrl, sessionKey, eventId, fromId, groupId,
                    message, operate: 1,
                });
            }

            next();
        });
        return this;
    }



    /**
     * @description 添加一个自定义中间件
     * @param {function} callback (data, next) => void
     */
    use(callback) {
        this.middleware.push(callback);
        return this;
    }

    /**
     * @description 使用错误处理器
     * @param {function} catcher 错误处理器 (err) => void
     */
    catch(catcher) {
        this.catcher = catcher;
        return this;
    }

    /**
     * @description 生成一个带有中间件的事件处理器
     * @param {function} callback 事件处理器
     */
    done(callback) {
        // 中间件模式，第二个参数用来进行外部的 promise 包装，可以忽略
        this.entry = (data, resolve) => {
            try {
                this.middleware.reduceRight((next, middleware) => {
                    return () => middleware(data, next);
                }, () => {
                    let returnVal = callback instanceof Function ? callback(data) : undefined;
                    // resolve 可能存在的 promise 包装
                    if (resolve) {
                        resolve(returnVal);
                    }
                })();
            } catch (error) {
                if (this.catcher) {
                    this.catcher(error);
                } else {
                    throw error;
                }
            }
        }

        return this;
    }
}

module.exports = { Middleware };
