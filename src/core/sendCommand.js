const errCode = require('./errCode');
const axios = require('axios');
const { URL } = require('url');

/**
 *
 * @description 向 mirai-console 发送指令
 * @param {string} baseUrl     mirai-api-http server 的地址
 * @param {string} authKey     mirai-api-http server 设置的 authKey
 * @param {string} commend     指令名
 * @param {array[string]} args array[string] 指令的参数
 */
module.exports = async ({ baseUrl, authKey, commend: name, args }) => {
    try {
        // 拼接 url
        const url = new URL('/command/send', baseUrl).toString();

        // 请求
        let {
            data: { msg, code },
        } = await axios.post(url, { authKey, name, args, });

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
