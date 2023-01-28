// Message 通过实现 MessageChaingetable 与 Bot.sendMessage 通信
// 消息链元素类型和图片 id 类型
import { MessageChainGetable, MessageType, ImageId, FaceType, MessageId, ForwardNode, } from './BaseType';

// Bot.sendMessage 的 message 参数是一个 Message 类型的实例
// 方法内部通过 getMessageChainable 接口的 getMessageChain 方法拿到消息链
export class Message implements MessageChainGetable {
    private messageChain: MessageType[];

    // Plain
    addText(text: string): Message;
    addPlain(text: string): Message;

    // At
    addAt(target: number): Message;
    addAtAll(): Message;

    // Image
    addImageId(imageId: ImageId): Message;
    addImageUrl(url: string): Message;
    addImagePath(path: string): Message;
    addImageBase64(base64: string): Message;

    // FlashImage
    addFlashImageId(imageId: ImageId): Message;
    addFlashImageUrl(url: string): Message;
    addFlashImagePath(path: string): Message;
    addFlashImageBase64(base64: string): Message;

    // Voice
    addVoiceId(imageId: ImageId): Message;
    addVoiceUrl(url: string): Message;
    addVoicePath(path: string): Message;

    // xml
    addXml(xml: string): Message;

    // json
    addJson(json: string): Message;

    // app
    addApp(content: string): Message;

    // face
    addFace(name: FaceType): Message;

    // implements MessageChainGetable
    getMessageChain(): MessageType[];

    // factory
    static createForwardMessage(): ForwardMessage;
}

export class ForwardMessage implements MessageChainGetable {
    constructor(nodeList: ForwardNode[]);
    private messageChain: MessageType[];

    addForwardNode({
        senderId,
        time,
        senderName,
        messageChain
    }: ForwardNode): this;
    addForwardNode(messageId: MessageId): this;

    // implements MessageChainGetable
    getMessageChain(): MessageType[];
}
