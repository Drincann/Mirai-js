import {
    // 图片 id  语音 id  消息 id
    ImageId, VoiceId, MessageId,

    // 事件类型    群成员权限
    EventType, GroupPermission,

    // 接口               原始消息类型  事件处理器类型
    MessageChainGetable, MessageType, Processor
} from './BaseType';

// 等待器
import { Waiter } from './Waiter';


export class Bot {
    // 成员属性
    public waiter: Waiter;

    // 类属性
    public static groupPermission: {
        OWNER: GroupPermission;
        ADMINISTRATOR: GroupPermission;
        MEMBER: GroupPermission;
    };

    // 一些私有的实例属性
    private config: Bot.BotConfig;
    private eventProcessorMap: Bot.EventProcessorMap;
    private wsConnection: WebSocket;

    // 普通成员方法
    /**
     * @description 连接到 mirai-api-http，并开启一个会话，重复调用意为重建会话
     * open 方法 1. 建立会话 2. 绑定 qq 3. 与服务端建立 WebSocket 连接
     * @param baseUrl 必选，mirai-api-http server 的地址
     * @param authKey 必选，mirai-api-http server 设置的 authKey
     * @param qq      必选，欲绑定的 qq 号，需要确保该 qq 号已在 mirai-console 登陆
     */
    open({ baseUrl, authKey, qq }: Bot.OpenOptions): Promise<void>;

    /**
     * @description 关闭会话
     * @param keepProcessor 可选，是否保留事件处理器，默认值为 false，不保留
     * @param keepConfig    可选，是否保留 session baseUrl qq authKey，默认值为 false，不保留
     */
    close({ keepProcessor, keepConfig }: Bot.CloseOptions): Promise<void>;

    /**
     * ! messageChain 将在未来被移除
     * @description 向 qq 好友 或 qq 群发送消息，若同时提供，则优先向好友发送消息
     * @param temp    可选，是否是临时会话，默认为 false
     * @param friend  二选一，好友 qq 号
     * @param group   二选一，群号
     * @param quote   可选，消息引用，使用发送时返回的 messageId
     * @param message 必选，Message 实例或 MessageType 数组
     * @returns messageId 可用于撤回该消息
     */
    sendMessage({ temp, friend, group, quote, message }: Bot.SendMessageOptions): Promise<MessageId>;

    /**
     * @description 向好友或群成员发送戳一戳
     * 如果提供了 group 参数则忽略 friend
     * mirai-api-http-v1.10.1 feature
     * @param friend 二选一，好友 qq 号
     * @param group  二选一，群成员所在群 
     * @param target 必选，目标 qq 号
     */
    async sendNudge({ friend, group, target }: Bot.SendNudgeOptions): Promise<void>;
    /**
     * @description 添加一个事件处理器
     * 框架维护的 WebSocket 实例会在 ws 的事件 message 下分发 Mirai http server 的消息
     * 回调函数 (data) => any，data 的结构取决于消息类型，详见 mirai-api-http 的文档
     * 而对于 ws 的其他事件 error, close, unexpectedResponse，其回调函数分别为
     * - 'error':               (err: Error) => void
     * - 'close':               (code: number, message: string) => void
     * - 'unexpected-response': (request: http.ClientRequest, response: http.IncomingMessage) => void
     * @param eventType 必选，事件类型
     * @param callback  必选，回调函数
     * @returns handle 事件处理器的标识，用于移除该处理器
     */
    on(eventType: EventType, processor: Processor): number;

    /**
     * @description 添加一个一次性事件处理器，回调一次后自动移除
     * @param eventType 必选，事件类型
     * @param callback  必选，回调函数
     * @param strict    可选，是否严格检测调用，由于消息可能会被中间件拦截
     *                  当为 true 时，只有开发者的处理器结束后才会移除该处理器
     *                  当为 false 时，即使消息被拦截，也会移除该处理器
     */
    one(eventType: EventType, processor: Processor, strict: boolean,): void;

    /**
     * @description 移除一个事件处理器
     * @param eventType 必选，事件类型
     * @param handle    可选，事件处理器标识(或数组)，由 on 方法
     *                  返回，未提供时将移除该事件下的所有处理器
     */
    off(eventType: EventType, handle?: number | number[]): void;

    /**
     * @description 移除所有事件处理器
     * @param eventType 可选，事件类型(或数组)
     */
    ofAll(eventType?: EventType | EventType[]): void;

