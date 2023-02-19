import { EventEmitter } from "../../libs/event-emitter";
import { versions } from "..";
import { MiraiWebSocketResponse } from "../../types";

/**
 * mirai-api-http service interface base definition
 */
export interface __SERVICE_API_DEFINITION_BASE__ extends EventEmitter<{
  'miraiEvent': [MiraiWebSocketResponse]
  'error': [Error]
}> {
  readonly version: typeof versions[number];
}