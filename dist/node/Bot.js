"use strict";

// 引入核心功能，前缀下划线时为了与方法名区别 (视觉上的区别)
const _releaseSession = require('./core/releaseSession');

const _verify = require('./core/verify');

const _auth = require('./core/auth');

const _sendCommand = require('./core/sendCommand');

const _sendFriendMessage = require('./core/sendFirendMessage');

const _sendGroupMessage = require('./core/sendGroupMessage');

const _sendTempMessage = require('./core/sendTempMessage');

const _sendNudge = require('./core/sendNudge');

const _getSessionConfig = require('./core/getSessionConfig');

const _setSessionConfig = require('./core/setSessionConfig');

const _uploadImage = require('./core/uploadImage');

const _uploadVoice = require('./core/uploadVoice');

const _getFriendList = require('./core/getFriendList');

const _getGroupList = require('./core/getGroupList');

const _getMemberList = require('./core/getMemberList');

const _getMemberInfo = require('./core/getMemberInfo');

const _setMemberInfo = require('./core/setMemberInfo');

const _recall = require('./core/recall');

const _mute = require('./core/mute');

const _muteAll = require('./core/muteAll');

const _unmute = require('./core/unmute');

const _unmuteAll = require('./core/unmuteAll');

const _removeMember = require('./core/removeMember');

const _quitGroup = require('./core/quitGroup');

const _getGroupConfig = require('./core/getGroupConfig');

const _setGroupConfig = require('./core/setGroupConfig');

const _setEssence = require('./core/setEssence');

const _startListening = process.browser ? require('./core/startListeningBrowser') : require('./core/startListeningNode');

const _stopListening = process.browser ? require('./core/stopListeningBrowser') : require('./core/stopListeningNode'); // 其他


const random = require('./util/random')(0, 2E16);

const getInvalidParamsString = require('./util/getInvalidParamsString');

const fs = require('fs');

const {
  promisify
} = require('util');

const {
  Waiter
} = require('./Waiter');

const {
  FileManager
} = require('./FileManager');

const {
  errCodeEnum
} = require('./util/errCode'); // 扩展接口


const {
  MessageChainGetable,
  BotConfigGetable
} = require('./interface');
/**
 * @field config            包含 baseUrl authKey qq
 * @field eventProcessorMap 事件处理器 map
 * @field wsConnection      建立连接的 WebSocket 实例
 * @field waiter            内部类单例，提供同步 io 机制
 */


class Bot extends BotConfigGetable {
  constructor() {
    super(); // 实例化一个内部类 Waiter

    this.waiter = new Waiter(this);
    this.config = undefined;
    this.eventProcessorMap = undefined;
    this.wsConnection = undefined;
  }
  /**
   * 实现 BotConfigGetable 接口
   */


  getBaseUrl() {
    return this.config.baseUrl;
  }

  getQQ() {
    return this.config.qq;
  }

  getAuthKey() {
    return this.config.authKey;
  }

  getSessionKey() {
    return this.config.sessionKey;
  }
  /**
   * @description 连接到 mirai-api-http，并开启一个会话，重复调用意为重建会话
   * open 方法 1. 建立会话 2. 绑定 qq 3. 与服务端建立 WebSocket 连接
   * @param {string} baseUrl 必选，mirai-api-http server 的地址
   * @param {string} authKey 必选，mirai-api-http server 设置的 authKey
   * @param {number} qq      必选，欲绑定的 qq 号，需要确保该 qq 号已在 mirai-console 登陆
   * @returns {void}
   */


