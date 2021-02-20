const errCode = require('../util/errCode');
const axios = require('axios').default;
const { URL } = require('url');
const errorHandler = require('../util/errorHandler');

/**
 * @description 获取群配置
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {string} target     群号
 * @returns {Object} 
 */
module.exports = async ({ baseUrl, sessionKey, target }) => {
    try {
        // 拼接 url
        const url = new URL('/groupConfig', baseUrl).toString();

        // 请求
        const { data } = await axios.get(url, { params: { sessionKey, target } });
        const { msg: message, code } = data;

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw new Error(message);
        }
        return data;
    } catch (error) {
        errorHandler(error);
    }
};