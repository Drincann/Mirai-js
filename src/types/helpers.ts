import { MiraiEventMap } from ".";
import { Merge } from "./typeHelpers";

export function isFriendMessageEventOrGroupMessage<T>(ctx: T): ctx is Merge<T & (MiraiEventMap['FriendMessage'] | MiraiEventMap['GroupMessage'])> {
    return (ctx as any).type === 'FriendMessage' || (ctx as any).type === 'GroupMessage'
}

export function textPropContext<T>(ctx: T): ctx is Merge<T & { text: string }> {
    return true;
}