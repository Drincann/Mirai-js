/**
 * @description 为事件处理器提供中间件
 * @use 在 MiddleWare 的实例上链式调用需要的中间件方法，最后
 * 调用 done 并传入一个回调函数，该函数将在中间件结束后被调用
 */
class Middleware {
    constructor() {
        this.middleware = [];
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
    filter(typeArr) {
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
    textFilter() {
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
     * @description 生成一个带有中间件的事件处理器
     * @param {function} callback 事件处理器
     */
    done(callback) {
        // 中间件模式
        return (data) => {
            data.time = Date.now();
            this.middleware.reduceRight((next, middleware) => {
                return () => middleware(data, next);
            }, () => callback && callback(data))();
        }
    }
}

module.exports = Middleware;