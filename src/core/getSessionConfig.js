const { errCodeMap } = require('../util/errCode');
const axios = require('axios');
const { URL } = require('../polyfill/URL');
const errorHandler = require('../util/errorHandler');
const path = require('path');
const { isBrowserEnv } = require('../util/isBrowserEnv');
const locationStr = !isBrowserEnv() ? `core.${path.basename(__filename, path.extname(__filename))}` : 'borwser';

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
        const responseData = await axios.get(url, { params: { sessionKey } });
        try {
            var {
                data: { msg: message, code, cacheSize, enableWebsocket },
            } = responseData;
        } catch (error) {
            throw new Error(('请求返回格式出错，请检查 mirai-console'));
        }
        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return { cacheSize, enableWebsocket };
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }

};
