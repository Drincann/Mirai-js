const releaseSession = require('./core/releaseSession');
const verify = require('./core/verify');
const auth = require('./core/auth');
const sendCommand = require('./core/sendCommand');
const sendFriendMessage = require('./core/sendFirendMessage');
const sendGroupMessage = require('./core/sendGroupMessage');
const getConfig = require('./core/getConfig');
const setConfig = require('./core/setConfig');
const startListening = require('./core/startListening');
const random = require('./core/util/random')(0, 2E16);

class Bot {
    /**
     * @description 连接到 mirai-api-http，并开启一个会话
     * @param {string} baseUrl mirai-api-http server 的地址
     * @param {string} authKey mirai-api-http server 设置的 authKey
     * @param {number} qq      欲绑定的 qq 号，需要确保该 qq 号已在 mirai-console 登陆
     */
    async open({ baseUrl, qq, authKey }) {
        // 创建会话
        const sessionKey = await auth({ baseUrl, authKey });

        // 绑定到一个 qq
        await verify({ baseUrl, sessionKey, qq });

        // 开启 websocket
        await setConfig({ baseUrl, sessionKey, enableWebsocket: true });

        // 设置对象状态
        this.config = {
            baseUrl,
            qq,
            authKey,
            sessionKey
        };

        // 事件处理器 map
        this.eventProcessorMap = {
            /*
             每个事件对应多个 processor 对象，这些对象和 h
             andle 分别作为 value 和 key 包含在一个大对象中

            eventType: string -> {
                                     handle: number -> callback: (data) => void ,
                                     ...
                                 }
            */
        };

        // 开始监听事件
        this.wsConnection = await startListening({
            baseUrl,
            sessionKey,
            callback: message => {
                // 如果当前到达的事件拥有处理器，则依次调用所有该事件的处理器
                if (message.type in this.eventProcessorMap) {
                    Object.values(this.eventProcessorMap[message.type])
                        .forEach(processor => processor(message));
                }
            }
        });
    }

    /**
     * @description 关闭会话
     * @param {boolean} keepProcessor 是否保留事件处理器，默认值为 false，不保留
     */
    async close(option) {
        // option 中仅包含一个可选参数 keepProcessor，为什么不直
        // 接在参数列表中解构 {keepProcessor}？因为，在这种情况下，
        // 若用户未传入任何参数，则相当于从 undefined 中解构，会抛异常
        if (option) {
            var { keepProcessor } = option;
        }
        // 必要参数
        const { baseUrl, sessionKey, qq } = this.config;


        // 默认值
        keepProcessor = keepProcessor || false;

        // 由于在 ws open 之前关闭连接会抛异常，故应先判断此时是否正在连接中
        if (this.wsConnection.readyState == this.wsConnection.CONNECTING) {
            // 正在连接中，注册一个 open，等待回调时关闭
            this.wsConnection.on('open', async () => {
                // 关闭 websocket 的连接
                this.wsConnection.close(1000);

                // 释放会话
                await releaseSession({ baseUrl, sessionKey, qq });

                // 初始化对象状态
                if (!keepProcessor) {
                    this.eventProcessorMap = undefined;
                }
                this.config = undefined;
                this.wsConnection = undefined;
            });
        } else {
            // 关闭 websocket 的连接
            this.wsConnection.close(1000);

            // 释放会话
            await releaseSession({ baseUrl, sessionKey, qq });

            // 初始化对象状态
            if (!keepProcessor) {
                this.eventProcessorMap = undefined;
            }
            this.config = undefined;
            this.wsConnection = undefined;
        }

    }

    /**
     * todo 实现临时对话
     * @description 向 qq 好友、qq 群（若都提供则同时）发送消息
     * @param {boolean}            temp         是否是临时会话
     * @param {number}             friend       好友 qq 号
     * @param {number}             group        群号
     * @param {number}             quote        消息引用，使用发送时返回的 messageId
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
     * @description 添加一个事件处理器
     * @param {string} eventType  事件类型
     * @param {function} callback 回调函数
     * @returns {number} 事件处理器的标识，用于移除该处理器
     */
    on(eventType, callback) {
        // 为没有任何事件处理器的事件生成一个空对象 (空对象 {}，而不是 null)
        if (!(eventType in this.eventProcessorMap)) {
            this.eventProcessorMap[eventType] = {};
        }

        // 生成一个唯一的 handle，作为当前 
        // processor 的标识，用于移除该处理器
        let handle = random()
        while (handle in this.eventProcessorMap[eventType]) {
            handle = random()
        }

        // processor
        // 每个事件对应多个 processor，这些 processor 和 h
        // andle 分别作为 value 和 key 包含在一个大对象中
        const processor = callback;

        this.eventProcessorMap[eventType][handle] = processor;
        return handle;
    }

    /**
     * @description 移除一个事件处理器
     * @param {string} eventType 事件类型
     * @param {function} handle  事件处理器标识，由 on 方法返回
     */
    off(eventType, handle) {
        if (handle in this.eventProcessorMap[eventType]) {
            delete this.eventProcessorMap[eventType][handle];
        }
    }

    /**
     * @description 获取 config
     */
    async getConfig() {
        const { baseUrl, sessionKey } = this.config;
        return await getConfig({ baseUrl, sessionKey });
    }

    /**
     * @description 设置 config
     * @param {number} cacheSize        插件缓存大小
     * @param {boolean} enableWebsocket websocket 状态
     */
    async setConfig({ cacheSize, enableWebsocket }) {
        const { baseUrl, sessionKey } = this.config;
        return await setConfig({ baseUrl, sessionKey, cacheSize, enableWebsocket });
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