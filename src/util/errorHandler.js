module.exports = (error) => {
    // 统一向外抛出的异常格式
    const { code, response, message } = error;

    // mirai 异常
    if (code) {
        throw new Error(message);
    }

    // 有 res，服务端异常，即 status 非 200
    if (response && response.data) {
        throw new Error(response.data);
    }

    // 未知异常
    throw error;
}