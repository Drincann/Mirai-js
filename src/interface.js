/**
 * @description Bot.sendMessage 方法的扩展接口
 * 重写该接口后可将子类实例直接传入 message 参数
 */
class MessageChainGetable {
    getMessageChain() { }
}

/**
 * @description Bot.on/one 及 Waiter.waiter 的扩展接口
 * 重写该接口后可将子类实例直接作为回调函数传入
 */
class EntryGetable {
    getEntry() { }
}

module.exports = { MessageChainGetable, EntryGetable };