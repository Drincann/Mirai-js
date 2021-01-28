const errCode = require('./errCode');
const axios = require('axios');
const { URL } = require('url');
const errorHandler = require('./util/errorHandler');

/**
 * 
 * @description 向 qq 群发送消息
 * @param {string} baseUrl                  mirai-api-http server 的地址
 * @param {string} sessionKey               会话标识
 * @param {number} target                   目标群号
 * @param {number} quote                    消息引用，使用发送时返回的 messageId
 * @param {array[messageType]} messageChain 消息链，MessageType 数组
 */
module.exports = async ({ baseUrl, sessionKey, target, quote, messageChain }) => {
    try {
        // 拼接 url
        const url = new URL('/sendGroupMessage', baseUrl).toString();

        // 请求
        let { data: { msg, code, messageId } } = await axios.post(url, {
            sessionKey, target, quote, messageChain
        });

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw { code, message: msg };
        }
        return { msg, code, messageId };
    } catch (error) {
        errorHandler(error);
    }

}