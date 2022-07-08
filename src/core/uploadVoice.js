const { errCodeMap } = require('../util/errCode');
const axios = require('axios').default;
const { URL } = require('../polyfill/URL');
const errorHandler = require('../util/errorHandler');
const path = require('path');
const { isBrowserEnv } = require('../util/isBrowserEnv');
const locationStr = !isBrowserEnv() ? `core.${path.basename(__filename, path.extname(__filename))}` : 'borwser';
const FormData = require('form-data');


/**
 * FIXME: 目前该功能返回的 voiceId 无法正常使用，无法
 * 发送给好友，提示 message is empty，发到群里则是 1s 的无声语音
 * @description 上传语音至服务器，返回指定 type 的 imageId，url，及 path
 * @param {string}  baseUrl          mirai-api-http server 的地址
 * @param {string}  sessionKey       会话标识
 * @param {string}  type             TODO: 目前服务端仅支持 "group"
 * @param {Buffer}  voice            语音二进制数据
 * @returns {Object} 结构 { imageId, url, path } 
 */
module.exports = async ({ baseUrl, sessionKey, type, voice }) => {
    try {
        // 拼接 url
        const targetUrl = new URL('/uploadVoice', baseUrl).toString();

        // 构造 fromdata
        const form = new FormData();
        form.append('sessionKey', sessionKey);
        form.append('type', type);
        form.append('voice', voice, { filename: 'voice.mp3' });

        // 请求
        const responseData = await axios.post(targetUrl, form, {
            // formdata.getHeaders 将会指定 content-type，同时给定随
            // 机生成的 boundary，即分隔符，用以分隔多个表单项而不会造成混乱
            headers: form.getHeaders(),
        });
        try {
            var {
                data: { msg: message, code, voiceId, url, path }
            } = responseData;
        } catch (error) {
            throw new Error(('请求返回格式出错，请检查 mirai-console'));
        }
        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return { voiceId, url, path };
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }
};