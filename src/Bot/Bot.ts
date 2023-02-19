import { BotInterfaceDefMap, Versions } from "../api";
import { ServiceInterfaceDefMap } from '../api'
import { MiraiServiceFactory } from "../services"
import { MiraiEventMap, MessageChain } from "../types"
import { EventEmitter } from '../libs/event-emitter'
import { MiddlewareFunc, ProcessChain } from "../Middleware"

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
        if (!Bot.versions.has(version ?? '2.6.0')) throw new Error(`Unsupported version: ${version}`)
        return new BotImpl({ url, verifyKey, qq, syncId, version })
    }
}

/**
 * Events: [
 *   'error', // provided by Bot.onError: Bot & MiraiService & underlying websocket
 *   'FriendMessage', // from service(mirai-api-http impl)
 *    ... mirai events
 * ]
 */
export class BotImpl {
    private service: ServiceInterfaceDefMap[Versions]
    private _version: Versions
    private emitter: EventEmitter<{
        [event in keyof MiraiEventMap]: [MiraiEventMap[event]]
    } & { 'error': [Error] }> = new EventEmitter()
    public get version() { return this._version }

    constructor({ url, verifyKey, qq, syncId = -1, version = '2.6.0' }: { url: string, verifyKey: string, qq: number, syncId?: number, version?: Versions }) {
        this.service = MiraiServiceFactory.create({ url, verifyKey, qq, syncId, version })
        this._version = version
        this.startListen()
        this.getAbout().then(({ version }) => {
            const currVersions = this._version.split('.').slice(0, 2);
            if (version.split('.').slice(0, 2)
                .some((v, i) => v !== currVersions[i])) {
                console.warn(`[WARN] mirai-api-http version mismatch: ${this._version}(mirai-js) vs ${version}(mirai-api-http)`)
            }
        }, err => {
            console.error(`[ERROR] mirai-api-http version check failed: ${err}`)
        });
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
        this.service.on('error', err => this.emitter.emit('error', err))
    }

    public on<
        EventName extends 'error' | (keyof MiraiEventMap),
        EventMap extends Record<EventName, any> = { 'error': Error } & {
            [key in keyof MiraiEventMap]: MiraiEventMap[key]
        }
    >(
        event: EventName,
        listener?: MiddlewareFunc<EventMap[EventName]>
    ): ProcessChain<EventMap[EventName]> {
        const chain = new ProcessChain<EventMap[EventName]>(listener instanceof Function ? listener : undefined)
        this.emitter.on(event, ctx => chain.run(ctx as EventMap[EventName]))
        return chain
    }

    public async sendMessage({
        qq, group, message
    }: { qq?: number, group?: number, message: string | MessageChain }): Promise<number | undefined> {
        let messageChain: MessageChain = typeof message === 'string' ? [{ type: 'Plain', text: message }] : message;
        if (qq !== undefined) return (await this.service.sendFriendMessage({ target: qq, messageChain })).messageId;
        if (group !== undefined) return (await this.service.sendGroupMessage({ target: group, messageChain })).messageId;
        throw new Error('qq or group must be specified')
    }

    public async getAbout() {
        return (await this.service.getAbout()).data
    }
}
