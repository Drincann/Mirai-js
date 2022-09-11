import { BotInterfaceDefMap, Versions, __BOT_API_DEFINITION__ } from "./apidef";
import { ServiceInterfaceDefMap } from '../services'
import { MiraiServiceFactory } from "../services";
import { MessageChain } from "../types";


export class Bot /* Factory */ {
    /**
     * 泛型 Version 用来约束开发时的类型
     * 传入的 opts.version 用来约束运行时的行为, 兼容接口
     * 
     * 为什么不使用构造器: 
     * - 构造器无法影响返回实例的泛型参数, 
     * - 使用构造器的泛型时, 无法传入在运行时使用的版本参数.
     */
    public static create<Version extends keyof BotInterfaceDefMap = '2.6.0'>({
        url, verifyKey, qq, version
    }: {
        url: string
        verifyKey: string
        qq: number
        version: Version
    }): BotInterfaceDefMap[Version] {
        return new BotImpl({ url, verifyKey, qq, version })
    }
}

export class BotImpl {
    private service: ServiceInterfaceDefMap[Versions]
    private _version: Versions
    public get version() { return this._version }

    constructor({ url, verifyKey, qq, version = '2.6.0' }: { url: string, verifyKey: string, qq: number, version?: Versions }) {
        this.service = MiraiServiceFactory.create({ url, verifyKey, qq, version })
        this._version = version
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
