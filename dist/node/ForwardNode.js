"use strict";

// 用于与 Bot.sendForward 耦合的接口
const {
  ForwardNodeGetable,
  MessageChainGetable
} = require('./interface');

class ForwardNode_Data {
  constructor({
    senderId,
    time,
    senderName,
    messageChain
  }) {
    this.senderId = senderId;
    this.time = time;
    this.senderName = senderName;
    this.messageChain = messageChain;
  }

}

class ForwardNode_Id {
  constructor({
    messageId
  }) {
    this.messageId = messageId;
  }

}
/**
 * @description 本框架抽象的消息节点
 */


class ForwardNode extends ForwardNodeGetable {
  constructor() {
    super();
    this.nodeList = [];
  } // 手动添加节点


  addForwardNode(nodeList) {
    if (nodeList.messageChain instanceof MessageChainGetable) {
      nodeList.messageChain = nodeList.messageChain.getMessageChain();
    }

    this.nodeList.push(new ForwardNode_Data(nodeList));
    return this;
  } // 使用 messageId 添加节点


  addForwardNodeById(messageId) {
    this.nodeList.push(new ForwardNode_Id({
      messageId
    }));
    return this;
  } // get 原接口格式的信息链


  getForwardNode() {
    return this.nodeList;
  }

}

module.exports = {
  ForwardNode
};