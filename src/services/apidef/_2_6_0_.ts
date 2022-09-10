import { MessageChain } from "../../types"
import { __SERVICE_API_DEFINITION__ } from "./versions"


interface SendMessageParams {
    target: number
    messageChain: MessageChain
}

interface SendMessageReturnValue {
    code: number
    msg: string
    messageId: number
}

export interface __2_6_0_SERVICE_API_DEFINITION__ extends __SERVICE_API_DEFINITION__ {
    verify: () => Promise<void>
    sendFriendMessage: (opts: SendMessageParams) => Promise<SendMessageReturnValue>
    sendGroupMessage: (opts: SendMessageParams) => Promise<SendMessageReturnValue>
}
