const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const users = {
  admin: { id: "admin", email: "admin@gmail.com", password: "admin" }
};
let templateVars = { user: users[0] };
var cookieParser = require("cookie-parser");
app.use(cookieParser());

//function to generate random 6 char string
function generateRandomString() {
  const vals =
    "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,1,2,3,4,5,6,7,8,9";
  const valArr = vals.split(",");
  let final = "";
  for (let i = 0; i < 6; i++) {
    let rand = Math.floor(Math.random() * valArr.length - 1);
    final += valArr[rand];
  }
  return final;
}

//function to check if id is unique
function idCheck(id, database) {
  for (let item in database) {
    if (item === id) {
      return false;
    }
  }
  return true;
}

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

//url database
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "admin" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "admin" }
};

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
  if (!req.cookies.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new");
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
  urlDatabase[short] = req.body.longURL;
  console.log(req.body);
  res.redirect(`/urls/${short}`);
});

//Registration page
app.get("/register", (req, res) => {
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let bool = idCheck(userID, users);
  let email = req.body.email;
  let pass = req.body.password;
  if (!email) {
    res.status(400).send("No email entered");
  } else if (!pass) {
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
  res.cookie("user_id", userID);
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
  } else {
    if (
      lookUp(req.body.password, users, "password") &&
      lookUp(req.body.email, users, "email")
    ) {
      let id = lookUp(req.body.email, users, "");
      res.cookie("user_id", id);
      res.redirect("/urls");
    }
  }
  res.status(403).send("Incorrect Password");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//edit url
app.post("/urls/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  urlDatabase[short] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL.split(4) !== "http") {
    longURL = `http://${urlDatabase[req.params.shortURL]}`;
  }
  res.redirect(longURL);
});

// main page
app.get("/urls", (req, res) => {
  let userObj = users[req.cookies["user_id"]];
  let url;
  if (req.cookies["user_id"]) {
    url = urlsForUser(req.cookies["user_id"]);
  }
  templateVars = { user: userObj, urls: url };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userObj = users[req.cookies["user_id"]];
  templateVars = {
    user: userObj,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
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