    /**
     * @description 获取 config
     */
    getSessionConfig(): Promise<Bot.SessionConfig>;

    /**
     * @description 设置 config
     * @param cacheSize       可选，插件缓存大小
     * @param enableWebsocket 可选，websocket 状态
     */
    setSessionConfig({ cacheSize, enableWebsocket }: Bot.SessionConfig): Promise<void>;

    /**
     * @description 撤回由 messageId 确定的消息
     * @param messageId 欲撤回消息的 messageId
     */
    recall({ messageId }: Bot.RecallOptions): Promise<void>;

    /**
     * @description 上传图片至服务器，返回指定 type 的 imageId，url，及 path
     * @param type     可选，"friend" 或 "group" 或 "temp"，默认为 "group"
     * @param img      二选一，图片二进制数据
     * @param filename 二选一，图片文件路径
     */
    uploadImage({ type, img, filename }: Bot.UploadImageOptions): Promise<Bot.ImageInfo>;


    /**
     * @description 上传语音至服务器，返回 voiceId, url 及 path
     * @param {string} type     目前仅支持 "group"，请忽略该参数
     * @param {Buffer} voice    二选一，语音二进制数据
     * @param {string} filename 二选一，语音文件路径
     */
    uploadVoice({ type, voice, filename }: Bot.UploadVoiceOptions): Promise<Bot.VoiceInfo>;

    /**
     * @description 获取好友列表
     */
    getFriendList(): Promise<Bot.FriendInfo[]>;

    /**
     * @description 获取群列表
     */
    getGroupList(): Promise<Bot.GroupInfo[]>;

    /**
     * @description 获取指定群的成员列表
     * @param group 必选，欲获取成员列表的群号
     */
    getMemberList({ group }: Bot.GetMemberListOptions): Promise<Bot.MemberInfo[]>;

    /**
     * @description 获取群成员信息
     * @param group 必选，群成员所在群号
     * @param qq    必选，群成员的 qq 号
     */
    getMemberInfo(): Promise<Bot.MemberDetails>;

    /**
     * @description 设置群成员信息
     * @param group 必选，群成员所在群号
     * @param qq    必选，群成员的 qq 号
     * @param name  可选，要设置的群名片
     * @param title 可选，要设置的群头衔
     */
    setMemberInfo({ group, qq, name, title }: Bot.SetMemberInfoOptions): Promise<void>;

    /**
     * @description 禁言群成员
     * @param group 必选，欲禁言成员所在群号
     * @param qq    必选，欲禁言成员 qq 号
     * @param time  必选，禁言时长，单位: s (秒)
     */
    mute({ group, qq, time }: Bot.MuteOptions): Promise<void>;

    /**
     * @description 全员禁言
     * @param group 必选，欲全员禁言的群号
     */
    muteAll({ group }: Bot.MuteAllOptions): Promise<void>;

    /**
     * @description 解除禁言
     * @param group 必选，欲解除禁言的成员所在群号
     * @param qq    必选，欲解除禁言的成员 qq 号
     */
    unmute({ group, qq }: Bot.UnmuteOptions): Promise<void>;

    /**
     * @description 解除全员禁言
     * @param group 必选，欲解除全员禁言的群号
     */
    unmuteAll({ group }: Bot.UnmuteAllOptions): Promise<void>;

    /**
     * @description 移除群成员
     * @param group   必选，欲移除的成员所在群号
     * @param qq      必选，欲移除的成员 qq 号
     * @param message 可选，默认为空串 ""，信息
     */
    removeMember({ group, qq, message }: Bot.RemoveMemberOptions): Promise<void>;

    /**
     * @description 移除群成员
     * @param group   必选，欲移除的成员所在群号
     */
    quitGroup({ group }: Bot.QuitGroupOptions): Promise<void>;

    /**
     * @description 获取群配置
     * @param group 必选，群号
     */
    getGroupConfig({ group }: Bot.GetGroupOptions): Promise<Bot.GroupConfig>;

    /**
     * @description 设置群配置
     * @param target            必选，群号
     * @param name	            可选，群名
     * @param announcement	    可选，群公告
     * @param confessTalk	    可选，是否开启坦白说
     * @param allowMemberInvite 可选，是否允许群员邀请
     * @param autoApprove	    可选，是否开启自动审批入群
     * @param anonymousChat     可选，是否允许匿名聊天
     */
    setGroupConfig({
        group: number,
        name, announcement, confessTalk,
        allowMemberInvite, autoApprove, anonymousChat,
    }: Bot.SetGroupConfigOptions): Promise<void>;


