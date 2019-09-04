const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const users = {
  admin: { id: "admin", email: "admin@gmail.com", password: "admin" }
};
let templateVars = { user: users[0] };
var cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "user_id",
    keys: ["sss", "rrr"]
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//url database
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "admin" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "admin" }
};

//function to check if id is unique
function idCheck(id, database) {
  for (let item in database) {
    if (item === id) {
      return false;
    }
  }
  return true;
}
//function to generate random 6 char string
function generateRandomString() {
  const vals = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  const valArr = vals.split("");
  let final = "";
  for (let i = 0; i < 6; i++) {
    let rand = Math.floor(Math.random() * valArr.length - 1);
    final += valArr[rand];
  }
  return final;
}

//function to filter urls by id
function urlsForUser(id) {
  let keys = Object.keys(urlDatabase);
  let urls = {};
  for (let i of keys) {
    if (urlDatabase[i].userID === id) {
      urls[i] = urlDatabase[i];
    }
  }
  return urls;
}

//Create new url page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let userObj = users[req.session.user_id];
    templateVars = { user: userObj };
    res.render("urls_new", templateVars);
  }
});

//post method for main page
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let bool = idCheck(short, urlDatabase);
  while (bool === false) {
    short = generateRandomString();
    bool = idCheck(short, urlDatabase);
  }
  urlDatabase[short] = req.body;
  urlDatabase[short].userID = req.session.user_id;
  res.redirect(`/urls/${short}`);
});

//email lookup
function lookUp(email, users, key) {
  let keys = Object.keys(users);
  if (key === "") {
    for (let i of keys) {
      if (email === users[i].email) {
        return i;
      }
    }
  }
  for (let i of keys) {
    if (email === users[i][key]) {
      return true;
    }
  }
  return false;
}

//Registration page
app.get("/register", (req, res) => {
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let bool = idCheck(userID, users);
  let email = req.body.email;
  let pass = bcrypt.hashSync(req.body.password, 10);
  if (!email) {
    res.status(400).send("No email entered");
  }
  if (!pass) {
    res.status(400).send("No password entered");
  }
  let emailCheck = lookUp(email, users, "email");
  if (emailCheck === true) {
    res.status(400).send("Email already exists");
  }
  while (bool === false) {
    userID = generateRandomString();
    bool = idCheck(userID, users);
  }
  users[userID] = { id: userID, email: email, password: pass };
  req.session.user_id = userID;
  res.redirect("/urls");
});

//login page
app.get("/login", (req, res) => {
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let emailCheck = lookUp(req.body.email, users, "email");
  if (emailCheck === false) {
    res.status(403).send("Cannot find email");
  } else if (
    users[lookUp(req.body.email, users, "")].email == req.body.email &&
    bcrypt.compareSync(
      req.body.password,
      users[lookUp(req.body.email, users, "")].password
    )
  ) {
    let id = lookUp(req.body.email, users, "");
    req.session.user_id = id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Incorrect Password");
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.redirect("/urls");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

//edit url
app.post("/urls/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  if (req.session.user_id !== urlDatabase[short].userID) {
    res.redirect("/urls");
  } else {
    urlDatabase[short].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

//redirecting to url
app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let longURL = urlDatabase[short].longURL;
  res.redirect(longURL);
});

// main page
app.get("/urls", (req, res) => {
  let userObj = users[req.session.user_id];
  let url;
  if (req.session.user_id) {
    url = urlsForUser(req.session.user_id);
  }
  templateVars = { user: userObj, urls: url };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userObj = users[req.session.user_id];
  templateVars = {
    user: userObj,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: urlDatabase[req.params.shortURL].userID
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body> Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
