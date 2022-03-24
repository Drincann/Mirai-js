import { ForwardNodeGetable, ForwardNodeType, MessageId } from './BaseType';

// Bot.sendForward 的 nodeList 参数是一个 ForwardNode 类型的实例
// 方法内部通过 ForwardNodeType 接口的 getForwardNode 方法拿到消息链
export class ForwardNode implements ForwardNodeGetable {
    private nodeList: ForwardNodeType[];

    // 自行添加一个消息节点
    addForwardNode(nodeList: ForwardNodeType): ForwardNode;
    // 使用 MessageId 添加一个消息节点
    addForwardNodeById(ID: MessageId): ForwardNode;

    // implements ForwardNodeGetable
    getForwardNode(): ForwardNodeType[];
}