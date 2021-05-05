// Message 通过实现 MessageChaingetable 与 Bot.sendMessage 通信
// 消息链元素类型和图片 id 类型
import { MessageChainGetable, MessageType, ImageId } from './BaseType';

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

    // FlashImage
    addFlashImageId(imageId: ImageId): Message;
    addFlashImageUrl(url: string): Message;
    addFlashImagePath(path: string): Message;

    // Voice
    addVoiceId(imageId: ImageId): Message;
    addVoiceUrl(url: string): Message;
    addVoicePath(path: string): Message;

    // xml
    addXml(xml: string): Message;

    // json
    addJson(json: string): Message;

    // aoo
    addApp(content: string): Message;

    // implements MessageChainGetable
    getMessageChain(): MessageType[];
}
