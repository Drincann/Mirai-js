const errCode = require('./errCode');
const axios = require('axios');
const { URL } = require('url');

/**
 *
 * @description 校验 sessionKey，将一个 session 绑定到指定的 qq 上
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} qq         qq 号
 */
module.exports = async ({ baseUrl, sessionKey, qq }) => {
    try {
        // 拼接 auth url
        const url = new URL('/verify', baseUrl).toString();

        // 请求
        let {
            data: { msg, code },
        } = await axios.post(url, { sessionKey, qq });

        // 所有错误都要抛出
        // 这里可能发生 "指定的 Bot 不存在"
        if (code in errCode) {
            // 与 catch 统一抛出的异常的格式
            throw { code, message: msg };
        }
        return { msg, code };
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
