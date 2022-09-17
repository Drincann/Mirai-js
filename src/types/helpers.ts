import { EventMap } from ".";

export function isFriendMessageEventOrGroupMessage<T>(ctx: T): ctx is T & (EventMap['FriendMessage'] | EventMap['GroupMessage']) {
    return (ctx as any).type === 'FriendMessage' || (ctx as any).type === 'GroupMessage'
}

export function textPropContext<T>(ctx: T): ctx is T & { text: string } {
    return true;
}