const { errCodeMap } = require('../util/errCode');
const axios = require('axios');
const { URL } = require('../polyfill/URL');
const errorHandler = require('../util/errorHandler');
const path = require('path');
const { isBrowserEnv } = require('../util/isBrowserEnv');
const locationStr = !isBrowserEnv() ? `core.${path.basename(__filename, path.extname(__filename))}` : 'borwser';

/**
 * @description 通过 messageId 获取消息
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     qq 号/群号
 * @param {number} messageId  消息 id
 * @returns {Object} 结构 { type, messageChain, sender }
 */
module.exports = async ({ baseUrl, sessionKey, target, messageId }) => {
    try {
        // 拼接 url
        const url = new URL('/messageFromId', baseUrl).toString();

        // 请求
        const responseData = await axios.get(url, { params: { sessionKey, target, messageId } });
        try {
            var {
                data: { msg: message, code, data }
            } = responseData;
        } catch (error) {
            throw new Error('请求返回格式出错，请检查 mirai-console');
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