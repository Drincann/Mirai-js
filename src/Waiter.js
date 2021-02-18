const { EntryGetable } = require('./interface.js');
/**
 * @description 每个 Bot 实例将维护一个 Waiter 实例，它用来同步等待一次用户输入
 * @use 使用 bot.waiter
 */
class Waiter {
    constructor(bot) {
        this.bot = bot;
    }

    /**
     * @description 等待一次消息，经过开发者提供的处理器后返回到异步代码处
     * @param {string}   eventType 事件类型
     * @param {function} callback  处理器，其返回值将被 resolve，传递到外部
     */
    wait(eventType, callback) {
        return new Promise(resolve => {
            if (callback instanceof EntryGetable) {
                // 中间件需要在内部 resolve
                this.bot.one(eventType, async data => callback.entry(data, resolve), true);
            } else {
                // 普通函数，在外部 resolve
                this.bot.one(eventType, async data => resolve(await callback(data)), true);
            }
        });
    }
}

module.exports = { Waiter };