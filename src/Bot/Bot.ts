import { BotInterfaceDefMap, Versions, __BOT_API_DEFINITION__ } from "./apidef";
import { MiraiServiceFactory, ServiceInterfaceDefMap } from '../services'
import { EventMap, MessageChain } from "../types"
import { EventEmitter } from 'events'
import { Middleware } from "../Middleware"

export class Bot /* Factory */ {
    /**
     * 泛型 Version 用来约束开发时的类型
     * 传入的 opts.version 用来约束运行时的行为, 兼容接口
     * 
     * 为什么不使用构造器: 
     * - 构造器无法影响返回实例的泛型参数, 
     * - 使用构造器的泛型时, 无法传入在运行时使用的版本参数.
     */
    private static versions: Set<keyof BotInterfaceDefMap> = new Set(['2.6.0'])
    public static create<Version extends keyof BotInterfaceDefMap = '2.6.0'>({
        url, verifyKey, qq, syncId = -1, version
    }: {
        url: string
        verifyKey: string
        qq: number
        syncId?: number
        version?: Version
    }): BotInterfaceDefMap[Version] {
        /**
         * FIXME: 指定 version 默认参数时, 该参数会被 ts 
         * 解释为 Versions 的 subtype, 同一个 type的不同
         * subtype 不相容 ts(2322)
         */
        version = (version ?? '2.6.0') as Version
        if (!Bot.versions.has(version)) throw new Error(`Unsupported version: ${version}`)
        return new BotImpl({ url, verifyKey, qq, syncId, version })
    }
}

/**
 * Events: [
 *   'error', // Bot & MiraiService & underlying websocket
 *   'FriendMessage', // from service(mirai-api-http impl)
 *    ... mirai events
 * ]
 */
export class BotImpl {
    private service: ServiceInterfaceDefMap[Versions]
    private _version: Versions
    private emitter: EventEmitter = new EventEmitter()
    public get version() { return this._version }

    constructor({ url, verifyKey, qq, syncId = -1, version = '2.6.0' }: { url: string, verifyKey: string, qq: number, syncId?: number, version?: Versions }) {
        this.service = MiraiServiceFactory.create({ url, verifyKey, qq, syncId, version })
        this._version = version
        this.startListen()
    }

    private async startListen() {
        /**
         * 2022-09-11
         * @see https://github.com/project-mirai/mirai-api-http/blob/master/docs/api/MessageType.md
         * @see https://github.com/project-mirai/mirai-api-http/blob/master/docs/api/EventType.md
         * interface GenericEvent {
         *   syncId: number, // default to -1
         *   data: {
         *     type: string,
         *     ...any
         *   }
         * }
         */
        this.service.on('miraiEvent', data => this.emitter.emit(data?.data?.type, data?.data))
    }

    public on<EventName extends keyof EventMap>(
        event: EventName,
        listener: ((ctx?: EventMap[EventName]) => Promise<any> | any) | Middleware<EventName>
    ): this {
        if (listener instanceof Middleware) {
            listener = listener.getEntry();
        }
        this.emitter.on(event, listener)
        return this
    }

    public async sendMessage({
        qq, group, message
    }: { qq?: number, group?: number, message: string | MessageChain }): Promise<number | undefined> {
        let messageChain: MessageChain = typeof message === 'string' ? [{ type: 'Plain', text: message }] : message;
        if (qq !== undefined) return (await this.service.sendFriendMessage({ target: qq, messageChain })).messageId;
        if (group !== undefined) return (await this.service.sendGroupMessage({ target: group, messageChain })).messageId;
        throw new Error('qq or group must be specified')
    }
}
