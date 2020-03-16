class RokerError extends Error {
    constructor(...args) {
        super(...args);
    }
}

module.exports = RokerError;