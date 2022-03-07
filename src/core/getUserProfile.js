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
 * @description 获取用户信息
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     qq 号
 * @returns {Object} 结构 { nickname, email, age, level, sign, sex }
 */
module.exports = async ({ baseUrl, sessionKey, target, memberId }) => {
    try {
        // 拼接 url
        const url = new URL('/userProfile', baseUrl).toString();

        // 请求
        const responseData = await axios.get(url, { params: { sessionKey, target, memberId } });
        try {
            var {
                data: { msg: message, code, nickname, email, age, level, sign, sex }
            } = responseData;
        } catch (error) {
            throw new Error('请求返回格式出错，请检查 mirai-console');
        }
        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return { nickname, email, age, level, sign, sex };
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }

};