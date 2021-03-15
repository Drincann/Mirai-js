const { errCodeMap } = require('../util/errCode');
const axios = require('axios').default;
const { URL } = require('url');
const errorHandler = require('../util/errorHandler');

/**
 * @description 禁言群成员
 * @param {string} baseUrl    mirai-api-http server 的主机地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     欲禁言成员所在群号
 * @param {number} memberId   欲禁言成员 qq 号
 * @param {number} time       禁言时长，单位: s (秒)
 * @returns {Object} 结构 { message, code }
 */
module.exports = async ({ baseUrl, sessionKey, target, memberId, time }) => {
    try {
        // 拼接 URL
        const url = new URL('/mute', baseUrl).toString();

        // 请求
        const responseData = await axios.post(url, { sessionKey, target, memberId, time });
        try {
            var {
                data: { code, msg: message }
            } = responseData;
        } catch (error) {
            throw new Error('core.mute 请求返回格式出错，请检查 mirai-console');
        }
        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return { message, code };
    } catch (error) {
        errorHandler(error);
    }
};