module.exports = {
    wsStartListening: window !== undefined ? require('../core/startListeningBrowser') : require('../core/startListeningNode'),
    wsStopListening: window !== undefined ? require('../core/stopListeningBrowser') : require('../core/stopListeningNode'),
};