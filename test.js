const users = {
  admin: { id: "admin", email: "admin@gmail.com", password: "admin" }
};
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "admin" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "admin" }
};

function urlsForUser(id) {
  let keys = Object.keys(urlDatabase);
  let urls = {};
  for (let i of keys) {
    if (urlDatabase[i].userID === id) {
      urls[i] = urlDatabase[i].longURL;
    }
  }
  return urls;
}

console.log(urlsForUser("admin"));