    // 类方法
    /**
     * @description 检测该账号是否已经在 mirai-console 登录
     * @param baseUrl 必选，mirai-api-http server 的地址
     * @param authKey 必选，mirai-api-http server 设置的 authKey
     * @param qq      必选，qq 号
     */
    static isBotLoggedIn({ baseUrl, authKey, qq }: Bot.IsBotLoggedInOptions): Promise<boolean>;

    /**
     * @description 向 mirai-console 发送指令
     * @param baseUrl 必选，mirai-api-http server 的地址
     * @param authKey 必选，mirai-api-http server 设置的 authKey
     * @param command 必选，指令名
     * @param args    可选，array[string] 指令的参数
     */
    static sendCommand({
        baseUrl, authKey,
        command, args,
    }: Bot.SendCommandOptions): Promise<Bot.MiraiConsoleMessage>;
}

// 类型
declare namespace Bot {

    interface BotConfig {
        baseUrl: string;
        qq: number;
        authKey: string;
        sessionKey: string;
    }
    // An index signature parameter type cannot be a union type. Consider using a mapped object type instead.
    interface EventProcessorMap {
        // 索引不能使用联合类型
        [eventType: string /* EventType */]: {
            [handle: number]: Processor;
        };
    }

    interface OpenOptions {
        baseUrl?: string;
        authKey?: string;
        qq?: number;
    }

    interface CloseOptions {
        keepProcessor?: boolean;
        keepConfig?: boolean;
    }

    interface SendMessageOptions {
        temp?: boolean;
        friend?: number;
        group?: number;
        quote?: MessageId;
        message?: MessageChainGetable | MessageType[];
    }

    interface SendNudgeOptions {
        friend?: number;
        group?: number;
        target: number;
    }

    interface SessionConfig {
        cacheSize?: number;
        enableWebsocket?: boolean;
    }

    interface RecallOptions {
        messageId: MessageId;
    }

    interface UploadImageOptions {
        type?: 'friend' | 'group' | 'temp';
        img?: Buffer;
        filename?: string;
    }

    interface UploadVoiceOptions {
        type?: 'friend' | 'group' | 'temp';
        voice?: Buffer;
        filename?: string;
    }

    interface ImageInfo {
        imageId: ImageId;
        url: string;
        path: string;
    }

    interface VoiceInfo {
        voiceId: VoiceId;
        url: string;
        path: string;
    }

    interface FriendInfo {
        id: number;
        name: string;
        remark: string;
    }

    interface GroupInfo {
        id: number;
        name: string;
        permission: GroupPermission;
    }

    interface MemberInfo {
        id: number;
        name: string;
        permission: GroupPermission;
    }

    interface MemberDetails {
        name: string;
        title: string;
    }

    interface GetMemberListOptions {
        group: number;
    }

    interface SetMemberInfoOptions {
        group: number;
        qq: number;
        name?: string;
        title?: string;
    }

    interface MuteOptions {
        group: number;
        qq: number;
        time: number;
    }

    interface MuteAllOptions {
        group: number;
    }

    interface UnmuteOptions {
        group: number;
        qq: number;
    }

    interface UnmuteAllOptions {
        group: number;
    }

    interface RemoveMemberOptions {
        group: number;
        qq: number;
        message?: string;
    }

    interface QuitGroupOptions {
        group: number;
    }

    interface GetGroupOptions {
        group: number;
    }

    interface GroupConfig {
        name: string;
        announcement: string;
        confessTalk: boolean;
        allowMemberInvite: boolean;
        autoApprove: boolean;
        anonymousChat: boolean;
    }

    interface SetGroupConfigOptions {
        group: number;
        name?: string;
        announcement?: string;
        confessTalk?: boolean;
        allowMemberInvite?: boolean;
        autoApprove?: boolean;
        anonymousChat?: boolean;
    }

    interface SendCommandOptions {
        baseUrl: string;
        authKey: string;
        command: string;
        args: string[];
    }

    interface IsBotLoggedInOptions {
        baseUrl: string;
        authKey: string;
        qq: number;
    }

    interface MiraiConsoleMessage {
        message: string
    }
}
