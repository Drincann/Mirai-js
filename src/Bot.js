// 引入核心功能，前缀下划线时为了与方法名区别 (视觉上的区别)
const _releaseSession = require('./core/releaseSession');
const _verify = require('./core/verify');
const _auth = require('./core/auth');
const _sendCommand = require('./core/sendCommand');
const _sendFriendMessage = require('./core/sendFirendMessage');
const _sendGroupMessage = require('./core/sendGroupMessage');
const _sendTempMessage = require('./core/sendTempMessage');
const _getConfig = require('./core/getConfig');
const _setConfig = require('./core/setConfig');
const _uploadImage = require('./core/uploadImage');
const _uploadVoice = require('./core/uploadVoice');
const _getFriendList = require('./core/getFriendList');
const _getGroupList = require('./core/getGroupList');
const _getMemberList = require('./core/getMemberList');
const _recall = require('./core/recall');
const _mute = require('./core/mute');
const _muteAll = require('./core/muteAll');
const _unmute = require('./core/unmute');
const _removeMember = require('./core/removeMember');
const _quitGroup = require('./core/quitGroup');
const _startListening = require('./core/startListening');
const random = require('./util/random')(0, 2E16);
const getInvalidParamsString = require('./util/getInvalidParamsString');
const fs = require('fs');

/**
 * @field config            包含 baseUrl authKey qq
 * @field eventProcessorMap 事件处理器 map
 * @field wsConnection      建立连接的 WebSocket 实例
 */
