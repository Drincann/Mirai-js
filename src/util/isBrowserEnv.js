exports.isBrowserEnv = () => {
    return typeof window !== 'undefined';
};