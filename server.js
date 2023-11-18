global.base_dir = __dirname;
global.abs_path = function(path) {
  return base_dir + path
}
global.include = function(file) {
  return require(abs_path('/' + file));
}

require('dotenv').config();

const MongoStore = require("connect-mongo");
const session = require("express-session");

const cors = require('cors');
const express = require('express');
const router = include('routes/router')

const node_session_secret = process.env.NODE_SESSION_SECRET;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const expireTime = 60 * 60 * 1000;

const port = process.env.PORT || 3000;

const app = express();

const mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster3.s3p0zue.mongodb.net/?retryWrites=true&w=majority`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(cors({ origin: true, credentials: true }))
app.use(express.json());

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false, maxAge: expireTime, httpOnly: false }
  })
);

app.use('/', router);

app.listen(port, () => {
  console.log("node app listening on port: " + port);
});
