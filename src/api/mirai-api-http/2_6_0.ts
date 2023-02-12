import { MessageChain } from "../../types";
import { __SERVICE_API_DEFINITION_BASE__ } from "./base";

interface SendMessageParams {
  target: number
  messageChain: MessageChain
}

interface SendMessageReturnValue {
  code: number
  msg: string
  messageId: number
}

interface GetAboutReturnValue {
  code: number
  msg: string
  data: { version: string }
}

export interface __SERVICE_API_DEFINITION_2_6_0__ extends __SERVICE_API_DEFINITION_BASE__ { 
  verify: () => Promise<void>
  sendFriendMessage: (opts: SendMessageParams) => Promise<SendMessageReturnValue>
  sendGroupMessage: (opts: SendMessageParams) => Promise<SendMessageReturnValue>
  getAbout: () => Promise<GetAboutReturnValue>
}
