import { Processor } from './BaseType';
import { Bot } from './Bot';

export class Middleware {
    private middleware: ((data: any, next: Middleware.NextMiddlewareCaller) => any)[];
    private catcher: (error: any) => any;

    /**
     * @description 自动重新登陆
     * @param bot      欲重新登陆的 Bot 实例
     * @param baseUrl  mirai-api-http server 的地址
     * @param authKey  mirai-api-http server 设置的 authKey
     * @param password 欲重新登陆的 qq 密码
     */
    autoReLogin({ bot, baseUrl, authKey, password }: AutoReLoginOptions): Middleware;

    /**
     * @description 自动重建 ws 连接
     * @param bot 欲重连的 Bot 实例
     */
    autoReconnection(bot: Bot): Middleware;

    /**
     * @description 过滤出指定类型的消息，消息类型为 key，对应类型的
     *              message 数组为 value，置于 data.classified
     * @param typeArr message 的类型，例如 Plain Image Voice
     */
    messageProcessor(typeArr: string[]): Middleware;

    /**
     * @description 过滤出字符串类型的 message，并拼接在一起，置于 data.text
     */
    textProcessor(): Middleware;

    /**
     * @description 过滤出消息 id，置于 data.messageId
     */
    messageIdProcessor(): Middleware;

    /**
     * @description 过滤指定的群消息
     * @param groupArr 允许通过的群号数组
     * @param allow    允许通过还是禁止通过
     */
    groupFilter(groupArr: number[], allow: boolean): Middleware;

    /**
     * @description 过滤指定的好友消息
     * @param friendArr 好友 qq 号数组
     * @param allow     允许通过还是禁止通过
     */
    friendFilter(friendArr: number[], allow: boolean): Middleware;

    /**
     * @description 过滤指定群的群成员的消息
     * @param groupMemberMap 群和成员的 Map
     * @param allow          允许通过还是禁止通过
     * 结构 { number => number[], } key 为允许通过的群号，value 为该群允许通过的成员 qq
     */
    groupMemberFilter(groupMemberMap: GroupMemberMap, allow: boolean): Middleware;

    /**
     * @description 这是一个对话锁，保证群中同一成员不能在中途触发处理器
     * @use 在你需要保护的过程结束后调用 data.unlock 即可
     */
    memberLock({ autoUnlock }?: Middleware.LockOptions): Middleware;

    /**
     * @description 这是一个对话锁，保证同一好友不能在中途触发处理器
     * @use 在你需要保护的过程结束后调用 data.unlock 即可
     */
    friendLock({ autoUnlock }?: Middleware.LockOptions): Middleware;

    /**
     * @description 过滤包含指定 @ 信息的消息
     * @param atArr 必选，qq 号数组
     * @param allow 可选，允许通过还是禁止通过
     */
    atFilter(friendArr: number[], allow: boolean): Middleware;

    /**
     * @description 用于 NewFriendRequestEvent 的中间件，经过该中间件后，将在 data 下放置三个方法
     * agree、refuse、refuseAndAddBlacklist，调用后将分别进行好友请求的 同意、拒绝和拒绝并加入黑名单
     */
    friendRequestProcessor(): Middleware;

    /**
     * ! mirai-core 的问题，有时候收不到 MemberJoinRequestEvent 事件
     * 该功能未经测试
     * @description 用于 MemberJoinRequestEvent 的中间件，经过该中间件后，将在 data 下放置五个方法
     * agree                 同意
     * refuse                拒绝
     * ignore                忽略
     * refuseAndAddBlacklist 拒绝并移入黑名单
     * ignoreAndAddBlacklist 忽略并移入黑名单
     * @param bot 必选，Bot 实例
     */
    memberJoinRequestProcessor(): Middleware;

    /**
     * ! 目前被邀请入群不会触发 BotInvitedJoinGroupRequestEvent 事件
     * 该功能未经测试
     * @description 用于 BotInvitedJoinGroupRequestEvent 的中间件，经过该中间件后，将在 data 下放置两个方法
     * agree                 同意
     * refuse                拒绝
     * @param bot 必选，Bot 实例
     */
    invitedJoinGroupRequestProcessor(): Middleware;

    /**
     * @description Waiter 的包装器，提供方便的同步 IO 方式
     */
    syncWrapper(): Middleware;

    /**
     * @description 添加一个自定义中间件
     * @param callback (data, next) => void
     */
    use(callback: (data: any, next: Middleware.NextMiddlewareCaller) => any): Middleware;

    /**
     * @description 使用错误处理器
     * @param catcher 错误处理器 (err) => void
     */
    catch(catcher: (error: any) => any): Middleware;

    /**
     * @description 生成一个带有中间件的事件处理器
     * @param callback 事件处理器
     */
    done(callback: Processor): Processor;

}

declare namespace Middleware {
    type NextMiddlewareCaller = () => NextMiddlewareCaller | Processor;

    interface GroupMemberMap {
        [group: number]: number[];
    }

    interface AutoReLoginOptions {
        bot: Bot;
        baseUrl: string;
        authKey: string;
        password: string;
    }

    interface LockOptions {
        autoUnlock?: boolean;
    }
}