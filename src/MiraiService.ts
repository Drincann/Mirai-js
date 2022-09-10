import { MessageChain } from "./types"

type Versions = '2.6.0'

abstract class MiraiService {
    private static serviceSingleton: Map<Versions, MiraiService> = new Map

    public static create(version: Versions): MiraiService {
        if (this.serviceSingleton.has(version)) {
            return this.serviceSingleton.get(version) as MiraiService
        }
        let service: MiraiService
        switch (version) {
            case '2.6.0':
                service = new MiraiV2_6_0()
                break
            default:
                throw new Error('Unsupported version')
        }
        this.serviceSingleton.set(version, service)
        return service
    }
    public abstract init(): boolean

    public abstract sendFriendMessage(friendId: number, messageChain: MessageChain): Promise<void>
}

class MiraiV2_6_0 extends MiraiService {
    constructor() { super() }
    public init(): boolean {
        return true
    }
    public async sendFriendMessage(friendId: number, messageChain: MessageChain) {

    }
}

