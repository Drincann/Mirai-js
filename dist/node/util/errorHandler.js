"use strict";

module.exports = error => {
  var _ref, _ref2, _message;

  // 拿到所有的 message
  let message, miraiMessage, resMessage;
  ({
    message
  } = error);
  const {
    response
  } = error;

  if (response !== null && response !== void 0 && response.data) {
    ({
      msg: miraiMessage,
      resMessage
    } = response.data);
  } // 抛出


  if ((_ref = (_ref2 = (_message = message) !== null && _message !== void 0 ? _message : miraiMessage) !== null && _ref2 !== void 0 ? _ref2 : resMessage) !== null && _ref !== void 0 ? _ref : response === null || response === void 0 ? void 0 : response.data) {
    // 拼接
    throw new Error([message, miraiMessage, resMessage, response === null || response === void 0 ? void 0 : response.data].filter(msg => typeof msg == 'string').join('\n'));
  } else {
    // 未知异常
    throw error;
  }
};