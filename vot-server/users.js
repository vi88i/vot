require('dotenv').config();

const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { signInSchema, signUpSchema } = require('./json-schema'); 

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
// app.use((err, req, res, next) => {
  
// });

app.listen(process.env.PORT, (err) => {
  if (err)
   throw err;
  console.log(`Listening on port ${process.env.PORT}`);  
});

app.post('/sign-up', (req, res) => {
  const { error } = signUpSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error : true });
  } else {
    res.status(200).json({ error : false });
  }
});

app.post('/sign-in', (req, res) => {
  const { error } = signInSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error : true });
  } else {
    res.status(200).json({ error : false });
  }
});