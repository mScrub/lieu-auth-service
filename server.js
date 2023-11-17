global.base_dir = __dirname;
global.abs_path = function(path) {
  return base_dir + path
}
global.include = function(file) {
  return require(abs_path('/' + file));
}
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const router = include('routes/router')

const port = process.env.PORT || 3000;

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/', router);

app.listen(port, () => {
  console.log("node app listening on port: " + port);
});
