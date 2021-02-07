/**
 * @description 为事件处理器提供中间件
 * @use 在 MiddleWare 的实例上链式调用需要的中间件方法，最后
 * 调用 done 并传入一个回调函数，该函数将在中间件结束后被调用
 */
class Middleware {
    constructor() {
        this.middleware = [];
        this.catcher = undefined;
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
     */
    groupFilter(groupArr) {
        const groupSet = new Set(groupArr);

        this.middleware.push((data, next) => {
            // 检查参数
            if (!(data && data.sender && data.sender.group && data.sender.group.id)) {
                throw new Error('Middleware.groupFilter 消息格式出错');
            }

            // 如果 id 在 set 里，交给下一个中间件处理
            if (groupSet.has(data.sender.group.id)) {
                next();
            }
        });
        return this;
    }

    /**
     * @description 过滤指定的好友消息
     * @param {array[number]} friendArr 允许通过的好友 qq 号数组
     */
    friendFilter(friendArr) {
        const groupSet = new Set(friendArr);

        this.middleware.push((data, next) => {
            // 检查参数
            if (!(data && data.sender && data.sender.id)) {
                throw new Error('Middleware.friendFilter 消息格式出错');
            }

            // 检查是否是群消息
            if (data.sender.group) {
                return;
            }

            // 如果 id 在 set 里，交给下一个中间件处理
            if (groupSet.has(data.sender.id)) {
                next();
            }
        });
        return this;
    }

    /**
     * @description 过滤指定群的群成员的消息
     * @param {Map} groupMemberMap 允许通过的 Map
     * 结构 { number => array[number], } key 为允许通过的群号，value 为该群允许通过的成员 qq
     */
    groupMemberFilter(groupMemberMap) {
        this.middleware.push((data, next) => {
            // 检查参数
            if (!(data && data.sender && data.sender.id)) {
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
        return (data, resolve) => {
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


    }
}

module.exports = Middleware;
