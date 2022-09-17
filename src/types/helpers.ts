import { EventMap } from ".";

export function isFriendMessageEventOrGroupMessage(ctx: any): ctx is EventMap['FriendMessage'] | EventMap['GroupMessage'] {
    return ctx.type === 'FriendMessage' || ctx.type === 'GroupMessage'
}