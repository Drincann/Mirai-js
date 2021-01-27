const errCode = require('./errCode');
const axios = require('axios');
const { URL } = require('url');

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

        // 所有错误都要抛出
        if (code in errCode) {
            // 统一抛出的异常的格式
            throw { code, message: msg };
        }
        return sessionKey;
    } catch (error) {
        // 统一的异常格式
        const { response: { data }, message } = error;
        if (data) {
            throw { message: data };
        } else {
            throw { message }
        }
    }
};
