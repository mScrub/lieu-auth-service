const jwt = require("jsonwebtoken");

const generateJwtToken = (user) => {
  const token = jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      username: user.username,
      userType: user.user_type,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
  return token;
};

const verifyJwtToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { ...decoded, authenticated: true };
  } catch (err) {
    return { authenticated: false };
  }
};

const jwtGuard = (req, res, next) => {
  const token = req.cookies["lieu.sid"];

  if (!token) {
    return res.status(401).json({
      message: "Missing token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    return next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Failed to verify token" });
  }
};

module.exports = {
  generateJwtToken,
  verifyJwtToken,
  jwtGuard,
};
