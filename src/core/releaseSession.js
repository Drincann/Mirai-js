const errCode = require('./errCode');
const axios = require('axios');
const { URL } = require('url');

/**
 *
 * @description 关闭一个会话
 * @param {string} baseUrl    mirai-api-http server 的主机地址
 * @param {string} sessionKey 会话标识
 * @param {number} qq         qq 号
 */
module.exports = async ({ baseUrl, sessionKey, qq }) => {
    try {
        // 拼接 url
        const url = new URL('/release', baseUrl).toString();

        // 请求
        let {
            data: { msg, code },
        } = await axios.post(url, { sessionKey, qq });

        // 所有错误都要抛出
        // 这里可能发生 "指定的 Bot 不存在"
        if (code in errCode) {
            // 统一抛出的异常的格式
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
