const releaseSession = require('./core/releaseSession');
const verify = require('./core/verify');
const auth = require('./core/auth');
const sendCommand = require('./core/sendCommand');
const sendFriendMessage = require('./core/sendFirendMessage');
const sendGroupMessage = require('./core/sendGroupMessage');

class Bot {
    /**
     * 
     * @description 
     * @param {string} baseUrl mirai-api-http server 的地址
     * @param {string} authKey mirai-api-http server 设置的 authKey
     * @param {number} qq      欲绑定的 qq 号，需要确保该 qq 号已在 mirai-console 登陆
     */
    async init({ baseUrl, qq, authKey }) {
        // 创建会话
        const sessionKey = await auth({ baseUrl, authKey });

        // 绑定到一个 qq
        await verify({ baseUrl, sessionKey, qq });

        // 设置对象状态
        this.config = {
            baseUrl,
            qq,
            authKey,
            sessionKey
        };
    }

    /**
     * @description 关闭会话
     */
    async close() {
        const { baseUrl, sessionKey, qq } = this.config;
        return await releaseSession({ baseUrl, sessionKey, qq });
    }

    /**
     * todo 实现临时对话
     * @description 向 qq 好友、qq 群（若都提供则同时）发送消息
     * @param {boolean} temp                    是否是临时会话
     * @param {number} friend                   好友 qq 号
     * @param {number} group                    群号
     * @param {number} quote                    消息引用，使用发送时返回的 messageId
     * @param {array[MessageType]} messageChain 消息链，MessageType 数组
     */
    async sendMessage({ temp, friend, group, quote, message, messageChain }) {
        // 必要参数
        const { baseUrl, sessionKey } = this.config;

        // 默认值
        temp = temp || false;

        // 处理 message
        if (!messageChain) {
            messageChain = message.getMessageChain();
        }

        // 根据 temp、friend、group 参数的情况依次调用
        if (temp) {
            if (friend) {
                return await sendFriendMessage({
                    baseUrl, sessionKey, target: friend, quote, messageChain
                });
            }

            if (group) {
                return await sendGroupMessage({
                    baseUrl, sessionKey, target: group, quote, messageChain
                });
            }
        } else {
            if (friend) {
                return await sendFriendMessage({
                    baseUrl, sessionKey, target: friend, quote, messageChain
                });
            }

            if (group) {
                return await sendGroupMessage({
                    baseUrl, sessionKey, target: group, quote, messageChain
                });
            }
        }
    }

    /**
     *
     * @description 向 mirai-console 发送指令
     * @param {string} baseUrl     mirai-api-http server 的地址
     * @param {string} authKey     mirai-api-http server 设置的 authKey
     * @param {string} commend     指令名
     * @param {array[string]} args array[string] 指令的参数
     */
    static async sendCommand({ baseUrl, authKey, command, args }) {
        return await sendCommand({ baseUrl, authKey, command, args });
    }
}

module.exports = Bot;