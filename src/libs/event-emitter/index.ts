type EventsMap = { [_: PropertyKey]: [] | any[] }
export class EventEmitter<EventDefinition extends EventsMap> {
  private events: {
    [eventName in keyof EventDefinition]?: {
      [hash: number]: (...args: [...EventDefinition[eventName]]) => unknown
    }
  } = {}

  private listenerToHash: Map<Function, number> = new Map()
  private hashToListener: Map<number, Function> = new Map()

  private nextHash = Number.MIN_SAFE_INTEGER

  on<EventName extends keyof EventDefinition>(eventName: EventName, listener: (...args: [...EventDefinition[EventName]]) => unknown): number {
    (this.events[eventName] = this.events[eventName] ?? {})[++this.nextHash] = listener
    this.listenerToHash.set(listener, this.nextHash)
    this.hashToListener.set(this.nextHash, listener)
    return this.nextHash
  }

  emit<EventName extends keyof EventDefinition>(eventName: EventName, ...args: [...EventDefinition[EventName]]) {
    Object.values(this.events[eventName] ?? {}).forEach(listener => listener?.(...args))
  }

  off<EventName extends keyof EventDefinition>(eventName: EventName, listenerOrHash: number | ((...args: [...EventDefinition[EventName]]) => unknown)) {
    let listener: Function = listenerOrHash as Function, hash: number = listenerOrHash as number
    if (typeof listenerOrHash === 'number') listener = this.hashToListener.get(listenerOrHash)!
    else hash = this.listenerToHash.get(listenerOrHash)!
    delete this.events[eventName]?.[hash]
    this.listenerToHash.delete(listener)
    this.hashToListener.delete(hash)
  }
}
