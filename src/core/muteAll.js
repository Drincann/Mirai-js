const errCode = require('../util/errCode');
const axios = require('axios').default;
const { URL } = require('url');
const errorHandler = require('../util/errorHandler');

/**
 * @description 全员禁言
 * @param {string} baseUrl    mirai-api-http server 的主机地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     欲全员禁言的群号
 * @returns {Object} 结构 { message, code }
 */
module.exports = async ({ baseUrl, sessionKey, target }) => {
    try {
        // 拼接 URL
        const url = new URL('/muteAll', baseUrl).toString();

        // 请求
        let {
            data: { code, msg: message }
        } = await axios.post(url, { sessionKey, target });

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw new Error(message);
        }
        return { message, code };
    } catch (error) {
        errorHandler(error);
    }
};