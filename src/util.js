const isProd = process.env.NODE_ENV === "production";

const setCookie = (name, value, res) => {
  res.cookie(name, value, {
    expiry: new Date(Date.now() + 900000),
    secure: isProd ?? false,
    httpOnly: isProd ?? false,
    sameSite: isProd ? "none" : "strict",
  });
};

module.exports = { setCookie };
