const express = require("express");
const router = express.Router();
const passport = require("passport");
const isNotAuth = require("./auth").isNotAuth;

//Passport middleware
router.use(passport.session());

router.get("/", isNotAuth, (req, res) => {
  res.render("index.ejs", {
    isLoggedIn: req.isLogged,
  });
});

module.exports = router;
