const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const { IpFilter } = require("express-ipfilter");
const router = require("./routes/router");
const errorHandler = require("./error.handler");

const port = process.env.PORT || 3000;

const app = express();

app.use(IpFilter([process.env.WHITELIST_IP], { mode: "allow" }));

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

app.use("*", (_req, res) => {
  return res.status(404).json();
});

app.use(errorHandler);

app.listen(port, () => {
  console.log("node app listening on port: " + port);
});
