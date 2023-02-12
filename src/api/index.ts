import { __BOT_API_DEFINITION_2_6_0__ } from "./bot";
import { __SERVICE_API_DEFINITION_2_6_0__ } from "./mirai-api-http";

export const versions = ['2.6.0',] as const
export type Versions = typeof versions[number]

export interface ServiceInterfaceDefMap {
  ['2.6.0']: __SERVICE_API_DEFINITION_2_6_0__,
}

export function isServiceV2_6_0(service: ServiceInterfaceDefMap[Versions]): service is ServiceInterfaceDefMap['2.6.0'] {
  return service.version === '2.6.0'
}

export interface BotInterfaceDefMap {
  ['2.6.0']: __BOT_API_DEFINITION_2_6_0__,
}

export function isBotV2_6_0(bot: BotInterfaceDefMap[Versions]): bot is BotInterfaceDefMap['2.6.0'] {
  return bot.version === '2.6.0'
}