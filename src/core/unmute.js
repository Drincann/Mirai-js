const errCode = require('../util/errCode');
const axios = require('axios').default;
const { URL } = require('url');
const errorHandler = require('../util/errorHandler');

/**
 * @description 解除禁言
 * @param {string} baseUrl    mirai-api-http server 的主机地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     欲解除禁言的成员所在群号
 * @param {number} memberId   欲解除禁言的成员 qq 号
 * @returns {Object} 结构 { message, code }
 */
module.exports = async ({ baseUrl, sessionKey, target, memberId }) => {
    try {
        // 拼接 URL
        const url = new URL('/unmute', baseUrl).toString();

        // 请求
        let {
            data: { code, msg: message }
        } = await axios.post(url, { sessionKey, target, memberId });

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw new Error(message);
        }
        return { message, code };
    } catch (error) {
        errorHandler(error);
    }
};