const generateRandomString = () => {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
};

const findEmail = (email, database) => {
  for (let key in database) {
    if (email === database[key].email) {
      return email;
    }
  }
  return undefined;
};

const findUserID = (email, database) => {
  for (let key in database) {
    if (email === database[key].email) {
      return database[key].id;
    }
  }
  return undefined;
};

const findPassword = (email, database) => {
  for (let key in database) {
    if (email === database[key].email) {
      return database[key].password;
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  const userURLs = {};
  for (let url in database) {
    if (id === database[url].userID) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
};

const getUserByEmail = (email, database) => {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return undefined;
};



module.exports = { generateRandomString,findEmail, findPassword, findUserID, urlsForUser, getUserByEmail };