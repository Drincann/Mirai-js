/**
 * 消息链的元素，是 mirai-api-http 接口需要的原始类型
 * 有多种消息类型实现了该接口，已经全部列出
 * 
 * @see https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md
 */
interface MessageType {
    type: string;

    // Quote
    id?: number,
    groupId?: number,
    senderId?: number,
    targetId?: number,
    origin?: MessageType[];

    // At
    target?: number;
    display?: string;

    // Face Poke
    faceId?: number;
    name?: string;

    // Plain
    text?: string;

    // Image FlashImage Voice
    imageId?: ImageId;
    voiceId?: VoiceId;
    url?: string;
    path?: string;

    // Xml
    xml?: string;

    // Json
    json?: string;

    // App
    content?: string;

}

// 用于 Bot 获得消息链，Message 使用了该扩展
interface MessageChainGetable {
    getMessageChain(): MessageType[];
}

/**
 * @description Bot 实现的接口，其他类访问 bot.config
 * 的途径，避免其他类直接访问实现，用来解耦
 */
interface BotConfigGetable {
    getBaseUrl(): string;
    getQQ(): number;
    getAuthKey(): string;
    getSessionKey(): string;
}


// 图片 id
type ImageId = string;
// 语音 id
type VoiceId = string;
// 消息 id
type MessageId = number;

/**
 * 消息类型
 * 
 * @see https://github.com/project-mirai/mirai-api-http/blob/master/docs/EventType.md
 */
type EventType =
    // WebSocket 事件
    | 'error' | 'close' | 'unexpected-response'
    // mirai 事件
    | 'GroupMessage' | 'FriendMessage'
    | 'BotOnlineEvent' | 'BotOfflineEventActive'
    | 'BotOfflineEventForce' | 'BotOfflineEventDropped'
    | 'BotReloginEvent' | 'BotGroupPermissionChangeEvent'
    | 'BotMuteEvent' | 'BotUnmuteEvent'
    | 'BotJoinGroupEvent' | 'BotLeaveEventActive'
    | 'BotLeaveEventKick' | 'GroupRecallEvent'
    | 'FriendRecallEvent' | 'GroupNameChangeEvent'
    | 'GroupEntranceAnnouncementChangeEvent' | 'GroupMuteAllEvent'
    | 'GroupAllowAnonymousChatEvent' | 'GroupAllowConfessTalkEvent'
    | 'GroupAllowMemberInviteEvent' | 'MemberJoinEvent'
    | 'MemberLeaveEventKick' | 'MemberLeaveEventQuit'
    | 'MemberCardChangeEvent' | 'MemberSpecialTitleChangeEvent'
    | 'MemberPermissionChangeEvent' | 'MemberMuteEvent'
    | 'MemberUnmuteEvent' | 'NewFriendRequestEvent'
    | 'MemberJoinRequestEvent' | 'BotInvitedJoinGroupRequestEvent';

// 群成员权限
type GroupPermission =
    | 'OWNER'
    | 'ADMINISTRATOR'
    | 'MEMBER';

// 消息处理器
type Processor = (data: any) => Promise<any> | any;

// 消息处理器类型
export {
    // 接口
    MessageChainGetable, BotConfigGetable,

    // 消息类型
    MessageType,

    // 图片 id  语音 id  消息 id
    ImageId, VoiceId, MessageId,

    // 事件类型    群成员权限
    EventType, GroupPermission,

    // 消息处理器
    Processor,
};