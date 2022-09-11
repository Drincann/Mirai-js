import { MessageChain } from "../types"
import { WebSocketAdapter } from "../adaptors"
import { ServiceInterfaceDefMap, Versions } from "./apidef"
import { EventEmitter } from "events"

interface MiraiServiceConstructorParams {
    url: string
    verifyKey: string
    qq: number
    syncId?: number
    version?: Versions
}

export abstract class MiraiServiceFactory {
    constructor() { }
    public static create<Version extends keyof ServiceInterfaceDefMap = '2.6.0'>({
        url, verifyKey, qq, version = '2.6.0'
    }: MiraiServiceConstructorParams): ServiceInterfaceDefMap[Version] {
        return new MiraiService({ url, verifyKey, qq, version })
    }
}

/**
 * Events: [
 *   'mriaiEvent', // from underlaying adaptor(websocket)
 *   'error', // adaptor & websocket
 * ]
 */
class MiraiService extends EventEmitter {
    private adaptor: WebSocketAdapter
    private _version: Versions
    public get version() { return this._version }

    constructor({ url, verifyKey, qq, syncId = -1, version = '2.6.0' }: MiraiServiceConstructorParams) {
        super()
        const urlStructured = new URL(url)
        /**
         * 2022.09.10
         * @see https://github.com/project-mirai/mirai-api-http/blob/master/docs/adapter/WebsocketAdapter.md#%E8%AE%A4%E8%AF%81%E4%B8%8E%E4%BC%9A%E8%AF%9D
         * /message: 推送消息
         * /event: 推送事件
         * /all: 推送消息及事件
         */
        urlStructured.protocol = 'ws'
        urlStructured.pathname = '/all'
        urlStructured.searchParams.append('verifyKey', verifyKey)
        urlStructured.searchParams.append('qq', qq.toString())
        this.adaptor = new WebSocketAdapter(urlStructured.toString(), syncId)
        this._version = version;
        // expose adaptor events
        this.adaptor.on('miraiEvent', (...args) => this.emit('miraiEvent', ...args))
        this.adaptor.on('error', (...args) => this.emit('error', ...args))
    }

    public async verify(): Promise<void> { await this.adaptor.verify() }

    public async sendFriendMessage({ target, messageChain }: { target: number, messageChain: MessageChain }): Promise<any> {
        return (await this.adaptor.sendCommand({
            command: 'sendFriendMessage',
            content: { target, messageChain },
        }))?.data
    }

    public async sendGroupMessage({ target, messageChain }: { target: number, messageChain: MessageChain }): Promise<any> {
        return (await this.adaptor.sendCommand({
            command: 'sendGroupMessage',
            content: { target, messageChain },
        }))?.data
    }
}
