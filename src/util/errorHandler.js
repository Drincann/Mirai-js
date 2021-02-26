module.exports = (error) => {
    // 拿到所有的 message
    let message, miraiMessage, resMessage;

    ({ message } = error);

    const { response } = error;
    if (response?.data) {
        ({ msg: miraiMessage, resMessage } = response.data);
    }

    // 抛出
    if ((message ?? miraiMessage ?? resMessage ?? response?.data)) {
        // 拼接
        throw new Error(
            [message, miraiMessage, resMessage, response?.data]
                .filter(msg => typeof msg == 'string')
                .join('\n')
        );
    } else {
        // 未知异常
        throw error;
    }
};