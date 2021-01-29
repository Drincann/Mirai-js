const errCode = require('./util/errCode');
const axios = require('axios');
const { URL } = require('url');
const errorHandler = require('./util/errorHandler');

/**
 * @description 关闭一个会话
 * @param {string} baseUrl    mirai-api-http server 的主机地址
 * @param {string} sessionKey 会话标识
 * @param {number} qq         qq 号
 * @returns {Object} 结构 { message, code }
 */
module.exports = async ({ baseUrl, sessionKey, qq }) => {
    try {
        // 拼接 url
        const url = new URL('/release', baseUrl).toString();

        // 请求
        let {
            data: { msg: message, code },
        } = await axios.post(url, { sessionKey, qq });

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw { code, message };
        }
        return { message, code };
    } catch (error) {
        errorHandler(error);
    }

};