  async open({
    baseUrl,
    qq,
    authKey
  } = {}) {
    var _this$config$baseUrl, _this$config, _this$config$qq, _this$config2, _this$config$authKey, _this$config3, _this$config$sessionK, _this$config4, _this$eventProcessorM;

    // 若 config 存在，则认为该对象已经 open 过
    // ，此处应该先令对象回到初始状态，然后重建会话
    if (this.config) {
      await this.close({
        keepProcessor: true,
        keepConfig: true
      });
    } // 设置对象状态
    // 若开发者重复调用 open，仅更新已提供的值


    this.config = {
      baseUrl: (_this$config$baseUrl = (_this$config = this.config) === null || _this$config === void 0 ? void 0 : _this$config.baseUrl) !== null && _this$config$baseUrl !== void 0 ? _this$config$baseUrl : baseUrl,
      qq: (_this$config$qq = (_this$config2 = this.config) === null || _this$config2 === void 0 ? void 0 : _this$config2.qq) !== null && _this$config$qq !== void 0 ? _this$config$qq : qq,
      authKey: (_this$config$authKey = (_this$config3 = this.config) === null || _this$config3 === void 0 ? void 0 : _this$config3.authKey) !== null && _this$config$authKey !== void 0 ? _this$config$authKey : authKey,
      sessionKey: (_this$config$sessionK = (_this$config4 = this.config) === null || _this$config4 === void 0 ? void 0 : _this$config4.sessionKey) !== null && _this$config$sessionK !== void 0 ? _this$config$sessionK : ''
    }; // 事件处理器 map
    // 如果重复调用 open 则保留事件处理器

    this.eventProcessorMap = (_this$eventProcessorM = this.eventProcessorMap) !== null && _this$eventProcessorM !== void 0 ? _this$eventProcessorM : {}; // 需要使用的参数

    ({
      baseUrl,
      qq,
      authKey
    } = this.config); // 检查参数

    if (!this.config.baseUrl || !this.config.qq || !this.config.authKey) {
      throw new Error(`open 缺少必要的 ${getInvalidParamsString({
        baseUrl,
        qq,
        authKey
      })} 参数`);
    } // 创建会话


    const sessionKey = this.config.sessionKey = await _auth({
      baseUrl,
      authKey
    }); // 绑定到一个 qq

    await _verify({
      baseUrl,
      sessionKey,
      qq
    }); // 配置服务端 websocket 状态

    await _setSessionConfig({
      baseUrl,
      sessionKey,
      enableWebsocket: true
    }); // 开始监听事件

    await this.__wsListen();
  }
  /**
   * @private
   * @description 监听 ws 消息
   */


  async __wsListen() {
    const {
      baseUrl,
      sessionKey
    } = this.config;
    this.wsConnection = await _startListening({
      baseUrl,
      sessionKey,
      message: data => {
        // 如果当前到达的事件拥有处理器，则依次调用所有该事件的处理器
        if (data.type in this.eventProcessorMap) {
          data.bot = this;
          return Object.values(this.eventProcessorMap[data.type]).forEach(processor => processor(data));
        }
      },
      error: err => {
        const type = 'error';

        if (type in this.eventProcessorMap) {
          err.bot = this;
          return Object.values(this.eventProcessorMap[type]).forEach(processor => processor(err));
        }

        try {
          console.log(`ws error\n${JSON.stringify(err)}`);
        } catch (error) {} // eslint-disable-line no-empty

      },
      close: obj => {
        const type = 'close';

        if (type in this.eventProcessorMap) {
          obj.bot = this;
          return Object.values(this.eventProcessorMap[type]).forEach(processor => processor(obj));
        }

        try {
          console.log(`ws close\n${JSON.stringify(obj)}`);
        } catch (error) {} // eslint-disable-line no-empty

      },
      unexpectedResponse: obj => {
        const type = 'unexpected-response';

        if (type in this.eventProcessorMap) {
          obj.bot = this;
          return Object.values(this.eventProcessorMap[type]).forEach(processor => processor(obj));
        }

        try {
          console.log(`ws unexpectedResponse\n${JSON.stringify(obj)}`);
        } catch (error) {} // eslint-disable-line no-empty

      }
    });
  }
  /**
   * @description 关闭会话
   * @param {boolean} keepProcessor 可选，是否保留事件处理器，默认值为 false，不保留
   * @param {boolean} keepConfig    可选，是否保留 session baseUrl qq authKey，默认值为 false，不保留
   * @returns {void}
   */


