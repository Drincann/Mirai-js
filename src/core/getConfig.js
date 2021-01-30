const errCode = require('./util/errCode');
const axios = require('axios');
const { URL } = require('url');
const errorHandler = require('./util/errorHandler');

/**
 * @description 获取指定 session 的 config
 * @param {string} baseUrl mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @returns {Object} 结构 { cacheSize, enableWebsocket }
 */
module.exports = async ({ baseUrl, sessionKey }) => {
    try {
        // 拼接 url
        const url = new URL('/config', baseUrl).toString();

        // 请求
        let { data: { msg: message, code, cacheSize, enableWebsocket } } = await axios.get(url, { params: { sessionKey } });

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw new Error(message);
        }
        return { cacheSize, enableWebsocket };
    } catch (error) {
        errorHandler(error);
    }

}