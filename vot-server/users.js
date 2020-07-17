require('dotenv').config();

const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const redis = require('redis');
const crypto = require('crypto-random-string');

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

const { signInSchema, signUpSchema, pollSchema } = require('./json-schema'); 
const { user, poll } = require('./models');
const { validateSID } = require('./utils/validateSID');
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
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.sessionID) {
      const session_variables = Object.assign({}, req.session);
      redisStore.set(req.sessionID, JSON.stringify(session_variables), 'PX', req.session.expiresIn - Date.now());
    }
  });
  next();
});

app.listen(process.env.PORT, (err) => {
  if (err)
   throw err;
  console.log(`Listening on port ${process.env.PORT}`);  
});

const http = require('http').createServer(app);
const io = require('socket.io')(http);

http.listen(process.env.SOCKET_PORT, () => {
  console.log(`Socket listening on ${process.env.SOCKET_PORT}`);
});

io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
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

// release resource before exit
// process.on('beforeExit', () => {
//   redisStore.quit();
//   redisBlacklist.quit();
//   mongoose.connection.close();
// });

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
          const session_variables = {
            name: 'Vighnesh Nayak S',
            isAuthenticated: true,
            expiresIn: Date.now() + 60 * 60 * 24 * 1000,
          };
          redisStore.set(sessionID, JSON.stringify(session_variables), 'PX', 60 * 60 * 24 * 1000);
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

app.post('/users/isLoggedIn', validateSID, (req, res) => {
  if (req.session.refresh) {
    req.session.refresh += 1;
  } else {
    req.session.refresh = 0;
  }
  res.status(200).json({ error: false, auth: true, name: req.session.name });
});

app.post('/users/logout', validateSID, (req, res) => {
  const ttl = req.session.expiresIn - Date.now();
  if (ttl > 0) {
    redisBlacklist.set(req.sessionID, '1', 'PX', ttl);
  }
  res
    .clearCookie('SID', { path: '/' })
    .status(200)
    .json({ error: false });
});

app.post('/users/submitPoll', validateSID, async (req, res) => {
  const { error } = pollSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: true, auth: true, msg: 'Invalid input' });
    console.log(error);
  } else {
    const anotherQuestion = await poll.findOne({ pollster: req.session.name, question: req.body.question });
    if (anotherQuestion) {
      res.status(200).json({ error: true, auth: true, msg: 'Question already asked!' });
    } else {
      const deadline_time = new Date(req.body.deadline);
      if (deadline_time.getTime() > Date.now()) {
        const newPoll = new poll({ pollster: req.session.name, ...req.body, ballot: [] });
        newPoll.save((err) => {
          if (err) {
            res.status(500).json({ error: true, auth: true, msg: 'Something went wrong!' });
            console.log(err);
          } else {  
            res.status(200).json({ error: false, auth: true });
          }
        });
      } else {
        res.status(400).json({ error: true, auth: true, msg: 'Invalid date!' });
      }
    }
  }
});

app.post('/users/listAllPolls', validateSID, async (req, res) => {
  const allPolls = await poll.find({ pollster: req.session.name });
  let data = allPolls.map((elem) => {
    return {
      question: elem.question,
      id: elem._id,
    }
  });
  res.status(200).json({ error: false, auth: true, polls: data });
});

app.post('/users/deletePoll', validateSID, (req, res) => {
  poll.deleteOne({ pollster: req.session.name, _id: req.body.id }, async (err) => {
    if (err) {
      res.status(500).json({ error: true, auth: true });
    } else {
      const allPolls = await poll.find({ pollster: req.session.name });
      let data = allPolls.map((elem) => {
        return {
          question: elem.question,
          id: elem._id,
        }
      });
      res.status(200).json({ error: false, auth: true, polls: data });
    }
  });
});

app.post('/users/viewPoll', validateSID, async (req, res) => {
  const reqPoll = await poll.findOne({ pollster: req.session.name, _id: req.body.id });
  if (reqPoll) {
    let result = {
      deadline: reqPoll.deadline,
      question: reqPoll.question,
      data: {},
      t: 0,
    };
    reqPoll.options.forEach((elem) => {
      result.data[elem.text] = {
        votes: 0,
        vote_percent: 0,
      };
    });
    reqPoll.ballot.forEach((elem) => {
      result.t = result.t + 1; 
      result.data[elem.selected].votes = result.data[elem.selected].votes + 1; 
    });
    reqPoll.options.forEach((elem) => {
      let percent = (100*result.data[elem.text].votes)/result.t;
      result.data[elem.text].vote_percent = percent.toFixed(2);
    });
    res.status(200).json({ error: false, result: result });
  } else {
    res.status(200).json({ error: true });
  }
});

app.post('/loadPoll', async (req, res) => {
  const reqPoll = await poll.findOne({ _id: req.body.id });
  if (reqPoll) {
    const deadline_time = new Date(reqPoll.deadline);
    if (deadline_time.getTime() > Date.now()) {
      res.status(200).json({ 
        error: false, 
        poll: {
          deadline: reqPoll.deadline,
          pollster: reqPoll.pollster,
          question: reqPoll.question,
          options: reqPoll.options,
        }, 
      });
    } else {
      res.status(404).json({ error: true });
    }   
  } else {
    res.status(200).json({ error: true });
  }
});

app.post('/castPoll', async (req, res) => {
  const { voter_id, id, selected } = req.body;
  const reqPoll = await poll.findOne({ 
    _id: id,
    'ballot.voter_id': { '$nin': voter_id },
  });
  if (reqPoll) {
    const deadline_time = new Date(reqPoll.deadline);
    if (deadline_time.getTime() > Date.now()) {
      let validOption = false;
      // array methods are blocking, so this is fine
      reqPoll.options.forEach((elem) => {
        validOption = validOption || (elem.text === selected);
      });
      if (validOption) {
        reqPoll.ballot.push({ voter_id: voter_id, selected: selected });
        reqPoll.save((err) => {
          if (err) {
            res.status(500).json({ error: true });
            // console.log(err);
          } else {
            let result = {
              deadline: reqPoll.deadline,
              question: reqPoll.question,
              data: {},
              t: 0,
            };
            reqPoll.options.forEach((elem) => {
              result.data[elem.text] = {
                votes: 0,
                vote_percent: 0,
              };
            });
            reqPoll.ballot.forEach((elem) => {
              result.t = result.t + 1; 
              result.data[elem.selected].votes = result.data[elem.selected].votes + 1; 
            });
            reqPoll.options.forEach((elem) => {
              let percent = (100*result.data[elem.text].votes)/result.t;
              result.data[elem.text].vote_percent = percent.toFixed(2);
            });
            io.emit(reqPoll._id, JSON.stringify(result));
            res.status(200).json({ error: false, result: result });
          }
        });
      } else {
        res.status(404).json({ error: true });
      }   
    } else {
      res.status(401).json({ error: true });  
    }
  } else {
    res.status(401).json({ error: true });
  }
});