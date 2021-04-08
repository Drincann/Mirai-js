"use strict";

/**
 * @description Bot.sendMessage 方法的扩展接口
 * 重写该接口后可将子类实例直接传入 message 参数
 */
class MessageChainGetable {
  getMessageChain() {}

}

module.exports = {
  MessageChainGetable
};