//email lookup
module.exports = function lookUp(email, users, key) {
  let keys = Object.keys(users);
  if (key === "") {
    for (let i of keys) {
      if (email === users[i].email) {
        return i;
      } else {
        return false;
      }
    }
  } else {
    for (let i of keys) {
      if (email === users[i][key]) {
        return true;
      }
    }
    return false;
  }
};
