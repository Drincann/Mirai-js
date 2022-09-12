import { EventEmitter } from "stream"
import { Middleware } from "../../Middleware"
import { EventMap } from "../../types"
import { BotImpl } from "../Bot"
import { __2_6_0_BOT_API_DEFINITION__ } from "./_2_6_0_"

export interface BotInterfaceDefMap {
    ['2.6.0']: __2_6_0_BOT_API_DEFINITION__,
}

export type Versions = keyof BotInterfaceDefMap

export function isBotV2_6_0(bot: BotInterfaceDefMap[Versions]): bot is BotInterfaceDefMap['2.6.0'] {
    return bot.version === '2.6.0'
}

export interface __BOT_API_DEFINITION__ {
    version: Versions
    on: InstanceType<typeof BotImpl>['on']
}