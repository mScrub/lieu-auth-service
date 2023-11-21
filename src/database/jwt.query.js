const mySqlDatabase = require("./databaseConnectionSQL");

const blackListToken = async (token) => {
  const query = `
    INSERT INTO blacklist_token (token)
    VALUES (:token)
  `;
  const params = { token };
  await mySqlDatabase.query(query, params);
};

const isTokenBlackListed = async (token) => {
  const query = `
    SELECT token FROM blacklist_token
    WHERE token = :token
    `;
  const params = { token };
  const [rows] = await mySqlDatabase.query(query, params);
  return rows.length > 0;
};

module.exports = {
  blackListToken,
  isTokenBlackListed,
};
