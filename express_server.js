const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//ejs
app.set("view engine", "ejs");

const { generateRandomString,findEmail, findPassword, findUserID, urlsForUser } = require("./helpers");

//database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//userDatabase
const users = {
  currentUser: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//GET

//login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session]
  };
  res.render("urls_login", templateVars);
});

//register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session]
  };
  res.render("urls_registration", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`TinyApp app listening on port ${PORT}!`);
});


//main page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session, urlDatabase),
    user: users[req.session]
  };
  res.render("urls_index", templateVars);
});


//new URLs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  if (!req.session["userID"]) {
    res.status(400).send("400 error! Please Login or Register");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("404 not found! This URL doesn't exist");
  } else if (urlDatabase[req.params.shortURL].userID === req.session["userID"]) {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars)
} else if (urlDatabase[req.params.shortURL].userID !== req.session["userID"]) {
  res.status(403).send("403 error! This is not your URL");
} else {
  res.status(400).send("400 error! Please Login");
}
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
    password: password
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
  urlDatabase[shortURL] =  req.body.longURL;
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//edit
app.post("/urls/:id", (req, res) => {
    const shortURL = req.params.id 
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect('/urls');
});   


//delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userEmail = findEmail(email, users);
  const userPassword = findPassword(email, users);
  if (email === userEmail) {
    if (password(password, userPassword)) {
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
  req.session["userID"] = null;
  res.redirect("/urls");
});