const errCode = require('../util/errCode');
const axios = require('axios').default;
const { URL } = require('url');
const errorHandler = require('../util/errorHandler');


/**
 * @description 设置指定 session 的 config
 * @param {string}  baseUrl         mirai-api-http server 的地址
 * @param {string}  sessionKey      会话标识
 * @param {number}  cacheSize       插件缓存大小
 * @param {boolean} enableWebsocket websocket 状态
 * @returns {Object} 结构 { message, code }
 */
module.exports = async ({ baseUrl, sessionKey, cacheSize, enableWebsocket }) => {
    try {
        // 拼接 url
        const url = new URL('/config', baseUrl).toString();

        // 请求
        let { data: { msg: message, code } } = await axios.post(url, { sessionKey, cacheSize, enableWebsocket });

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw new Error(message);
        }
        return { message, code };
    } catch (error) {
        errorHandler(error);
    }
}