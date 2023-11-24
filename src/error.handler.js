const { IpDeniedError } = require("express-ipfilter");

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof IpDeniedError) {
    console.error("IP Denied: ", err.message);
    return res.status(403).json({ message: "Forbidden" });
  }
  console.error(err.message);
  return res.status(500).json({ message: "Internal Server Error" });
};

module.exports = errorHandler;
