const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const {
  generateRandomString,
  findEmail,
  findPassword,
  findUserID,
  urlsForUser,
  getUserByEmail,
} = require("./helpers");

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["userID"],
  })
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//ejs
app.set("view engine", "ejs");

//database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
};

//userDatabase
const users = {
  currentUser: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("2", saltRounds),
  },
};

//GET

//homepage
app.get("/", (req, res) => {
  res.redirect("/login");
});

//login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["userID"]],
  };
  res.render("urls_login", templateVars);
});

//register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session],
  };
  res.render("urls_registration", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//main page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session["userID"], urlDatabase),
    user: users[req.session["userID"]],
  };
  res.render("urls_index", templateVars);
});

//new URLs
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session["userID"]],
  };
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session["userID"];
  const user = users[userID];
  if (!req.session["userID"]) {
    res.status(400).send("400 error! Please Login or Register");
  } else if (!urlDatabase[shortURL]) {
    res.status(404).send("404 not found! This URL doesn't exist");
  } else if (urlDatabase[shortURL].userID === req.session["userID"]) {
    const templateVars = {
      id: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user,
    };
    res.render("urls_show", templateVars);
  } else if (urlDatabase[shortURL].userID !== req.session["userID"]) {
    res.status(403).send("403 error! This is not your URL");
  } else {
    res.status(400).send("400 error! Please Login");
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//POST

//register new user
app.post("/register", (req, res) => {
  const newUserID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const userObj = {
    id: newUserID,
    email: email,
    password: bcrypt.hashSync(password, saltRounds),
  };
  const userEmail = findEmail(email, users);
  if (userObj.email === "" || userObj.password === "") {
    res.status(400).send("400 error! Please Provide Your Information");
  } else if (!userEmail) {
    users[newUserID] = userObj;
    req.session["userID"] = newUserID;
    res.redirect("/urls");
  } else {
    res.status(400).send("400 error! Please Login");
  }
});

//random string and add urls to database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  console.log(req.body, shortURL); // Log the POST request body to the console
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["userID"],
  };
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

//edit
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session["userID"]) {
    const shortURL = req.params.id;
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("Not permitted");
  }
});

//delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  if (urlDatabase[req.params.shortURL].userID === req.session["userID"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Not permitted");
  }
});

//login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userEmail = findEmail(email, users);
  const userPassword = findPassword(email, users);
  if (email === userEmail) {
    if (bcrypt.compareSync(password, userPassword)) {
      const userID = findUserID(email, users);
      req.session["userID"] = userID;
      res.redirect("/urls");
    } else {
      res.status(403).send("403 Forbidden: Wrong Password");
    }
  } else {
    res.status(403).send("403 Forbidden : Please Register");
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp app listening on port ${PORT}!`);
});
