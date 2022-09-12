import { EventMap } from ".";

export function isFriendMessageEventOrGroupMessage(ctx: any): ctx is EventMap['FriendMessage'] | { [key: string]: any } {
    return ctx.type === 'FriendMessage' || ctx.type === 'GroupMessage'
}