require('dotenv').config();

const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const redis = require('redis');
const crypto = require('crypto-random-string');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB,
});
redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

const { signInSchema, signUpSchema } = require('./json-schema'); 
const { user } = require('./models');

/* 
  * since we are dealing with cookies across cross-site domains (localhost:8080, localhost:3000), cors won't work with "*" origin header,
  * so we need to explicity state the origin through which credentials are exchanged. In fetch API, credentials='something' is used to 
  * decide whether to send user credentials during requests. By default, credentials='same-origin' which means user credentials are sent
  * only when both server domain (to which we request) and domain in browser match (URL). Since Vue app and node is running on different domains
  * i.e ::8080 and ::3000, user credentials are not sent as the domains dont match. So we need to explicitly set credentials='include', so that
  * cookies responses and exchange of credential is not blocked during CORS. This setting should be applied for any fetch API request made from 
  * one domain to another. And the server should also be configured to handle CORS safely.
*/
app.use(cors({ credentials: true, origin: 'http://localhost:8080' }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));	
  
app.listen(process.env.PORT, (err) => {
  if (err)
   throw err;
  console.log(`Listening on port ${process.env.PORT}`);  
});

mongoose.connect(process.env.MONGODB_URL, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true
})
  .then(() => {
    console.log('Connected to database!');
})
  .catch((err) => {
    console.log(err);
});

app.post('/users/sign-up', async (req, res) => {
  const { error } = signUpSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error : true, msg : "Input doesn't match specified criteria" });
    // console.log(error);
  } else {
    const anotherUser = await user.findOne({ name : req.body.name });
    if (anotherUser) {
      res.status(500).json({ error : true, msg : 'User already exists' });
    } else {
      const newUser = new user(req.body);
      bcrypt.genSalt(Number(process.env.SALT_ROUNDS), (err, salt) => {
        if (err) {
          res.status(500).json({ error : true, msg : 'Server error' });
          console.log(err);
        } else {
          bcrypt.hash(newUser.password, salt, function(err, hash) {
            if (err) {
              res.status(500).json({ error : true, msg : 'Server error' });
              console.log(err);
            } else {
              newUser.password = hash;
              newUser.save((err) => {
                if (err) {
                  res.status(500).json({ error : true, msg : 'Failed to complete registration, retry later!'});
                  console.log(err);
                } else {
                  res.status(200).json({ error : false });
                } 
              });          
            }            
          });
        }
      });
    }
  }
});

app.post('/users/sign-in', async (req, res) => {
  const { error } = signInSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error : true, auth : false, msg : 'Invalid username or password' });
    // console.log(error);
  } else {
    const findUser = await user.findOne({ name : req.body.name });
    if (findUser) {  
      bcrypt.compare(req.body.password, findUser.password, (err, result) => {
        if (err) {
          res.status(400).json({ error : true, auth : false, msg : 'Invalid username or password' });
          console.log(err);
        } else if (result === false) {
          res.status(400).json({ error : true, auth : false, msg : 'Invalid username or password' });
        } else {
          const sessionID = crypto({ length: 120 });
          res
            .cookie('SID', sessionID, {
              maxAge: 60 * 60 * 24 * 1000,
              httpOnly: true,
              secure: false,
              sameSite: true,
              domain: 'localhost',
            })
            .status(200)
            .json({ error : false, auth : true });
        }
      });
    } else {
      res.status(400).json({ error : true, auth : false, msg : 'Invalid username or password' });
    }
  }
});

app.post('/users/isLoggedIn', (req, res) => {
  const { SID: sessionID } = req.cookies;
  console.log(sessionID);
  res.status(200).json({ error : false });
});