const errCode = require('./errCode');
const axios = require('axios');
const { URL } = require('url');
const errorHandler = require('./util/errorHandler');

/**
 *
 * @description 认证 authKey，创建回话，返回一个 sessionKey
 * @param {string} baseUrl mirai-api-http server 的地址
 * @param {string} authKey mirai-api-http server 设置的 authKey
 */
module.exports = async ({ baseUrl, authKey }) => {
    try {
        // 拼接 url
        const url = new URL('/auth', baseUrl).toString();

        // 请求
        let {
            data: { msg, code, session: sessionKey },
        } = await axios.post(url, { authKey });


        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw { code, message: msg };
        }
        return sessionKey;
    } catch (error) {
        errorHandler(error);
    }
};