  async close({
    keepProcessor = false,
    keepConfig = false
  } = {}) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('close 请先调用 open，建立一个会话');
    } // 需要使用的参数


    const {
      baseUrl,
      sessionKey,
      qq
    } = this.config; //  关闭 ws 连接

    await _stopListening(this.wsConnection); // 释放会话

    await _releaseSession({
      baseUrl,
      sessionKey,
      qq
    }); // 初始化对象状态

    if (!keepProcessor) {
      this.eventProcessorMap = undefined;
    }

    if (!keepConfig) {
      this.config = undefined;
    }

    this.wsConnection = undefined;
  }
  /**
   * ! messageChain 将在未来被移除
   * @description 向 qq 好友 或 qq 群发送消息，若同时提供，则优先向好友发送消息
   * @param {boolean} temp    可选，是否是临时会话，默认为 false
   * @param {number}  friend  二选一，好友 qq 号
   * @param {number}  group   二选一，群号
   * @param {number}  quote   可选，消息引用，使用发送时返回的 messageId
   * @param {Message} message 必选，Message 实例或 MessageType 数组
   * @returns {number} messageId
   */


  async sendMessage({
    temp = false,
    friend,
    group,
    quote,
    message,
    messageChain
  }) {
    var _messageChain;

    // 检查对象状态
    if (!this.config) {
      throw new Error('sendMessage 请先调用 open，建立一个会话');
    } // 检查参数


    if (!friend && !group | !message && !messageChain) {
      throw new Error(`sendMessage 缺少必要的 ${getInvalidParamsString({
        'friend 或 group': friend || group,
        'message 或 messageChain': message || messageChain
      })} 参数`);
    }

    if (messageChain) {
      console.log('warning: 现在 sendMessage 方法的 message 参数可以同时接收 Message 实例或 messageChain，messageChain 参数将在未来被移除');
    } // 需要使用的参数


    const {
      baseUrl,
      sessionKey
    } = this.config; // 处理 message，兼容存在 messageChain 参数的版本

    messageChain = (_messageChain = messageChain) !== null && _messageChain !== void 0 ? _messageChain : message;

    if (messageChain instanceof MessageChainGetable) {
      messageChain = messageChain.getMessageChain();
    } else if (typeof messageChain === 'string') {
      messageChain = [{
        type: 'Plain',
        text: messageChain
      }];
    } // 根据 temp、friend、group 参数的情况依次调用


    if (temp) {
      // 临时会话的接口，好友和群是在一起的，在内部做了参数判断并抛出异常
      // 而正常的好友和群的发送消息接口是分开的，所以在外面做了参数判断并抛出异常，格式相同
      return await _sendTempMessage({
        baseUrl,
        sessionKey,
        qq: friend,
        group,
        quote,
        messageChain
      });
    } else {
      if (friend) {
        return await _sendFriendMessage({
          baseUrl,
          sessionKey,
          target: friend,
          quote,
          messageChain
        });
      } else if (group) {
        return await _sendGroupMessage({
          baseUrl,
          sessionKey,
          target: group,
          quote,
          messageChain
        });
      } else {
        throw {
          message: 'sendGroupMessage 缺少必要的 qq 或 group 参数'
        };
      }
    }
  }
  /**
   * @description 向好友或群成员发送戳一戳
   * 如果提供了 group 参数则忽略 friend
   * mirai-api-http-v1.10.1 feature
   * @param {number} friend 二选一，好友 qq 号
   * @param {number} group  二选一，群成员所在群 
   * @param {number} target 必选，目标 qq 号
   */


  async sendNudge({
    friend,
    group,
    target
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('sendNudge 请先调用 open，建立一个会话');
    } // 检查参数


    if (!((group || friend) && target)) {
      throw new Error(`sendNudge 缺少必要的 ${getInvalidParamsString({
        'group 或 friend': group || friend,
        'target': target
      })} 参数`);
    } // 需要使用的参数


    const {
      baseUrl,
      sessionKey
    } = this.config; // 发给群成员

    if (group) {
      await _sendNudge({
        baseUrl,
        sessionKey,
        target,
        subject: group,
        kind: 'Group'
      });
    } // 发给好友
    else if (friend) {
        await _sendNudge({
          baseUrl,
          sessionKey,
          target,
          subject: friend,
          kind: 'Friend'
        });
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
   * @param {string | string[]}   eventType 必选，事件类型
   * @param {function} callback  必选，回调函数
   * @returns {number | string[]} 事件处理器的标识，用于移除该处理器
   */


  on(eventType, callback) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('on 请先调用 open，建立一个会话');
    } // 检查参数


    if (!eventType || !callback) {
      throw new Error(`on 缺少必要的 ${getInvalidParamsString({
        eventType,
        callback
      })} 参数`);
    } // 适配 eventType 数组


    if (Array.isArray(eventType)) {
      return eventType.map(event => this.on(event, callback));
    } // 为没有任何事件处理器的事件生成一个空对象 (空对象 {}，而不是 null)


    if (!(eventType in this.eventProcessorMap)) {
      this.eventProcessorMap[eventType] = {};
    } // 生成一个唯一的 handle，作为当前 
    // processor 的标识，用于移除该处理器


    let handle = random();

    while (handle in this.eventProcessorMap[eventType]) {
      handle = random();
    } // processor
    // 每个事件对应多个 processor，这些 processor 和 
    // handle 分别作为 value 和 key 包含在一个大对象中


    let processor = callback; // 添加事件处理器

    this.eventProcessorMap[eventType][handle] = processor;
    return handle;
  }
  /**
   * @description 添加一个一次性事件处理器，回调一次后自动移除
   * @param {string | string[]}   eventType 必选，事件类型
   * @param {function} callback  必选，回调函数
   * @param {boolean}  strict    可选，是否严格检测调用，由于消息可能会被中间件拦截
   *                             当为 true 时，只有开发者的处理器结束后才会移除该处理器
   *                             当为 false 时，即使消息被拦截，也会移除该处理器
   * @returns {void}
   */


  one(eventType, callback, strict = false) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('one 请先调用 open，建立一个会话');
    } // 检查参数


    if (!eventType || !callback) {
      throw new Error(`one 缺少必要的 ${getInvalidParamsString({
        eventType,
        callback
      })} 参数`);
    } // 适配 eventType 数组


    if (Array.isArray(eventType)) {
      eventType.map(event => this.one(event, callback));
      return;
    } // 为没有任何事件处理器的事件生成一个空对象 (空对象 {}，而不是 null)


    if (!(eventType in this.eventProcessorMap)) {
      this.eventProcessorMap[eventType] = {};
    } // 生成一个唯一的 handle，作为当前 
    // processor 的标识，用于移除该处理器


    let handle = random();

    while (handle in this.eventProcessorMap[eventType]) {
      handle = random();
    } // processor
    // 每个事件对应多个 processor，这些 processor 和 h
    // andle 分别作为 value 和 key 包含在一个大对象中


    const processor = async data => {
      if (strict) {
        // 严格检测回调
        // 当开发者的处理器结束后才移除该处理器，这里等待异步回调
        await callback(data);

        if (handle in this.eventProcessorMap[eventType]) {
          delete this.eventProcessorMap[eventType][handle];
        }
      } else {
        // 不严格检测，直接移除处理器
        // 从 field eventProcessorMap 中移除 handle 指定的事件处理器
        if (handle in this.eventProcessorMap[eventType]) {
          delete this.eventProcessorMap[eventType][handle];
        } // 调用开发者提供的回调


        callback(data);
      }
    }; // 添加事件处理器


    this.eventProcessorMap[eventType][handle] = processor;
  }
  /**
   * @description 移除一个事件处理器
   * @param {string}                 eventType 必选，事件类型
   * @param {number | number[]} handle    
   * 可选，事件处理器标识(或数组)，由 on 方法返回，未提供时将移除该事件下的所有处理器
   * @returns {void}
   */


  off(eventType, handle) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('off 请先调用 open，建立一个会话');
    } // 检查参数


    if (!eventType) {
      throw new Error('off 缺少必要的 eventType 参数');
    }

    if (handle) {
      // 从 field eventProcessorMap 中移除 handle 指定的事件处理器
      if (handle.forEach) {
        // 可迭代
        handle.forEach(hd => {
          if (hd in this.eventProcessorMap[eventType]) {
            delete this.eventProcessorMap[eventType][hd];
          }
        });
      } else {
        // 不可迭代，认为是单个标识
        if (handle in this.eventProcessorMap[eventType]) {
          delete this.eventProcessorMap[eventType][handle];
        }
      }
    } else {
      // 未提供 handle，移除所有
      if (eventType in this.eventProcessorMap) {
        delete this.eventProcessorMap[eventType];
      }
    }
  }
  /**
   * @description 移除所有事件处理器
   * @param {string | string[]} eventType 可选，事件类型(或数组)
   * @returns {void}
   */


  offAll(eventType) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('offAll 请先调用 open，建立一个会话');
    }

    if (eventType) {
      // 提供了特定的 eventType 参数
      if (eventType.forEach) {
        // 可迭代
        eventType.forEach(evtType => {
          if (evtType in this.eventProcessorMap) {
            delete this.eventProcessorMap[evtType];
          }
        });
      } else {
        // 不可迭代
        if (eventType in this.eventProcessorMap) {
          delete this.eventProcessorMap[eventType];
        }
      }
    } else {
      // 未提供参数，全部移除
      this.eventProcessorMap = {};
    }
  }
  /**
   * @description 获取 config
   * @returns {Object} 结构 { cacheSize, enableWebsocket }
   */


  async getSessionConfig() {
    // 检查对象状态
    if (!this.config) {
      throw new Error('getConfig 请先调用 open，建立一个会话');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config;
    return await _getSessionConfig({
      baseUrl,
      sessionKey
    });
  }
  /**
   * @description 设置 config
   * @param   {number}  cacheSize       可选，插件缓存大小
   * @param   {boolean} enableWebsocket 可选，websocket 状态
   * @returns {void}
   */


  async setSessionConfig({
    cacheSize,
    enableWebsocket
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('setConfig 请先调用 open，建立一个会话');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config;
    await _setSessionConfig({
      baseUrl,
      sessionKey,
      cacheSize,
      enableWebsocket
    });
  }
  /**
   * @description 撤回由 messageId 确定的消息
   * @param {number} messageId 欲撤回消息的 messageId
   * @returns {void}
   */


  async recall({
    messageId
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('recall 请先调用 open，建立一个会话');
    } // 检查参数


    if (!messageId) {
      throw new Error('recall 缺少必要的 messageId 参数');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config; // 撤回消息

    await _recall({
      baseUrl,
      sessionKey,
      target: messageId
    });
  }
  /**
   * FIXME: type 指定为 'friend' 或 'temp' 时发送的图片显示红色感叹号，无法加载，group 则正常
   * @description 上传图片至服务器，返回指定 type 的 imageId，url，及 path
   * @param {string} type     可选，"friend" 或 "group" 或 "temp"，默认为 "group"
   * @param {Buffer} img      二选一，图片二进制数据
   * @param {string} filename 二选一，图片文件路径
   * @returns {Object} 结构 { imageId, url, path } 
   */


  async uploadImage({
    type = 'group',
    img,
    filename
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('uploadImage 请先调用 open，建立一个会话');
    } // 检查参数


    if (process.browser && filename) {
      throw new Error('uploadImage 浏览器端不支持 filename 参数');
    }

    if (!img && !filename) {
      throw new Error('uploadImage 缺少必要的 img 或 filename 参数');
    } // 若传入 filename 则统一转换为 Buffer


    if (filename) {
      var _img;

      // 优先使用 img 的原值
      img = (_img = img) !== null && _img !== void 0 ? _img : await promisify(fs.readFile)(filename);
    }

    const {
      baseUrl,
      sessionKey
    } = this.config;
    return await _uploadImage({
      baseUrl,
      sessionKey,
      type,
      img
    });
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


  async uploadVoice({
    type = 'group',
    voice,
    filename
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('uploadVoice 请先调用 open，建立一个会话');
    } // 检查参数


    if (process.browser && filename) {
      throw new Error('uploadVoice 浏览器端不支持 filename 参数');
    }

    if (!voice && !filename) {
      throw new Error('uploadVoice 缺少必要的 voice 或 filename 参数');
    } // 若传入 filename 则统一转换为 Buffer


    if (filename) {
      var _voice;

      // 优先使用 img 的原值
      voice = (_voice = voice) !== null && _voice !== void 0 ? _voice : await promisify(fs.readFile)(filename);
    }

    const {
      baseUrl,
      sessionKey
    } = this.config;
    return await _uploadVoice({
      baseUrl,
      sessionKey,
      type,
      voice
    });
  }
  /**
   * @description 获取好友列表
   * @returns {Object[]} 结构 array[...{ id, name, remark }]
   */


  async getFriendList() {
    // 检查对象状态
    if (!this.config) {
      throw new Error('getFriendList 请先调用 open，建立一个会话');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config; // 获取列表

    const friendList = await _getFriendList({
      baseUrl,
      sessionKey
    }); // 这里希望所有列表应该具有相同的属性名

    friendList.map(value => {
      value.name = value.nickname;
      delete value.nickname;
    });
    return friendList;
  }
  /**
   * @description 获取群列表
   * @returns {Object[]} 结构 array[...{ id, name, permission }]
   */


  async getGroupList() {
    // 检查对象状态
    if (!this.config) {
      throw new Error('getGroupList 请先调用 open，建立一个会话');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config;
    return await _getGroupList({
      baseUrl,
      sessionKey
    });
  }
  /**
   * @description 获取指定群的成员列表
   * @param {number} group 必选，欲获取成员列表的群号
   * @returns {Object[]} 结构 array[...{ id, name, permission }]
   */


  async getMemberList({
    group
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('getMemberList 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group) {
      throw new Error('getMemberList 缺少必要的 group 参数');
    } // 获取列表


    const {
      baseUrl,
      sessionKey
    } = this.config;
    const memberList = await _getMemberList({
      baseUrl,
      sessionKey,
      target: group
    }); // 这里希望所有列表应该具有相同的属性名

    memberList.map(value => {
      value.name = value.memberName;
      delete value.group;
      delete value.memberName;
    });
    return memberList;
  }
  /**
   * @description 获取群成员信息
   * @param {number} group 必选，群成员所在群号
   * @param {number} qq    必选，群成员的 qq 号
   * @returns {Object[]} 结构 { name, title } 群名片和群头衔
   */


  async getMemberInfo({
    group,
    qq
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('getMemberInfo 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group || !qq) {
      throw new Error(`getMemberInfo 缺少必要的 ${getInvalidParamsString({
        group,
        qq
      })} 参数`);
    } // 获取列表


    const {
      baseUrl,
      sessionKey
    } = this.config;
    const memberInfo = await _getMemberInfo({
      baseUrl,
      sessionKey,
      target: group,
      memberId: qq
    }); // 将 specialTitle 改为 title，在 setMemberInfo 也保持一致

    memberInfo.title = memberInfo.specialTitle;
    delete memberInfo.specialTitle;
    return memberInfo;
  }
  /**
   * @description 设置群成员信息
   * @param {number} group 必选，群成员所在群号
   * @param {number} qq    必选，群成员的 qq 号
   * @param {string} name  可选，要设置的群名片
   * @param {string} title 可选，要设置的群头衔
   * @returns {void}
   */


  async setMemberInfo({
    group,
    qq,
    name,
    title
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('setMemberInfo 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group || !qq) {
      throw new Error(`setMemberInfo 缺少必要的 ${getInvalidParamsString({
        group,
        qq
      })} 参数`);
    } // 获取列表


    const {
      baseUrl,
      sessionKey
    } = this.config;
    await _setMemberInfo({
      baseUrl,
      sessionKey,
      target: group,
      memberId: qq,
      name,
      specialTitle: title
    });
  }
  /**
   * @description 禁言群成员
   * @param {number} group 必选，欲禁言成员所在群号
   * @param {number} qq    必选，欲禁言成员 qq 号
   * @param {number} time  必选，禁言时长，单位: s (秒)
   * @returns {void}
   */


  async mute({
    group,
    qq,
    time
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('mute 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group || !qq || !time) {
      throw new Error(`mute 缺少必要的 ${getInvalidParamsString({
        group,
        qq,
        time
      })} 参数`);
    }

    const {
      baseUrl,
      sessionKey
    } = this.config; // 禁言

    await _mute({
      baseUrl,
      sessionKey,
      target: group,
      memberId: qq,
      time
    });
  }
  /**
   * @description 全员禁言
   * @param {number} group 必选，欲全员禁言的群号
   * @returns {void}
   */


  async muteAll({
    group
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('muteAll 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group) {
      throw new Error('muteAll 缺少必要的 group 参数');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config; // 禁言

    await _muteAll({
      baseUrl,
      sessionKey,
      target: group
    });
  }
  /**
   * @description 解除禁言
   * @param {number} group 必选，欲解除禁言的成员所在群号
   * @param {number} qq    必选，欲解除禁言的成员 qq 号
   * @returns {void}
   */


  async unmute({
    group,
    qq
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('unmute 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group || !qq) {
      throw new Error(`unmute 缺少必要的 ${getInvalidParamsString({
        group,
        qq
      })} 参数`);
    }

    const {
      baseUrl,
      sessionKey
    } = this.config; // 禁言

    await _unmute({
      baseUrl,
      sessionKey,
      target: group,
      memberId: qq
    });
  }
  /**
   * @description 解除全员禁言
   * @param {number} group 必选，欲解除全员禁言的群号
   * @returns {void}
   */


  async unmuteAll({
    group
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('unmute 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group) {
      throw new Error('unmute 缺少必要的 group 参数');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config; // 禁言

    await _unmuteAll({
      baseUrl,
      sessionKey,
      target: group
    });
  }
  /**
   * @description 移除群成员
   * @param {number} group   必选，欲移除的成员所在群号
   * @param {number} qq      必选，欲移除的成员 qq 号
   * @param {string} message 可选，默认为空串 ""，信息
   * @returns {void}
   */


  async removeMember({
    group,
    qq,
    message = ''
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('removeMember 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group || !qq) {
      throw new Error(`removeMember 缺少必要的 ${getInvalidParamsString({
        group,
        qq
      })} 参数`);
    }

    const {
      baseUrl,
      sessionKey
    } = this.config; // 禁言

    await _removeMember({
      baseUrl,
      sessionKey,
      target: group,
      memberId: qq,
      msg: message
    });
  }
  /**
   * @description 移除群成员
   * @param {number} group   必选，欲移除的成员所在群号
   * @returns {void}
   */


  async quitGroup({
    group
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('quitGroup 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group) {
      throw new Error('quitGroup 缺少必要的 group 参数');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config; // 禁言

    await _quitGroup({
      baseUrl,
      sessionKey,
      target: group
    });
  }
  /**
   * @description 获取群配置
   * @param {number} group 必选，群号
   * @returns {Object}
   */


  async getGroupConfig({
    group
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('getGroupConfig 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group) {
      throw new Error('getGroupConfig 缺少必要的 group 参数');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config;
    return await _getGroupConfig({
      baseUrl,
      sessionKey,
      target: group
    });
  }
  /**
   * @description 设置群配置
   * @param {number}  group             必选，群号
   * @param {string}  name	          可选，群名
   * @param {string}  announcement	  可选，群公告
   * @param {boolean} confessTalk	      可选，是否开启坦白说
   * @param {boolean} allowMemberInvite 可选，是否允许群员邀请
   * @param {boolean} autoApprove	      可选，是否开启自动审批入群
   * @param {boolean} anonymousChat     可选，是否允许匿名聊天
   * @returns {void}
   */


  async setGroupConfig({
    group,
    name,
    announcement,
    confessTalk,
    allowMemberInvite,
    autoApprove,
    anonymousChat
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('setGroupConfig 请先调用 open，建立一个会话');
    } // 检查参数


    if (!group) {
      throw new Error('setGroupConfig 缺少必要的 group 参数');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config;
    await _setGroupConfig({
      baseUrl,
      sessionKey,
      target: group,
      name,
      announcement,
      confessTalk,
      allowMemberInvite,
      autoApprove,
      anonymousChat
    });
  }
  /**
   * @description 文件管理器的工厂方法
   * @param {number} group 群号 
   * @returns {FileManager} 文件管理器实例
   */


  fileManager({
    group
  }) {
    return new FileManager({
      bot: this,
      group
    });
  }
  /**
   * @description 设置群精华消息
   * @param {number} messageId 必选，消息 id
   * @returns {void}
   */


  async setEssence({
    messageId
  }) {
    // 检查对象状态
    if (!this.config) {
      throw new Error('setEssence 请先调用 open，建立一个会话');
    } // 检查参数


    if (!messageId) {
      throw new Error('setEssence 缺少必要的 messageId 参数');
    }

    const {
      baseUrl,
      sessionKey
    } = this.config;
    await _setEssence({
      baseUrl,
      sessionKey,
      target: messageId
    });
  }
  /**
   * @description 检测该账号是否已经在 mirai-console 登录
   * @param {string} baseUrl 必选，mirai-api-http server 的地址
   * @param {string} authKey 必选，mirai-api-http server 设置的 authKey
   * @param {number} qq      必选，qq 号
   * @returns 
   */


  static async isBotLoggedIn({
    baseUrl,
    authKey,
    qq
  }) {
    // 检查参数
    if (!baseUrl || !authKey || !qq) {
      throw new Error(`isBotLoggedIn 缺少必要的 ${getInvalidParamsString({
        baseUrl,
        authKey,
        qq
      })} 参数`);
    }

    const sessionKey = await _auth({
      baseUrl,
      authKey
    });
    const {
      code
    } = await _verify({
      baseUrl,
      sessionKey,
      qq,
      throwable: false
    });

    if (code == errCodeEnum.BOT_NOT_FOUND) {
      return false;
    } else {
      _releaseSession({
        baseUrl,
        sessionKey,
        qq
      });

      return true;
    }
  }
  /**
   * @description 向 mirai-console 发送指令
   * @param {string}   baseUrl 必选，mirai-api-http server 的地址
   * @param {string}   authKey 必选，mirai-api-http server 设置的 authKey
   * @param {string}   command 必选，指令名
   * @param {string[]} args    可选，指令的参数
   * @returns {Object} 结构 { message }，注意查看 message 的内容，已知的问题：
   * 'Login failed: Mirai 无法完成滑块验证. 使用协议 ANDROID_PHONE 强制要求滑块验证, 
   * 请更换协议后重试. 另请参阅: https://github.com/project-mirai/mirai-login-solver-selenium'
   */


  static async sendCommand({
    baseUrl,
    authKey,
    command,
    args
  }) {
    // 检查参数
    if (!baseUrl || !authKey || !command) {
      throw new Error(`sendCommand 缺少必要的 ${getInvalidParamsString({
        baseUrl,
        authKey,
        command
      })} 参数`);
    }

    return await _sendCommand({
      baseUrl,
      authKey,
      command,
      args
    });
  }

} // 静态属性: 群成员的权限


Bot.groupPermission = {
  get OWNER() {
    return 'OWNER';
  },

  get ADMINISTRATOR() {
    return 'ADMINISTRATOR';
  },

  get MEMBER() {
    return 'MEMBER';
  }

};
module.exports = {
  Bot
};