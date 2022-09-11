import { __2_6_0_SERVICE_API_DEFINITION__ } from "./_2_6_0_"
import WebSocket from "ws"
import { EventEmitter } from "events"

export interface ServiceInterfaceDefMap {
    ['2.6.0']: __2_6_0_SERVICE_API_DEFINITION__,
}

export type Versions = keyof ServiceInterfaceDefMap

export function isServiceV2_6_0(service: ServiceInterfaceDefMap[Versions]): service is ServiceInterfaceDefMap['2.6.0'] {
    return service.version === '2.6.0'
}

export interface __SERVICE_API_DEFINITION__ extends EventEmitter {
    version: Versions
    on(event: 'error' | 'miraiEvent', listener: (...args: any) => void): this;
}
