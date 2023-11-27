const router = require("express").Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");

const db_users = require("../database/users");
const { verifyJwtToken, jwtGuard, generateJwtToken } = require("../jwt");
const { blackListToken } = require("../database/jwt.query");
const { setCookie } = require("../util");

const saltRounds = 12;

const passwordSchema = Joi.object({
  password: Joi.string()
    .pattern(/(?=.*[a-z])/)
    .pattern(/(?=.*[A-Z])/)
    .pattern(/(?=.*[!@#$%^&*])/)
    .pattern(/(?=.*[0-9])/)
    .min(12)
    .max(50)
    .required(),
});

router.get("/checklogin", async (req, res) => {
  const token = req.cookies["lieu.sid"];
  if (!token) return res.json({ authenticated: false });
  const authenticated = await verifyJwtToken(token);
  return res.json({
    authenticated,
  });
});

router.post("/signup", async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;
    let hashedPassword = bcrypt.hashSync(password, saltRounds);
    const validationResult = passwordSchema.validate({
      password,
    });
    if (validationResult.error) {
      let errorMsg = validationResult.error.details[0].message;

      if (errorMsg.includes("(?=.*[a-z])")) {
        errorMsg = "Password must have at least 1 lowercase.";
      } else if (errorMsg.includes("(?=.*[A-Z])")) {
        errorMsg = "Password must have at least 1 uppercase.";
      } else if (errorMsg.includes("(?=[!@#$%^&*])")) {
        errorMsg = "Password requires 1 special character.";
      } else if (errorMsg.includes("(?=.*[0-9])")) {
        errorMsg = "Password needs to have 1 number.";
      }
      return res.status(400).json({
        message: errorMsg,
        isLoggedIn: false,
      });
    }

    let success = await db_users.createUser({
      email,
      hashedPassword,
      username,
    });

    if (!success.createFlag) {
      res.status(400).json({
        message: `Failed to create the user ${email}`,
        title: "User creation failed",
        errorMsg: success.errorMsg,
      });
    }

    const token = generateJwtToken({
      id: success.insertId,
      username,
      email,
      userType: "USER",
    });

    setCookie("lieu.sid", token, res);
    setCookie("role", "USER", res);

    return res.status(201).json({
      message: "User created successfully",
      user_type: "USER",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.post("/login", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let user = await db_users.getUser(username);

  if (!user) {
    return res.status(400).json({
      message: "You entered the wrong username!",
    });
  }

  const isValidPasword = bcrypt.compareSync(password, user.hashed_password);

  if (!isValidPasword) {
    return res.status(400).json({ message: "You entered the wrong password!" });
  }

  const token = generateJwtToken(user);

  setCookie("lieu.sid", token, res);
  setCookie("role", user.user_type, res);

  return res.status(200).json({
    message: "Login successful!",
    user: {
      user_id: user.user_id,
      user_name: user.name,
      email: user.email,
      user_type: user.user_type,
    },
  });
});

router.get("/logout", async (req, res) => {
  const token = req.cookies["lieu.sid"];
  if (!token) {
    return res.json({ message: "Successfully logged out" });
  }
  try {
    await blackListToken(token);
    return res
      .clearCookie("lieu.sid")
      .clearCookie("role")
      .json({ message: "Successfully logged out" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/me", jwtGuard, async (req, res) => {
  const user = req.user;

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    user_type: user.userType,
  });
});

module.exports = router;
