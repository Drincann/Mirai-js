type Permissions = 'MEMBER' | 'ADMINISTRATOR' | 'OWNER'

type MessageTypes = 'FriendMessage' | 'GroupMessage'

interface MessageItem { type: MessageTypes; }

export type MessageChain = Array<MessageItem>

export interface FriendMessage extends MessageItem {
    type: 'FriendMessage';
    sender: {
        id: number;
        nickname: string;
        remark: string;
    };
    messageChain: MessageChain;
}

export interface GroupMessage extends MessageItem {
    type: 'GroupMessage';
    sender: {
        id: number;
        memberName: string;
        specialTitle: string;
        permission: Permissions;
        joinTimestamp: number;
        lastSpeakTimestamp: number;
        muteTimeRemaining: number;
        group: {
            id: number;
            name: string;
        };
    };
    messageChain: MessageChain;
}