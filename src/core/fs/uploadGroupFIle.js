const { errCodeMap } = require('../../util/errCode');
const axios = require('axios').default;
const { URL } = require('../polyfill/URL');
const errorHandler = require('../../util/errorHandler');
const path = require('path');
const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;
const FormData = require('form-data');


/**
 * @description 上传文件至服务器并发送，返回文件 id
 * @param {string}  baseUrl    mirai-api-http server 的地址
 * @param {string}  sessionKey 会话标识
 * @param {string}  type       "friend" 或 "group"，目前仅支持 group
 * @param {string}  target     群/好友号
 * @param {string}  path       上传目录id
 * @param {Buffer}  file       文件二进制数据
 * @returns {string} 文件 id
 */
module.exports = async ({ baseUrl, sessionKey, type, target, path, file }) => {
    try {
        // 拼接 url
        const targetUrl = new URL('/file/upload', baseUrl).toString();

        // 构造 fromdata
        const form = new FormData();
        form.append('sessionKey', sessionKey);
        form.append('type', type);
        form.append('target', target);
        form.append('path', path);
        form.append('file', file, { filename: 'payload' });

        // 请求
        const responseData = await axios.post(targetUrl, form, {
            // formdata.getHeaders 将会指定 content-type，同时给定随
            // 机生成的 boundary，即分隔符，用以分隔多个表单项而不会造成混乱
            headers: form.getHeaders(),
        });

        try {
            var {
                data: { msg: message, code, id }
            } = responseData;
        } catch (error) {
            throw new Error(('请求返回格式出错，请检查 mirai-console'));
        }

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return id;
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }
};