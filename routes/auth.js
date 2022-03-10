
module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.isLogged = true;
    next();
  } else {
    res.redirect("../account/login");
  }
};

module.exports.isNotAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.isLogged = true;
    res.redirect("../restaurants/home");
  } else {
    next();
  }
};

module.exports.isLog = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.isLogged = true;
    next();
  } else {
    req.isLogged = false;
    next();
  }
};

