const releaseSession = require('./core/releaseSession');
const verify = require('./core/verify');
const auth = require('./core/auth');
const sendCommand = require('./core/sendCommand');
const sendFriendMessage = require('./core/sendFirendMessage');
const sendGroupMessage = require('./core/sendGroupMessage');
const sendTempMessage = require('./core/sendTempMessage');
const getConfig = require('./core/getConfig');
const setConfig = require('./core/setConfig');
const uploadImage = require('./core/uploadImage');
const uploadVoice = require('./core/uploadVoice')
const startListening = require('./core/startListening');
const random = require('./core/util/random')(0, 2E16);
const fs = require('fs');

class Bot {
    /**
     * @description 连接到 mirai-api-http，并开启一个会话
     * @param {string} baseUrl mirai-api-http server 的地址
     * @param {string} authKey mirai-api-http server 设置的 authKey
     * @param {number} qq      欲绑定的 qq 号，需要确保该 qq 号已在 mirai-console 登陆
     * @returns {void}
     */
    async open(option /* { baseUrl, qq, authKey } */) {
        if (this.config) {
            this.close({ keepProcessor: true, keepConfig: true });
        }

        // 设置对象状态
        // 若开发者重复调用 open，仅更新已提供的值
        this.config = {
            baseUrl: (this.config && this.config.baseUrl) || option.baseUrl,
            qq: (this.config && this.config.qq) || option.qq,
            authKey: (this.config && this.config.authKey) || option.authKey,
            sessionKey: (this.config && this.config.sessionKey) || '',
        };

        // 检查必选参数
        if (!(this.config.baseUrl && this.config.qq && this.config.authKey)) {
            throw new Error({ message: 'open 方法参数格式错误' });
        }
        const { baseUrl, qq, authKey } = this.config;

        // 创建会话
        const sessionKey = this.config.sessionKey = await auth({ baseUrl, authKey });

        // 绑定到一个 qq
        await verify({ baseUrl, sessionKey, qq });

        // 开启 websocket
        await setConfig({ baseUrl, sessionKey, enableWebsocket: true });

        // 事件处理器 map
        // 如果重复调用 open 则保留事件处理器
        this.eventProcessorMap = this.eventProcessorMap || {
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
            message: data => {
                // 如果当前到达的事件拥有处理器，则依次调用所有该事件的处理器
                if (data.type in this.eventProcessorMap) {
                    return Object.values(this.eventProcessorMap[data.type])
                        .forEach(processor => processor(data));
                }
            },
            error: err => {
                // 如果当前到达的事件拥有处理器，则依次调用所有该事件的处理器
                const type = 'error';
                if (type in this.eventProcessorMap) {
                    return Object.values(this.eventProcessorMap[type])
                        .forEach(processor => processor(err));
                }
                console.log(`ws error\n${err}`);
            },
            close: (code, message) => {
                const type = 'close';
                if (type in this.eventProcessorMap) {
                    return Object.values(this.eventProcessorMap[type])
                        .forEach(processor => processor(code, message));
                }
                console.log(`ws closed\n${{ code, message }}`);
            },
            unexpectedResponse: (req, res) => {
                const type = 'unexpected-response';
                if (type in this.eventProcessorMap) {
                    return Object.values(this.eventProcessorMap[type])
                        .forEach(processor => processor(req, res));
                }
                console.log(`ws unexpectedResponse\n${{ req, res }}`);
            }
        });
    }

    /**
     * @description 关闭会话
     * @param {boolean} keepProcessor 是否保留事件处理器，默认值为 false，不保留
     * @param {boolean} keepConfig    是否保留 session baseUrl qq authKey，默认值为 false，不保留
     * @returns {void}
     */
    async close(option /* { keepProcessor, keepConfig }} */) {
        // option 中仅包含一个可选参数 keepProcessor，为什么不直
        // 接在参数列表中解构 {keepProcessor}？因为，在这种情况下，
        // 若用户未传入任何参数，则相当于从 undefined 中解构，会抛异常
        if (option) {
            var { keepProcessor, keepConfig } = option;
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
                if (!keepConfig) {
                    this.config = undefined;
                }
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
            if (!keepConfig) {
                this.config = undefined;
            }
            this.wsConnection = undefined;
        }

    }

    /**
     * @description 向 qq 好友 或 qq 群发送消息，若同时提供，则优先向好友发送消息
     * @param {boolean}            temp         是否是临时会话
     * @param {number}             friend       好友 qq 号
     * @param {number}             group        群号
     * @param {number}             quote        消息引用，使用发送时返回的 messageId
     * @param {array[MessageType]} messageChain 消息链，MessageType 数组
     * @returns {number} messageId
     */
    async sendMessage({ temp = false, friend, group, quote, message, messageChain }) {
        // 必要参数
        const { baseUrl, sessionKey } = this.config;

        // 处理 message
        if (!messageChain) {
            messageChain = message.getMessageChain();
        }

        // 根据 temp、friend、group 参数的情况依次调用
        if (temp) {
            // 临时会话的接口，好友和群是在一起的，在内部做了参数判断并抛出异常
            // 而正常的好友和群的发送消息接口是分开的，所以在外面做了参数判断并抛出异常，格式相同
            return await sendTempMessage({
                baseUrl, sessionKey, qq: friend, group, quote, messageChain
            });
        } else {
            if (friend) {
                return await sendFriendMessage({
                    baseUrl, sessionKey, target: friend, quote, messageChain
                });
            } else if (group) {
                return await sendGroupMessage({
                    baseUrl, sessionKey, target: group, quote, messageChain
                });
            } else {
                throw { message: 'sendTempMessage 未提供 qq 及 group 参数' };
            }
        }
    }

    /**
     * @description 添加一个事件处理器
     * 框架维护的 WebSocket 实例会在 ws 的事件 message 下分发 Mirai http server 的消息
     * 回调函数 (data) => void，data 的结构取决于消息类型，详见 mirai-api-http 的文档
     * 而对于 ws 的其他事件 error, close, unexpectedResponse，其回调函数分别为
     * - 'error':               (err: Error) => void
     * - 'close':               (code: number, message: string) => void
     * - 'unexpected-response': (request: http.ClientRequest, response: http.IncomingMessage) => void
     * @param   {string}   eventType 事件类型
     * @param   {function} callback  回调函数
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
     * @returns {void}
     */
    off(eventType, handle) {
        if (handle in this.eventProcessorMap[eventType]) {
            delete this.eventProcessorMap[eventType][handle];
        }
    }

    /**
     * @description 移除所有事件处理器
     * @returns {void}
     */
    offAll() {
        this.eventProcessorMap = {};
    }

    /**
     * @description 获取 config
     * @returns {Object} 结构 { cacheSize, enableWebsocket }
     */
    async getConfig() {
        const { baseUrl, sessionKey } = this.config;
        return await getConfig({ baseUrl, sessionKey });
    }

    /**
     * @description 设置 config
     * @param   {number} cacheSize        插件缓存大小
     * @param   {boolean} enableWebsocket websocket 状态
     * @returns void
     */
    async setConfig({ cacheSize, enableWebsocket }) {
        const { baseUrl, sessionKey } = this.config;
        await setConfig({ baseUrl, sessionKey, cacheSize, enableWebsocket });
    }

    /**
     * @description 撤回由 messageId 确定的消息
     * @param {number} messageId 欲撤回消息的 messageId
     * @returns {void}
     */
    async recall({ messageId }) {
        // todo
    }

    /**
     * FIXME: type 指定为 'friend' 或 'temp' 时发送的图片显示红色感叹号，无法加载，group 则正常
     * @description 上传图片至服务器，返回指定 type 的 imageId，url，及 path
     * @param {string} type     "friend" 或 "group" 或 "temp"，三种类型返回的 messageId 并不相同
     * @param {Buffer} img      二选一，图片二进制数据
     * @param {string} filename 二选一，图片文件路径
     * @returns {Object} 结构 { imageId, url, path } 
     */
    async uploadImage({ type = 'group', img, filename }) {
        // 检查参数
        if (!img && !filename) {
            throw new Error('uploadImage 缺少必要的 img 或 filename 参数');
        }

        // 若传入 filename 则统一转换为 Buffer
        if (filename) {
            // 优先使用 img 的原值
            img = img || fs.readFileSync(filename);
        }

        const { baseUrl, sessionKey } = this.config;
        return await uploadImage({ baseUrl, sessionKey, type, img });
    }

    /**
     * FIXME: 目前该功能返回的 voiceId 无法正常使用，无法
     * 发送给好友，提示 message is empty，发到群里则是 1s 的无声语音
     * @description 上传语音至服务器，返回 voiceId, url 及 path
     * @param {string} type     TODO: 目前仅支持 "group"，请忽略该参数
     * @param {Buffer} voice    二选一，语音二进制数据
     * @param {string} filename 二选一，语音文件路径
     * @returns {Object} 结构 { voiceId, url, path } 
     */
    async uploadVoice({ type = 'group', voice, filename }) {
        // 检查参数
        if (!voice && !filename) {
            throw new Error('uploadVoice 缺少必要的 voice 或 filename 参数');
        }

        // 若传入 filename 则统一转换为 Buffer
        if (filename) {
            // 优先使用 img 的原值
            voice = voice || fs.readFileSync(filename);
        }

        const { baseUrl, sessionKey } = this.config;
        return await uploadVoice({ baseUrl, sessionKey, type, voice });
    }

    /**
     * @description 向 mirai-console 发送指令
     * @param   {string}        baseUrl mirai-api-http server 的地址
     * @param   {string}        authKey mirai-api-http server 设置的 authKey
     * @param   {string}        commend 指令名
     * @param   {array[string]} args    array[string] 指令的参数
     * @returns {Object} 结构 { message }，注意查看 message 的内容，已知的问题：
     * 'Login failed: Mirai 无法完成滑块验证. 使用协议 ANDROID_PHONE 强制要求滑块验证, 
     * 请更换协议后重试. 另请参阅: https://github.com/project-mirai/mirai-login-solver-selenium'
     */
    static async sendCommand({ baseUrl, authKey, command, args }) {
        return await sendCommand({ baseUrl, authKey, command, args });
    }


}

module.exports = Bot;