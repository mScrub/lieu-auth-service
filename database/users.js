const mySqlDatabase = include('databaseConnectionSQL');

async function createUser(postData) {
  let createUserSQL = `
    INSERT INTO user (email, hashed_password, name, user_type_id)
    VALUES (:email, :passwordHash, :name, 
      (SELECT user_type_id
      FROM user_type
      WHERE user_type = "admin"));
	`;

  let params = {
    email: postData.email,
    passwordHash: postData.hashedPassword,
    name: postData.name
  }

  try {
    await mySqlDatabase.query(createUserSQL, params);
    console.log("Successfully created user");
    return {
      createFlag: true
    };
  } catch (err) {
    console.log("Error inserting user");
    console.log(err);
    if (err.message && err.message.includes("Duplicate")) {
      return {
        createFlag: false,
        errorMsg: err.message,
      }
    }
    return false;
  }
}

async function getUsers() {
  let getUsersSQL = `
      SELECT * 
      FROM user
      JOIN user_type 
      ON user.user_type_id = user_type.user_type_id; 
	`;

  try {
    const results = await mySqlDatabase.query(getUsersSQL);
    return results[0];
  } catch (err) {
    console.log("Error getting users");
    console.log(err);
    return false;
  }
}



module.exports = {
  createUser,
  getUsers
};