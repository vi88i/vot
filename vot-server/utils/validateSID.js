require('dotenv').config();

const redis = require('redis');
const redisStore = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB,
});
redisStore.on('error', (err) => {
  console.log('Redis error: ', err);
});

const redisBlacklist = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_BLACKLIST_DB,
});
redisBlacklist.on('error', (err) => {
  console.log('Redis error: ', err);
});

const validateSID = (req, res, next) => {
  const { SID: sessionID } = req.cookies;
  if (sessionID) {
    redisBlacklist.get(sessionID, (err, result) => {
      // redisBlacklist.quit();
      if (err) {
        res.status(500).json({ error: true, auth: false });
        console.log(err);
      } else if (result) {
        res.status(401).json({ error: true, auth: false });
      } else {
        req.sessionID = sessionID;
        redisStore.get(sessionID, (err, result) => {
          // redisStore.quit();
          if (err) {
            res.status(500).json({ error: true, auth: false });
            console.log(err);
          } else if (result) {
            const session_variables = JSON.parse(result);
            req.session = Object.assign({}, session_variables);
            next();
          } else {
            res.status(401).json({ error: true, auth: false });
          }
        });
      }
    });
  } else {
    res.status(401).json({ error: true, auth: false });
  }
};

module.exports = { validateSID };