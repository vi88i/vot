require('dotenv').config();

const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const redis = require('redis');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();

const { signInSchema, signUpSchema } = require('./json-schema'); 
const { user } = require('./models');

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new redisStore({ host: 'localhost', port: 6379, client: redisClient }),
  saveUninitialized: false,
  resave: false
}));

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
          res.status(200).json({ error : false, auth : true, msg : 'Invalid username or password' });
        }
      });
    } else {
      res.status(400).json({ error : true, auth : false, msg : 'Invalid username or password' });
    }
  }
});
