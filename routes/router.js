const router = require("express").Router();
const MongoStore = require("connect-mongo");
const session = require("express-session");
const bcrypt = require("bcrypt");
const Joi = require("joi");
require("dotenv").config();

const db_users = include('database/users')

const saltRounds = 12;
const expireTime = 60 * 60 * 1000;

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const passwordSchema = Joi.object({
  password: Joi.string().pattern(/(?=.*[a-z])/).pattern(/(?=.*[A-Z])/).pattern(/(?=.*[!@#$%^&*])/).pattern(/(?=.*[0-9])/).min(12).max(50).required()
});

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster3.s3p0zue.mongodb.net/?retryWrites=true&w=majority`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

router.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
  })
);



router.get("/checklogin", async (req, res) => {
  return res.json({
    authenticated: req.session.authenticated 
  });
});


router.post("/signup", async (req, res) => {
  console.log("Sign up route")
  try {
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    let hashedPassword = bcrypt.hashSync(password, saltRounds);
    const validationResult = passwordSchema.validate({
      password
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
      res.status(400).json({
        message: errorMsg,
        isLoggedIn: false
      });
      return;
    } else {
      let success = await db_users.createUser({
        email: email,
        hashedPassword: hashedPassword,
        name: name
      });
      if (success.createFlag === true) {
        res.status(201).json({
          message: "User created successfully"
        })
      } else {
        res.status(400).json({
          message: `Failed to create the user ${email}, ${name}`,
          title: "User creation failed",
          errorMsg: success.errorMsg
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error"
    });
  }
});


router.post("/login", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let users = await db_users.getUsers();
  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(400).json({
      message: "You entered the wrong email!"
    })
  }

  const isValidPasword = bcrypt.compareSync(password, user.hashed_password);
  if (isValidPasword) {
    req.session.userID = user.user_id;
    req.session.name = user.name;
    req.session.authenticated = true;
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;
    return res.status(200).json({
      message: "Login successful!",
      user: {
        user_id: user.user_id,
        user_name: user.name,
        email: user.email,
        user_type: user.user_type
      }
    });
  } else {
    req.session.authenticated = false;
    return res.status(400).json({
      message: "Login failed!"
    })
  }

})

router.get('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: "Logout failed"
      })
    } else {
      return res.status(200).json({
        message: "Logged out successfully"
      })
    }
  })
})

module.exports = router;