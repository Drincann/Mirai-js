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
        const responseData = await axios.post(url, { sessionKey, cacheSize, enableWebsocket });
        try {
            var {
                data: { msg: message, code }
            } = responseData;
        } catch (error) {
            throw new Error('core.setSessionConfig 请求返回格式出错，请检查 mirai-console');
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