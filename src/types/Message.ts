/* Message */
type MessageTypes = 'Plain' | 'Text'
interface MessageItem { type: MessageTypes, [key: string]: any }
export type MessageChain = Array<MessageItem>

/* Event */
type Permissions = 'MEMBER' | 'ADMINISTRATOR' | 'OWNER'

export interface MiraiEventMap {
    'FriendMessage': FriendMessageEvent
    'GroupMessage': GroupMessageEvent
    'FriendInputStatusChangedEvent': FriendInputStatusChangedEvent
}

export interface MiraiEvent {
    type: keyof MiraiEventMap
}

/**
 * 好友消息
 */
export interface FriendMessageEvent extends MiraiEvent {
    type: 'FriendMessage'
    sender: {
        id: number
        nickname: string
        remark: string
    }
    messageChain: MessageChain
}

/**
 * 群消息
 */
export interface GroupMessageEvent extends MiraiEvent {
    type: 'GroupMessage'
    sender: {
        id: number
        memberName: string
        specialTitle: string
        permission: Permissions
        joinTimestamp: number
        lastSpeakTimestamp: number
        muteTimeRemaining: number
        group: {
            id: number
            name: string
        }
    }
    messageChain: MessageChain
}

/**
 * 好友输入状态改变
 */
export interface FriendInputStatusChangedEvent extends MiraiEvent {
    type: 'FriendInputStatusChangedEvent'
    friend: {
        id: number
        nickname: string
        remark: string
    },
    inputting: boolean
}