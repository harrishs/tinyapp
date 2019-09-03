const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

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

function idCheck(id, database) {
  if (id === database) {
    return false;
  }
}

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let bool = false;
  let short = generateRandomString();
  while (bool === false) {
    let short = generateRandomString();
    for (item in urlDatabase) {
      bool = idCheck(short, item);
    }
  }
  urlDatabase[short] = req.body.longURL;
  console.log(req.body);
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  console.log(short);
  urlDatabase[short] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL.split(4) !== "http") {
    longURL = `http://${urlDatabase[req.params.shortURL]}`;
  }
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
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
