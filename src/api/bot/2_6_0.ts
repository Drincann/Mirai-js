import { MessageChain } from "../../types";
import { __BOT_API_DEFINITION_BASE__ } from "./base";

interface SendMessageParams {
  qq?: number
  group?: number
  message: MessageChain | string
}

type SendMessageReturnValue = number /* messageId */ | undefined;

type getAboutReturnValue = { version: string };

export interface __BOT_API_DEFINITION_2_6_0__ extends __BOT_API_DEFINITION_BASE__ {
  sendMessage(opts: SendMessageParams): Promise<SendMessageReturnValue>
  getAbout(): Promise<getAboutReturnValue>
}