class Bot {
    /**
     * @description 连接到 mirai-api-http，并开启一个会话，重复调用意为重建会话
     * open 方法 1. 建立会话 2. 绑定 qq 3. 与服务端建立 WebSocket 连接
     * @param {string} baseUrl 必选，mirai-api-http server 的地址
     * @param {string} authKey 必选，mirai-api-http server 设置的 authKey
     * @param {number} qq      必选，欲绑定的 qq 号，需要确保该 qq 号已在 mirai-console 登陆
     * @returns {void}
     */
    async open(option /* { baseUrl, qq, authKey } */) {
        // 若 config 存在，则认为该对象已经 open 过
        // ，此处应该先令对象回到初始状态，然后重建会话
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

        // 需要使用的参数
        const { baseUrl, qq, authKey } = this.config;

        // 检查参数
        if (!this.config.baseUrl || !this.config.qq || !this.config.authKey) {
            throw new Error(`open 缺少必要的 ${getInvalidParamsString({
                baseUrl, qq, authKey,
            })} 参数`);
        }

        // 创建会话
        const sessionKey = this.config.sessionKey = await _auth({ baseUrl, authKey });

        // 绑定到一个 qq
        await _verify({ baseUrl, sessionKey, qq });

        // 开启 websocket
        await _setConfig({ baseUrl, sessionKey, enableWebsocket: true });

        // 开始监听事件
        this.wsConnection = await _startListening({
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
     * @param {boolean} keepProcessor 可选，是否保留事件处理器，默认值为 false，不保留
     * @param {boolean} keepConfig    可选，是否保留 session baseUrl qq authKey，默认值为 false，不保留
     * @returns {void}
     */
    async close(option /* { keepProcessor, keepConfig }} */) {
        // 检查对象状态
        if (!this.config) {
            new Error('close 请先调用 open，建立一个会话');
        }

        // 拿出可选参数
        // option 中仅包含一个可选参数 keepProcessor，为什么不直
        // 接在参数列表中解构 {keepProcessor}？因为，在这种情况下，
        // 若用户未传入任何参数，则相当于从 undefined 中解构
        if (option) {
            var { keepProcessor, keepConfig } = option;
        }

        // 需要使用的参数
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
                await _releaseSession({ baseUrl, sessionKey, qq });

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
            await _releaseSession({ baseUrl, sessionKey, qq });

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
     * @param {boolean}            temp         可选，是否是临时会话，默认为 false
     * @param {number}             friend       二选一，好友 qq 号
     * @param {number}             group        二选一，群号
     * @param {number}             quote        可选，消息引用，使用发送时返回的 messageId
     * @param {Message}            message      二选一，Message 实例
     * @param {array[MessageType]} messageChain 二选一，消息链，MessageType 数组
     * @returns {number} messageId
     */
    async sendMessage({ temp = false, friend, group, quote, message, messageChain }) {
        // 检查对象状态
        if (!this.config) {
            new Error('sendMessage 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!friend && !group || !message && !messageChain) {
            throw new Error(`缺少必要的 ${getInvalidParamsString({
                'friend 或 group': friend || group,
                'message 或 messageChain': message || messageChain,
            })} 参数`)
        }

        // 需要使用的参数
        const { baseUrl, sessionKey } = this.config;

        // 处理 message
        if (!messageChain) {
            messageChain = message.getMessageChain();
        }

        // 根据 temp、friend、group 参数的情况依次调用
        if (temp) {
            // 临时会话的接口，好友和群是在一起的，在内部做了参数判断并抛出异常
            // 而正常的好友和群的发送消息接口是分开的，所以在外面做了参数判断并抛出异常，格式相同
            return await _sendTempMessage({
                baseUrl, sessionKey, qq: friend, group, quote, messageChain
            });
        } else {
            if (friend) {
                return await _sendFriendMessage({
                    baseUrl, sessionKey, target: friend, quote, messageChain
                });
            } else if (group) {
                return await _sendGroupMessage({
                    baseUrl, sessionKey, target: group, quote, messageChain
                });
            } else {
                throw { message: 'sendGroupMessage 缺少必要的 qq 或 group 参数' };
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
     * @param   {string}   eventType 必选，事件类型
     * @param   {function} callback  必选，回调函数
     * @returns {number} 事件处理器的标识，用于移除该处理器
     */
    on(eventType, callback) {
        // 检查对象状态
        if (!this.config) {
            new Error('on 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!eventType || !callback) {
            throw new Error(`on 缺少必要的 ${getInvalidParamsString({ eventType, callback })} 参数`);

        }

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
     * @param {string} eventType 必选，事件类型
     * @param {function} handle  必选，事件处理器标识，由 on 方法返回
     * @returns {void}
     */
    off(eventType, handle) {
        // 检查对象状态
        if (!this.config) {
            new Error('off 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!eventType || !handle) {
            throw new Error(`off 缺少必要的 ${getInvalidParamsString({ eventType, handle })} 参数`);
        }

        // 从 field eventProcessorMap 中移除 handle 指定的事件处理器
        if (handle in this.eventProcessorMap[eventType]) {
            delete this.eventProcessorMap[eventType][handle];
        }
    }

    /**
     * @description 移除所有事件处理器
     * @returns {void}
     */
    offAll() {
        // 检查对象状态
        if (!this.config) {
            new Error('offAll 请先调用 open，建立一个会话');
        }

        this.eventProcessorMap = {};
    }

    /**
     * @description 获取 config
     * @returns {Object} 结构 { cacheSize, enableWebsocket }
     */
    async getConfig() {
        // 检查对象状态
        if (!this.config) {
            new Error('getConfig 请先调用 open，建立一个会话');
        }

        const { baseUrl, sessionKey } = this.config;
        return await _getConfig({ baseUrl, sessionKey });
    }

    /**
     * @description 设置 config
     * @param   {number} cacheSize        可选，插件缓存大小
     * @param   {boolean} enableWebsocket 可选，websocket 状态
     * @returns {void}
     */
    async setConfig({ cacheSize, enableWebsocket }) {
        // 检查对象状态
        if (!this.config) {
            new Error('setConfig 请先调用 open，建立一个会话');
        }

        const { baseUrl, sessionKey } = this.config;
        await _setConfig({ baseUrl, sessionKey, cacheSize, enableWebsocket });
    }

    /**
     * @description 撤回由 messageId 确定的消息
     * @param {number} messageId 欲撤回消息的 messageId
     * @returns {void}
     */
    async recall({ messageId }) {
        // 检查对象状态
        if (!this.config) {
            new Error('recall 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!messageId) {
            throw new Error('recall 缺少必要的 messageId 参数');
        }

        const { baseUrl, sessionKey } = this.config;
        // 撤回消息
        await _recall({ baseUrl, sessionKey, target: messageId });
    }

    /**
     * FIXME: type 指定为 'friend' 或 'temp' 时发送的图片显示红色感叹号，无法加载，group 则正常
     * @description 上传图片至服务器，返回指定 type 的 imageId，url，及 path
     * @param {string} type     可选，"friend" 或 "group" 或 "temp"，默认为 "group"
     * @param {Buffer} img      二选一，图片二进制数据
     * @param {string} filename 二选一，图片文件路径
     * @returns {Object} 结构 { imageId, url, path } 
     */
    async uploadImage({ type = 'group', img, filename }) {
        // 检查对象状态
        if (!this.config) {
            new Error('uploadImage 请先调用 open，建立一个会话');
        }

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
        return await _uploadImage({ baseUrl, sessionKey, type, img });
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
        // 检查对象状态
        if (!this.config) {
            new Error('uploadVoice 请先调用 open，建立一个会话');
        }

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
        return await _uploadVoice({ baseUrl, sessionKey, type, voice });
    }

    /**
     * @description 获取好友列表
     * @returns {array[Object]} 结构 array[...{ id, name, remark }]
     */
    async getFriendList() {
        // 检查对象状态
        if (!this.config) {
            new Error('getFriendList 请先调用 open，建立一个会话');
        }

        const { baseUrl, sessionKey } = this.config;

        // 获取列表
        const friendList = await _getFriendList({ baseUrl, sessionKey });

        // 这里希望所有列表应该具有相同的属性名
        friendList.map((value) => {
            value.name = value.nickname;
            delete value.nickname;
        });
        return friendList;
    }

    /**
     * @description 获取群列表
     * @returns {array[Object]} 结构 array[...{ id, name, permission }]
     */
    async getGroupList() {
        // 检查对象状态
        if (!this.config) {
            new Error('getGroupList 请先调用 open，建立一个会话');
        }

        const { baseUrl, sessionKey } = this.config;
        return await _getGroupList({ baseUrl, sessionKey });
    }

    /**
     * @description 获取指定群的成员列表
     * @param {string} group 欲获取成员列表的群号
     * @returns {array[Object]} 结构 array[...{ id, name, permission }]
     */
    async getMemberList({ group }) {
        // 检查对象状态
        if (!this.config) {
            new Error('getMemberList 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!group) {
            throw new Error('getMemberList 缺少必要的 group 参数');
        }

        // 获取列表
        const { baseUrl, sessionKey } = this.config;
        const memberList = await _getMemberList({ baseUrl, sessionKey, target: group });

        // 这里希望所有列表应该具有相同的属性名
        memberList.map((value) => {
            value.name = value.memberName;
            delete value.group;
            delete value.memberName;
        });
        return memberList;
    }

    /**
     * @description 禁言群成员
     * @param {number} group 必选，欲禁言成员所在群号
     * @param {number} qq    必选，欲禁言成员 qq 号
     * @param {number} time  禁言时长，单位: s (秒)
     * @returns {void}
     */
    async mute({ group, qq, time }) {
        // 检查对象状态
        if (!this.config) {
            new Error('mute 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!group || !qq || !time) {
            throw new Error(`mute 缺少必要的 ${getInvalidParamsString({ group, qq, time })} 参数`);
        }

        const { baseUrl, sessionKey } = this.config;
        // 禁言
        await _mute({ baseUrl, sessionKey, target: group, memberId: qq, time });
    }

    /**
     * @description 全员禁言
     * @param {number} group 必选，欲全员禁言的群号
     * @returns {void}
     */
    async muteAll({ group }) {
        // 检查对象状态
        if (!this.config) {
            new Error('muteAll 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!group) {
            throw new Error(`muteAll 缺少必要的 group 参数`);
        }

        const { baseUrl, sessionKey } = this.config;
        // 禁言
        await _muteAll({ baseUrl, sessionKey, target: group });
    }

    /**
     * @description 解除禁言
     * @param {number} group 必选，欲解除禁言的成员所在群号
     * @param {number} qq    必选，欲解除禁言的成员 qq 号
     * @returns {void}
     */
    async unmute({ group, qq }) {
        // 检查对象状态
        if (!this.config) {
            new Error('unmute 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!group || !qq) {
            throw new Error(`unmute 缺少必要的 ${getInvalidParamsString({ group, qq })} 参数`);
        }

        const { baseUrl, sessionKey } = this.config;
        // 禁言
        await _unmute({ baseUrl, sessionKey, target: group, memberId: qq });
    }

    /**
     * @description 移除群成员
     * @param {number} group   必选，欲移除的成员所在群号
     * @param {number} qq      必选，欲移除的成员 qq 号
     * @param {number} message 可选，默认为空串 ""，信息
     * @returns {void}
     */
    async removeMember({ group, qq, message = "" }) {
        // 检查对象状态
        if (!this.config) {
            new Error('removeMember 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!group || !qq) {
            throw new Error(`removeMember 缺少必要的 ${getInvalidParamsString({ group, qq })} 参数`);
        }

        const { baseUrl, sessionKey } = this.config;
        // 禁言
        await _removeMember({ baseUrl, sessionKey, target: group, memberId: qq, msg: message });
    }

    /**
     * @description 移除群成员
     * @param {number} group   必选，欲移除的成员所在群号
     * @returns {void}
     */
    async quitGroup({ group }) {
        // 检查对象状态
        if (!this.config) {
            new Error('quitGroup 请先调用 open，建立一个会话');
        }

        // 检查参数
        if (!group) {
            throw new Error(`quitGroup 缺少必要的 group 参数`);
        }

        const { baseUrl, sessionKey } = this.config;
        // 禁言
        await _quitGroup({ baseUrl, sessionKey, target: group });
    }

    /**
     * @description 向 mirai-console 发送指令
     * @param {string}        baseUrl 必选，mirai-api-http server 的地址
     * @param {string}        authKey 必选，mirai-api-http server 设置的 authKey
     * @param {string}        command 必选，指令名
     * @param {array[string]} args    可选，array[string] 指令的参数
     * @returns {Object} 结构 { message }，注意查看 message 的内容，已知的问题：
     * 'Login failed: Mirai 无法完成滑块验证. 使用协议 ANDROID_PHONE 强制要求滑块验证, 
     * 请更换协议后重试. 另请参阅: https://github.com/project-mirai/mirai-login-solver-selenium'
     */
    static async sendCommand({ baseUrl, authKey, command, args }) {
        // 检查参数
        if (!baseUrl || !authKey || !command) {
            throw new Error(`sendCommand 缺少必要的 ${getInvalidParamsString({ baseUrl, authKey, command })} 参数`);
        }

        return await _sendCommand({ baseUrl, authKey, command, args });
    }


}

// 静态属性: 群成员的权限
Bot.GroupPermission = {
    OWNER: 'OWNER',
    ADMINISTRATOR: 'ADMINISTRATOR',
    MEMBER: 'MEMBER',
};

module.exports = Bot;