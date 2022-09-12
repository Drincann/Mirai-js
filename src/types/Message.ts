/* Message */
type MessageTypes = 'Plain' | 'Text'
interface MessageItem { type: MessageTypes, [key: string]: any }
export type MessageChain = Array<MessageItem>

/* Event */
type Permissions = 'MEMBER' | 'ADMINISTRATOR' | 'OWNER'

export interface EventMap {
    'FriendMessage': FriendMessageEvent
    'GroupMessage': GroupMessageEvent
}

export interface Event {
    type: keyof EventMap
}

export interface FriendMessageEvent extends Event {
    type: 'FriendMessage'
    sender: {
        id: number
        nickname: string
        remark: string
    }
    messageChain: MessageChain
}

export interface GroupMessageEvent extends Event {
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