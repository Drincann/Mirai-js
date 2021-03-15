const { errCodeMap } = require('../util/errCode');
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
        const responseData = await axios.get(url, { params: { sessionKey, target } });
        try {
            var { data, data: { msg: message, code } } = responseData;
        } catch (error) {
            throw new Error('core.getGroupConfig 请求返回格式出错，请检查 mirai-console');
        }
        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return data;
    } catch (error) {
        errorHandler(error);
    }
};
