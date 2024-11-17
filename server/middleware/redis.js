const redis = require('redis');
const crypto = require('crypto');

const client = redis.createClient({
    url: "redis://redis:6379",  // works from Docker!
});
client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    try {
        await client.connect();
        console.log("Connected to Redis");
    } catch (err) {
        console.error("Could not connect to Redis", err);
    }
})();

const generateKey = (req) => {
    const baseUrl = req.baseUrl;
    const email = req.user.email;
    const query = JSON.stringify(req.query);
    console.log(email + baseUrl + query);
    const hash = crypto.createHash('sha256').update(email + baseUrl + query).digest('hex');
    return `cache:${hash}`;
};

const generateTransactionKey = (req) => {
    const baseUrl = req.baseUrl;
    const email = req.user.email;
    const query = JSON.stringify(req.query);
    const hash = crypto.createHash('sha256').update(email + baseUrl + query).digest('hex');
    return `${email}:transactions:${hash}`;
};

const checkCache = async (req, res, next) => {
    const redis_key = generateTransactionKey(req);
    console.log("Generated Redis key: ", redis_key);

    try {
        const reply = await client.get(redis_key);
        if (reply) {
            console.log("Cache hit for key:", redis_key);
            res.status(200).json({
                message: `Success Read ${redis_key}`,
                data: JSON.parse(reply)
            });
        } else {
            console.log("Cache miss for key:", redis_key);
            next();
        }
    } catch (err) {
        console.log("Error fetching from cache:", err);
        res.status(500).json({
            message: "Something Went Wrong",
            error: err.message
        });
    }
};

const cacheResponse = async (key, data) => {
    if (typeof key !== 'string') {
        throw new TypeError("Key must be a string");
    }
    try {
        await client.set(key, JSON.stringify(data), {
            EX: 180,
            NX: true,
        });
        console.log("Data cached for key:", key);
    } catch (err) {
        console.error("Error setting cache:", err);
    }
};

const delCachePattern = async (pattern) => {
    try {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
            console.log("Cache deleted for pattern:", pattern);
        }
    } catch (err) {
        console.error("Error deleting cache:", err);
    }
};

const delCache = async (key) => {
    if (typeof key !== 'string') {
        throw new TypeError("Key must be a string");
    }
    try {
        await client.del(key);
        console.log("Cache deleted for key:", key);
    } catch (err) {
        console.error("Error deleting cache:", err);
    }
};

module.exports = {
    generateKey,
    checkCache,
    cacheResponse,
    delCache,
    delCachePattern,
    generateTransactionKey
};
