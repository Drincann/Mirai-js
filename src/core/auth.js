const { errCodeMap } = require('../util/errCode');
const axios = require('axios');
let URL;
if (!process.browser) {
    ({ URL } = require('url'));
} else {
    URL = window.URL;
}
const errorHandler = require('../util/errorHandler');
const path = require('path');
const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;

/**
 *
 * @description 认证 verifyKey，创建回话，返回一个 sessionKey
 * @param {string} baseUrl mirai-api-http server 的地址
 * @param {string} verifyKey mirai-api-http server 设置的 verifyKey
 * @returns {string} 会话标识 sessionKey
 */
module.exports = async ({ baseUrl, verifyKey }) => {
    try {
        // 拼接 url
        const url = new URL('/verify', baseUrl).toString();

        // 请求
        const responseData = await axios.post(url, { verifyKey });
        try {
            var {
                data: { msg: message, code, session: sessionKey },
            } = responseData;
        } catch (error) {
            throw new Error(('请求返回格式出错，请检查 mirai-console'));
        }

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return sessionKey;
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }
};
