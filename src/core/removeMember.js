const errCode = require('../util/errCode');
const axios = require('axios').default;
const { URL } = require('url');
const errorHandler = require('../util/errorHandler');

/**
 * @description 移除群成员
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     欲移除的成员所在群号
 * @param {number} memberId   欲移除的成员 qq 号
 * @param {number} msg        信息
 * @returns {Object} 结构 { message, code }
 */
module.exports = async ({ baseUrl, sessionKey, target, memberId, msg }) => {
    try {
        // 拼接 url
        const url = new URL('/kick', baseUrl).toString();

        // 请求
        let {
            data: { msg: message, code }
        } = await axios.post(url, { sessionKey, target, memberId, msg });

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw new Error(message);
        }
        return { message, code };
    } catch (error) {
        errorHandler(error);
    }

}