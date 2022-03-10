const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const passport = require("passport");
const Account = require("../models/user");
const isNotAuth = require("./auth").isNotAuth;

//Passport middleware
router.use(passport.initialize());
router.use(passport.session());

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => Account.findOne({ email: email }),
  (id) => Account.findOne({ id: id })
);

router.get("/", (req, res) => {
  res.redirect("login");
});

//Login Route
router.get("/login", isNotAuth, (req, res) => {
  res.render("account/login.ejs", {
    isLoggedIn: req.isLogged,
  });
});

//Login using passport-config
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "../restaurants/home",
    failureRedirect: "login",
    failureFlash: true,
  })
);

//Register Route
router.get("/register", isNotAuth, (req, res) => {
  res.render("account/register.ejs", {
    isLoggedIn: req.isLogged,
    account: new Account(),
  });
});

//Create new account
router.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const account = new Account({
    id: Date.now().toString(),
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const newAccount = await account.save();
    res.redirect("login");
  } catch {
    res.redirect("register");
  }
});

//Logout
router.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("../account/login");
});

module.exports = router;
