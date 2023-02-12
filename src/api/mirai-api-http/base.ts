import { EventEmitter } from "ws";
import { versions } from "..";

/**
 * mirai-api-http service interface base definition
 */
export interface __SERVICE_API_DEFINITION_BASE__ extends EventEmitter {
  readonly version: typeof versions[number];
}