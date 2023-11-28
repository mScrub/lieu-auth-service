const mySqlDatabase = require("./databaseConnectionSQL");

async function createUser(postData) {
  let createUserSQL = `
    INSERT INTO user (email, hashed_password, username, user_type_id)
    VALUES (:email, :passwordHash, :username, 
      (SELECT user_type_id
      FROM user_type
      WHERE user_type = "USER"));
	`;

  let params = {
    email: postData.email,
    passwordHash: postData.hashedPassword,
    username: postData.username,
  };

  try {
    const results = await mySqlDatabase.query(createUserSQL, params);
    return {
      createFlag: true,
      insertId: results[0].insertId,
    };
  } catch (err) {
    if (err.message && err.message.includes("Duplicate")) {
      return {
        createFlag: false,
        errorMsg: "username already exists",
      };
    }
    console.log(err);
    return false;
  }
}

async function getUser(username) {
  let getUsersSQL = `
      SELECT * 
      FROM user
      JOIN user_type 
      ON user.user_type_id = user_type.user_type_id
      WHERE user.username = :username
	`;

  const param = { username: username };

  try {
    const results = await mySqlDatabase.execute(getUsersSQL, param);
    return results[0][0];
  } catch (err) {
    console.log("Error getting users");
    console.log(err);
    return false;
  }
}

const updateUserType = async (user_id, user_type) => {
  const query = `
    UPDATE user
    SET user_type_id = (SELECT user_type_id FROM user_type WHERE user_type = :user_type)
    WHERE user_id = :user_id;
  `;
  const params = {
    user_id: user_id,
    user_type: user_type,
  };
  const results = await mySqlDatabase.query(query, params);
  return results[0][0];
};

module.exports = {
  createUser,
  getUser,
  updateUserType,
};
