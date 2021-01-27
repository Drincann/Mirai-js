const errCode = require('./errCode');
const axios = require('axios');
const { URL } = require('url');

/**
 * 
 * @description 向 qq 好友发送消息
 * @param {string} baseUrl                  mirai-api-http server 的地址
 * @param {string} sessionKey               会话标识
 * @param {number} target                   目标好友 qq 号
 * @param {number} quote                    消息引用，使用发送时返回的 messageId
 * @param {array[messageType]} messageChain 消息链，MessageType 数组
 */
module.exports = async ({ baseUrl, sessionKey, target, quote, messageChain }) => {
    try {
        // 拼接 url
        const url = new URL('/sendFriendMessage', baseUrl).toString();

        // 请求
        let { data: { msg, code, messageId } } = await axios.post(url, {
            sessionKey, target, quote, messageChain
        });

        // 所有错误都要抛出
        if (code in errCode) {
            // 统一抛出的异常的格式
            throw { code, message: msg };
        }
        return { msg, code, messageId };
    } catch (error) {
        // 统一的异常格式
        const { response: { data }, message } = error;
        if (data) {
            throw { message: data };
        } else {
            throw { message }
        }
    }

}