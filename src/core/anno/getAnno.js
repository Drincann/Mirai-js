const { errCodeMap } = require('../../util/errCode');
const axios = require('axios').default;
const { URL } = require('../../polyfill/URL');
const errorHandler = require('../../util/errorHandler');
const path = require('path');
const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;

/**
 * @description 获取群公告 
 * @param {string}  baseUrl    mirai-api-http server 的地址
 * @param {string}  sessionKey 会话标识
 * @param {number}  id         群号
 * @param {number}  offset     分页
 * @param {number}  size       分页, 默认 10
 * @returns {Object[]}
 */
module.exports = async ({ baseUrl, sessionKey, id, offset, size = 10 }) => {
    try {
        // 拼接 url
        const url = new URL('/anno/list', baseUrl).toString();

        // 请求
        const responseData = await axios.get(url, {
            params: {
                sessionKey, id, offset, size,
            }
        });
        try {
            var { data: { msg: message, code, data } } = responseData;
        } catch (error) {
            throw new Error(('请求返回格式出错，请检查 mirai-console'));
        }

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return data;
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }
};