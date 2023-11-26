const jwt = require("jsonwebtoken");
const { isTokenBlackListed } = require("./database/jwt.query");

const generateJwtToken = (user) => {
  const token = jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      username: user.username,
      userType: user.user_type,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  return token;
};

const verifyJwtToken = async (token) => {
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    const isBlacklisted = await isTokenBlackListed(token);
    if (isBlacklisted) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

const jwtGuard = async (req, res, next) => {
  const token = req.cookies["lieu.sid"];

  if (!token) {
    return res.status(401).json({
      message: "Missing token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await isTokenBlackListed(token);
    if (result) {
      return res.status(403).json({ message: "token expired" });
    }
    req.user = decoded;

    return next();
  } catch (err) {
    return res.status(403).json({ message: "Failed to verify token" });
  }
};

module.exports = {
  generateJwtToken,
  verifyJwtToken,
  jwtGuard,
};
