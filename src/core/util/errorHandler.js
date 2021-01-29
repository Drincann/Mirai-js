module.exports = (error) => {
    // 统一向外抛出的异常格式
    const { code, response, message } = error;

    // mirai 异常
    if (code) {
        throw { code, message };
    }

    // 有 res，服务端异常，即 status 非 200
    if (response && response.data) {
        throw { message: response.data };
    }

    // 未知异常
    throw { message, source: error }
}