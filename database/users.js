const mySqlDatabase = include('databaseConnectionSQL');

async function createUser(postData) {
  let createUserSQL = `
    INSERT INTO user (email, hashed_password, name)
    VALUES (:email, :passwordHash, :name);
	`;

  let params = {
    email: postData.email,
    passwordHash: postData.hashedPassword,
    name: postData.name
  }

	try {
		await mySqlDatabase.query(createUserSQL, params);
        console.log("Successfully created user");
		return true;
	}
	catch(err) {
        console.log("Error inserting user");
        console.log(err);
		return false;
	}
}

async function getUsers() {
	let getUsersSQL = `
		SELECT hashed_password, email, user_id, name
		FROM user;
	`;

  try {
    const results = await mySqlDatabase.query(getUsersSQL);
    return results[0];
  }
  catch (err) {
    console.log("Error getting users");
    console.log(err);
    return false;
  }
}



module.exports = { createUser, getUsers };
