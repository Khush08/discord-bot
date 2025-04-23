const nodeCache = require('node-cache');

const TTL = 4 * 60 * 60; // Cache expiration time in seconds

const cache = new nodeCache({
    stdTTL: TTL, // Cache expiration time in seconds
    checkperiod: TTL + 1, // Period to check for expired keys
});

const upsertCache = (key, value) => {
    // Check if the key already exists in the cache
    const existingValue = cache.get(key);

    if (existingValue) {
        return true;
    }

    cache.set(key, value, TTL);
    return false;
};

module.exports = {
    upsertCache,
};
