type EventsMap = { [_: PropertyKey]: [] }
export class EventEmitter<EventDefinition extends EventsMap> {
  private events: { [eventName in keyof EventDefinition]?: ((...args: [...EventDefinition[eventName]]) => unknown)[] } = {}

  on<EventName extends keyof EventDefinition>(eventName: EventName, listener: (...args: [...EventDefinition[EventName]]) => unknown) {
    (this.events[eventName] = this.events[eventName] ?? []).push(listener)
  }

  emit<EventName extends keyof EventDefinition>(eventName: EventName, ...args: [...EventDefinition[EventName]]) {
    this.events[eventName]?.forEach(listener => listener(...args))
  }

  off<EventName extends keyof EventDefinition>(eventName: EventName, listener: (...args: [...EventDefinition[EventName]]) => unknown) {
    this.events[eventName] = this.events[eventName]?.filter(l => l !== listener)
  }
}
