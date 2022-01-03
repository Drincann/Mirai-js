const { errCodeMap } = require('../util/errCode');
const axios = require('axios').default;
let URL;
if (!process.browser) {
    ({ URL } = require('url'));
} else {
    URL = window.URL;
}
const errorHandler = require('../util/errorHandler');
const path = require('path');
const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;
const FormData = require('form-data');


/**
 * @description 上传图片至服务器，返回指定 type 的 imageId，url，及 path
 * @param {string}  baseUrl          mirai-api-http server 的地址
 * @param {string}  sessionKey       会话标识
 * @param {string}  type             "friend" 或 "group" 或 "temp"
 * @param {Buffer}  img              图片二进制数据
 * @returns {Object} 结构 { imageId, url, path } 
 */
module.exports = async ({ baseUrl, sessionKey, type, img }) => {
    try {
        // 拼接 url
        const targetUrl = new URL('/uploadImage', baseUrl).toString();

        // 构造 fromdata
        const form = new FormData();
        form.append('sessionKey', sessionKey);
        form.append('type', type);
        // filename 指定了文件名
        form.append('img', img, { filename: 'img.jpg' });

        // 请求
        const responseData = await axios.post(targetUrl, form, {
            // formdata.getHeaders 将会指定 content-type，同时给定随
            // 机生成的 boundary，即分隔符，用以分隔多个表单项而不会造成混乱
            headers: form.getHeaders(),
        });

        try {
            var {
                data: { msg: message, code, imageId, url, path }
            } = responseData;
        } catch (error) {
            throw new Error(('请求返回格式出错，请检查 mirai-console'));
        }

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return { imageId, url, path };
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }
};