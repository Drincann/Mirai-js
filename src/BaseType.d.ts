import { Bot } from "./Bot";

/**
 * 消息链的元素，是 mirai-api-http 接口需要的原始类型
 * 有多种消息类型实现了该接口，已经全部列出
 *
 * @see https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md
 */
interface MessageType {
    type: MessageChainElementTypes;

    // Quote
    id?: number;
    groupId?: number;
    senderId?: number;
    targetId?: number;
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

    // Forward
    nodeList?: ForwardNode[];
}

// 用于 Bot 获得消息链，Message 使用了该扩展
interface MessageChainGetable {
    getMessageChain(): MessageType[];
}

/**
 * @description 合并转发类型Forward内消息节点的类型定义
 */
interface ForwardNode {
    senderId?: number;
    time?: number;
    senderName?: string;
    messageChain?: MessageType[] | MessageChainGetable;
    messageId?: MessageId;
}

/**
 * @description Bot 实现的接口，其他类访问 bot.config
 * 的途径，避免其他类直接访问实现，用来解耦
 */
interface BotConfigGetable {
    getBaseUrl(): string;
    getQQ(): number;
    getVerifyKey(): string;
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

type MessageChainElementTypes =
    | "Source"
    | "Quote"
    | "At"
    | "AtAll"
    | "Face"
    | "Plain"
    | "Image"
    | "FlashImage"
    | "Voice"
    | "Xml"
    | "Json"
    | "App"
    | "Poke"
    | "Dice"
    | "MarketFace"
    | "MusicShare"
    | "ForwardMessage"
    | "File"
    | "MiraiCode";

interface EventBaseType {
    bot: Bot;
}

// Middleware
interface MessageExtendType {
    text?: string;
    classified?: {
        [key in MessageChainElementTypes]?: any[];
    };
    messageId?: number;
    waitFor?: any
    unlock?: () => void;
}
type RequestEventMethods =
    | "agree"
    | "refuse"
    | "ignore"
    | "refuseAndAddBlacklist"
    | "ignoreAndAddBlacklist";

type RequestEventExtendType = {
    [key in RequestEventMethods]?: () => void;
};

interface Member {
    id: number;
    memberName: string;
    specialTitle: string;
    permission: GroupPermission;
    joinTimestamp: number;
    lastSpeakTimestamp: number;
    muteTimeRemaining: number;
}

interface GroupSenderType {
    id: number;
    name: string;
    permission: GroupPermission;
}

interface Friend {
    id: number,
    nickname: string,
    remark: string;
}

interface EventTypes {
    error: {
        code: number;
    } & EventBaseType,
    close: {
        reason: string;
    } & EventBaseType,
    "unexpected-response": {
        reason: string;
    } & EventBaseType,
    GroupMessage: {
        type: "GroupMessage";
        sender: Member & {group: GroupSenderType},
        messageChain: MessageType[];
    } & EventBaseType &
        MessageExtendType,
    FriendMessage: {
        type: "FriendMessage"; 
        messageChain: MessageType[];
        sender: Friend
    } & EventBaseType &
        MessageExtendType,
    BotOnlineEvent: {
        type: "BotOnlineEvent",
        qq: number
    } & EventBaseType,
    BotOfflineEventActive: {
        type: "BotOfflineEventActive",
        qq: number
    } & EventBaseType,
    BotOfflineEventForce: {
        type: "BotOfflineEventForce",
        qq: number
    } & EventBaseType,
    BotOfflineEventDropped: {
        type: "BotOfflineEventDropped",
        qq: number
    } & EventBaseType,
    BotReloginEvent: {
        type: "BotReloginEvent",
        qq: number
    } & EventBaseType,
    BotGroupPermissionChangeEvent: {
        type: "BotGroupPermissionChangeEvent";
        origin: Exclude<GroupPermission, "OWNER">;
        current: GroupPermission;
        group: GroupSenderType;
    } & EventBaseType,
    BotMuteEvent: {
        type: "BotMuteEvent",
        durationSeconds: number,
        operator: Member & {group: GroupSenderType};
    } & EventBaseType,
    BotUnmuteEvent: {
        type: "BotUnmuteEvent",
        durationSeconds: number,
        operator: Member & {group: GroupSenderType};
    } & EventBaseType,
    BotJoinGroupEvent: {
        type: "BotJoinGroupEvent",
        group: GroupSenderType
        operator?: null | Member & {group: GroupSenderType};
    } ;
    BotLeaveEventActive: {
        type: "BotLeaveEventActive",
        group: GroupSenderType
    };
    BotLeaveEventKick: {
        type: "BotLeaveEventKick",
        group: GroupSenderType
        operator: Member & {group: GroupSenderType};
    } & EventBaseType;
    GroupRecallEvent: {
        type: "GroupRecallEvent"
        authorId: number,
        messageId: number,
        time: number,
        group: GroupSenderType
        operator: Member & {group: GroupSenderType};
    } & EventBaseType;
    FriendRecallEvent: {
        type: "GroupRecallEvent"
        authorId: number,
        messageId: number,
        time: number,
        operator: number
    } & EventBaseType;
    GroupNameChangeEvent: {
        type: "GroupNameChangeEvent",
        origin: string,
        current: string,
        group: GroupSenderType;
        operator: Member & {group: GroupSenderType};
    } & EventBaseType;
    GroupEntranceAnnouncementChangeEvent: {
        type: "GroupEntranceAnnouncementChangeEvent",
        origin: string,
        current: string,
        group: GroupSenderType;
        operator: Member & {group: GroupSenderType};
    } & EventBaseType;
    GroupMuteAllEvent: {
        type: "GroupMuteAllEvent",
        origin: boolean,
        current: boolean,
        group: GroupSenderType;
        operator: Member & {group: GroupSenderType};
    } & EventBaseType;
    GroupAllowAnonymousChatEvent: {
        type: "GroupAllowAnonymousChatEvent",
        origin: boolean,
        current: boolean,
        group: GroupSenderType,
        operator: Member & {group: GroupSenderType};
    } & EventBaseType;
    GroupAllowConfessTalkEvent: {
        type: "GroupAllowAnonymousChatEvent",
        origin: boolean,
        current: boolean,
        group: GroupSenderType,
        isByBot: boolean
    } & EventBaseType;
    GroupAllowMemberInviteEvent: EventBaseType;
    MemberJoinEvent: {
        type: "MemberJoinEvent",
        member: Member & {group: GroupSenderType},
        invitor: Member;
    } & EventBaseType;
    MemberLeaveEventKick: {
        type: "MemberLeaveEventKick",
        member: Member & {group: GroupSenderType},
        operator: Member & {group: GroupSenderType},
    } & EventBaseType;
    MemberLeaveEventQuit: {
        type: "MemberLeaveEventQuit",
        member: Member & {group: GroupSenderType},
    } & EventBaseType;
    MemberCardChangeEvent: {
        type: "MemberCardChangeEvent",
        origin: string,
        current: string,
        member: Member & {group: GroupSenderType};
    } & EventBaseType;
    MemberSpecialTitleChangeEvent: {
        type: "MemberSpecialTitleChangeEvent",
        origin: string,
        current: string,
        member: Member & {group: GroupSenderType};
    } & EventBaseType;
    MemberPermissionChangeEvent: {
        type: "MemberPermissionChangeEvent",
        origin: string,
        current: string,
        member: Member & {group: GroupSenderType};
    } & EventBaseType;
    MemberMuteEvent: {
        type: "MemberMuteEvent",
        durationSeconds: number,
        member: Member & {group: GroupSenderType};
        operator: Member & {group: GroupSenderType};
    } & EventBaseType;
    MemberUnmuteEvent: {
        type: "MemberUnmuteEvent",
        member: Member & {group: GroupSenderType};
        operator: Member & {group: GroupSenderType};
    } & EventBaseType;
    MemberHonorChangeEvent: {
        type: "MemberHonorChangeEvent",
        member: Member & {group: GroupSenderType}
        action: "achieve" | "lose",
        honor: string;
    }
    NewFriendRequestEvent: {
        type: "NewFriendRequestEvent",
        eventId: number,
        fromId: number,
        groupId: number,
        nick: string,
        message: string
    } & RequestEventExtendType & EventBaseType;
    MemberJoinRequestEvent: {
        type: "MemberJoinRequestEvent",
        eventId: number,
        fromId: number,
        groupId: number,
        groupName: string,
        nick: string,
        message: string
    } & RequestEventExtendType & EventBaseType;
    BotInvitedJoinGroupRequestEvent: {
        type: "MemberJoinRequestEvent",
        eventId: number,
        fromId: number,
        groupId: number,
        groupName: string,
        nick: string,
        message: string
    } & RequestEventExtendType & EventBaseType;
}

type EventType = keyof EventTypes;

type Awaitable<T> = T | PromiseLike<T>;

// 群成员权限
type GroupPermission = "OWNER" | "ADMINISTRATOR" | "MEMBER";

// 性别
type SEX = "UNKNOWN" | "MALE" | "FEMALE";

// QQ 自带表情
type FaceType =
| '惊讶' | '撇嘴' | '色' | '发呆' | '得意'
| '流泪' | '害羞' | '闭嘴' | '睡' | '大哭'
| '尴尬' | '发怒' | '调皮' | '呲牙' | '微笑'
| '难过' | '酷' | '抓狂' | '吐' | '偷笑'
| '可爱' | '白眼' | '傲慢' | '饥饿' | '困'
| '惊恐' | '流汗' | '憨笑' | '悠闲' | '奋斗'
| '咒骂' | '疑问' | '嘘' | '晕' | '折磨'
| '衰' | '骷髅' | '敲打' | '再见' | '发抖'
| '爱情' | '跳跳' | '猪头' | '拥抱' | '蛋糕'
| '闪电' | '炸弹' | '刀' | '足球' | '便便'
| '咖啡' | '饭' | '玫瑰' | '凋谢' | '爱心'
| '心碎' | '礼物' | '太阳' | '月亮' | '赞'
| '踩' | '握手' | '胜利' | '飞吻' | '怄火'
| '西瓜' | '冷汗' | '擦汗' | '抠鼻' | '鼓掌'
| '糗大了' | '坏笑' | '左哼哼' | '右哼哼' | '哈欠'
| '鄙视' | '委屈' | '快哭了' | '阴险' | '左亲亲'
| '吓' | '可怜' | '菜刀' | '啤酒' | '篮球'
| '乒乓' | '示爱' | '瓢虫' | '抱拳' | '勾引'
| '拳头' | '差劲' | '爱你' | '不' | '好'
| '转圈' | '磕头' | '回头' | '跳绳' | '挥手'
| '激动' | '街舞' | '献吻' | '左太极' | '右太极'
| '双喜' | '鞭炮' | '灯笼' | 'K歌' | '喝彩'
| '祈祷' | '爆筋' | '棒棒糖' | '喝奶' | '飞机'
| '钞票' | '药' | '手枪' | '茶' | '眨眼睛'
| '泪奔' | '无奈' | '卖萌' | '小纠结' | '喷血'
| '斜眼笑' | 'doge' | '惊喜' | '骚扰' | '笑哭'
| '我最美' | '河蟹' | '羊驼' | '幽灵' | '蛋'
| '菊花' | '红包' | '大笑' | '不开心' | '冷漠'
| '呃' | '好棒' | '拜托' | '点赞' | '无聊'
| '托脸' | '吃' | '送花' | '害怕' | '花痴'
| '小样儿' | '飙泪' | '我不看' | '托腮' | '啵啵'
| '糊脸' | '拍头' | '扯一扯' | '舔一舔' | '蹭一蹭'
| '拽炸天' | '顶呱呱' | '抱抱' | '暴击' | '开枪'
| '撩一撩' | '拍桌' | '拍手' | '恭喜' | '干杯'
| '嘲讽' | '哼' | '佛系' | '掐一掐' | '惊呆'
| '颤抖' | '啃头' | '偷看' | '扇脸' | '原谅'
| '喷脸' | '生日快乐' | '头撞击' | '甩头' | '扔狗'
| '加油必胜' | '加油抱抱' | '口罩护体' | '搬砖中' | '忙到飞起'
| '脑阔疼' | '沧桑' | '捂脸' | '辣眼睛' | '哦哟'
| '头秃' | '问号脸' | '暗中观察' | 'emm' | '吃瓜'
| '呵呵哒' | '我酸了' | '太南了' | '辣椒酱' | '汪汪'
| '汗' | '打脸' | '击掌' | '无眼笑' | '敬礼'
| '狂笑' | '面无表情' | '摸鱼' | '魔鬼笑' | '哦'
| '请' | '睁眼' | '敲开心' | '震惊' | '让我康康'
| '摸锦鲤' | '期待' | '拿到红包' | '真好' | '拜谢'
| '元宝' | '牛啊' | '胖三斤' | '好闪' | '左拜年'
| '右拜年' | '红包包' | '右亲亲' | '牛气冲天' | '喵喵'
| '求红包' | '谢红包' | '新年烟花' | '打call' | '变形'
| '嗑到了' | '仔细分析' | '加油' | '我没事' | '菜狗'
| '崇拜' | '比心' | '庆祝' | '老色痞' | '拒绝'
| '嫌弃' | '吃糖';

// 消息处理器类型
export {
    // 接口
    MessageChainGetable, BotConfigGetable,
    // 消息类型
    MessageType,
    // MessageType.nodeList 的元素类型
    ForwardNode,
    // 图片 id  语音 id  消息 id
    ImageId,    VoiceId, MessageId,
    // 事件类型            群成员权限        性别
    EventType, EventTypes, GroupPermission, SEX,
    // QQ 自带表情
    FaceType,
    Awaitable
};
