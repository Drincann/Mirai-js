const { errCodeMap } = require('../../util/errCode');
const axios = require('axios');
const { URL } = require('../../polyfill/URL');
const errorHandler = require('../../util/errorHandler');
const path = require('path');
const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;

/**
 * @description 发布群公告
 * @param {string}  baseUrl    mirai-api-http server 的地址
 * @param {string}  sessionKey 会话标识
 * @param {number}  target     群号
 * @param {string}  content    公告内容
 * @param {boolean} pinned     是否置顶
 * @returns {Object} { code, msg }
 */
module.exports = async ({ baseUrl, sessionKey, target, content, pinned }) => {
    try {
        // 拼接 url
        const url = new URL('/anno/publish', baseUrl).toString();

        // 请求
        const responseData = await axios.post(url, {
            sessionKey, target, content, pinned
        });
        try {
            var {
                data: { msg: message, code }
            } = responseData;
        } catch (error) {
            throw new Error(('请求返回格式出错，请检查 mirai-console'));
        }
        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return { message, code };
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }

};