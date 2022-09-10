import { MessageChain } from "../../types";
import { __BOT_API_DEFINITION__ } from "./versions"


interface SendMessageParams {
    qq?: number
    group?: number
    message: MessageChain | string
}

type SendMessageReturnValue = number /* messageId */ | undefined;

export interface __2_6_0_BOT_API_DEFINITION__ extends __BOT_API_DEFINITION__ {
    sendMessage(opts: SendMessageParams): Promise<SendMessageReturnValue>
}
