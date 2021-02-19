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
    async wait(eventType, callback) {
        return new Promise(resolve => {
            // 注册严格的一次事件，等待回调
            this.bot.one(eventType, async data => resolve(await callback(data)), true);
        });
    }

}

module.exports = { Waiter };