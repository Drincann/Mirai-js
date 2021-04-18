"use strict";

/**
 * @description Bot.sendMessage 方法的扩展接口
 * 重写该接口后可将子类实例直接传入 message 参数
 */
class MessageChainGetable {
  getMessageChain() {}

}
/**
 * @description Bot 实现的接口，其他类访问 bot.config
 * 的途径，避免其他类直接访问实现，用来解耦
 */


class BotConfigGetable {
  getBaseUrl() {}

  getQQ() {}

  getAuthKey() {}

  getSessionKey() {}

}

module.exports = {
  MessageChainGetable,
  BotConfigGetable
};