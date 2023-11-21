const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const router = require("./routes/router");

const port = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4200", /\.vercel\.app$/],
    credentials: true,
    methods: ["GET", "PUT", "POST", "OPTIONS", "HEAD"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/", router);

app.listen(port, () => {
  console.log("node app listening on port: " + port);
});
