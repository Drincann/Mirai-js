const { errCodeMap } = require('../util/errCode');
const axios = require('axios').default;
let URL;
if (!process.browser) {
    ({ URL } = require('url'));
} else {
    URL = window.URL;
}
const errorHandler = require('../util/errorHandler');

/**
 * @description 向临时对象发送消息
 * @param {string}             baseUrl      mirai-api-http server 的地址
 * @param {string}             sessionKey   会话标识
 * @param {number}             qq           目标 qq 号
 * @param {number}             group        目标群号
 * @param {number}             quote        消息引用，使用发送时返回的 messageId
 * @param {MessageType[]} messageChain 消息链，MessageType 数组
 * @returns {Object} 结构 { message, code, messageId }
 */
module.exports = async ({ baseUrl, sessionKey, qq, group, quote, messageChain }) => {
    try {
        // 拼接 url
        const url = new URL('/sendTempMessage', baseUrl).toString();

        // 请求
        var responseData;
        
        if(!qq || !group){
            throw new Error('sendTempMessage 缺少必要的 qq 和 group 参数');
        }
          
        responseData = await axios.post(url, {
            sessionKey,
            qq,
            group,
            quote,
            messageChain
        });

        try {
            var {
                data: { msg: message, code, messageId }
            } = responseData;
        } catch (error) {
            throw new Error('core.sendTempMessage 请求返回格式出错，请检查 mirai-console');
        }

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return messageId;
    } catch (error) {
        errorHandler(error);
    }

};