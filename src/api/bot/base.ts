import { versions } from "..";
import { BotImpl } from "../../Bot/Bot";

/**
 * mirai-js bot interface base definition
 */
export interface __BOT_API_DEFINITION_BASE__ {
  readonly version: typeof versions[number];
  on: InstanceType<typeof BotImpl>["on"];
}
