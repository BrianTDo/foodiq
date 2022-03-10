const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant");
const passport = require("passport");
const restaurant = require("../models/restaurant");
const isAuth = require("./auth").isAuth;
const isNotAuth = require("./auth").isNotAuth;
const isLog = require("./auth").isLog;
//Twilio SMS
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);
//Passport middleware
router.use(passport.session());

//All Restaurant Route
router.get("/", isNotAuth, (req, res) => {
  res.render("../index.ejs", {
    isLoggedIn: req.isLogged,
  });
});

//Home Route
router.get("/home", isAuth, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ userid: req.user.id });
    res.render("restaurants/home.ejs", {
      isLoggedIn: req.isLogged,
      name: req.user.name,
      restaurants: restaurants,
    });
  } catch {
    console.log("catch");
    res.render("restaurants/home.ejs", {
      isLoggedIn: req.isLogged,
      name: req.user.name,
      restaurants: null,
    });
  }
});

//New Restaurant Route
router.get("/create", isAuth, (req, res) => {
  res.render("restaurants/create.ejs", {
    isLoggedIn: req.isLogged,
    restaurant: new Restaurant(),
  });
});

//Create Restaurant Route
router.post("/create", async (req, res) => {
  const restaurant = new Restaurant({
    id: Date.now().toString(),
    userid: req.user.id,
    restName: req.body.restName,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    phone: req.body.phone,
  });
  try {
    const newRestaurant = await restaurant.save();
    res.redirect(`${restaurant.id}`);
  } catch {
    res.redirect("create");
  }
});

//Restaurant Route
router.get("/:id", isLog, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    req.isOwner = false;
    //Owner Check
    if (req.user != null) {
      if (req.user.id == restaurant.userid) {
        req.isOwner = true;
      }
    }
    res.render("restaurants/reservation.ejs", {
      isLoggedIn: req.isLogged,
      restaurant: restaurant,
      isOwner: req.isOwner,
    });
  } catch (err) {
    if (restaurant == null) {
      res.redirect("home", { errorMessage: "No restaurant found" });
    }
    console.log(err);
    res.redirect("home");
  }
});

//Accept Reservation
router.post("/:id/accept", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    var customers = restaurant.customers;
    var found = customers.find((customer) => customer.id === req.body.id);

    client.messages
      .create({
        body: `Your table at ${restaurant.restName} is ready!`,
        to: `+${found.phone}`,
        from: "+16206223357",
      })
      .then((message) => console.log(message))
      .catch((error) => console.log(error));
    customers.splice(
      customers.findIndex((customer) => customer.id === req.body.id),
      1
    );
    restaurant.customers = customers;
    await restaurant.save();
    res.redirect(`../${restaurant.id}`);
  } catch (err) {
    if (restaurant == null) {
      res.redirect("home", { errorMessage: "No restaurant found" });
    }
    console.log(err);
    res.redirect("/");
  }
});

//Decline Reservation
router.post("/:id/decline", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    var customers = restaurant.customers;
    var found = customers.find((customer) => customer.id === req.body.id);

    client.messages
      .create({
        body: `Your reservation at ${restaurant.restName} was declined!`,
        to: `+${found.phone}`,
        from: "+16206223357",
      })
      .then((message) => console.log(message))
      .catch((error) => console.log(error));
    customers.splice(
      customers.findIndex((customer) => customer.id === req.body.id),
      1
    );
    restaurant.customers = customers;
    await restaurant.save();
    res.redirect(`../${restaurant.id}`);
  } catch (err) {
    if (restaurant == null) {
      res.redirect("home", { errorMessage: "No restaurant found" });
    }
    console.log(err);
    res.redirect("/");
  }
});

//Reserve route
router.get("/:id/reserve", isLog, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    res.render(`restaurants/reserve.ejs`, {
      isLoggedIn: req.isLogged,
      restaurant: restaurant,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

//Create Reservation
router.post("/:id/reserve", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    var customers = [];
    if (restaurant.customers != "" || null) {
      customers = restaurant.customers;
    }
    customers.push({
      id: Date.now().toString(),
      name: req.body.name,
      phone: req.body.phone,
      party: req.body.party,
    });
    restaurant.customers = customers;
    await restaurant.save();
    res.redirect(`../${restaurant.id}`);
  } catch (err) {
    console.log(err);
    if (customers == null) {
      res.redirect("/");
    }
    res.redirect(`../${restaurant.id}`, {
      errorMessage: "Error in creating reservation",
    });
  }
});

//Edit Route
router.get("/:id/edit", isAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    //Owner Check
    if (req.user.id != restaurant.userid) {
      res.redirect("home");
    } else {
      res.render("restaurants/edit.ejs", {
        isLoggedIn: req.isLogged,
        restaurant: restaurant,
      });
    }
  } catch {
    res.redirect("/");
  }
});

//Update Restuarant
router.put("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    (restaurant.restName = req.body.restName),
      (restaurant.address = req.body.address),
      (restaurant.city = req.body.city),
      (restaurant.state = req.body.state),
      (restaurant.zip = req.body.zip),
      (restaurant.phone = req.body.phone),
      await restaurant.save();
    res.redirect(`${restaurant.id}`);
  } catch {
    res.redirect("home", { errorMessage: "Error updating restaurant" });
  }
});

//Delete Restaurant
router.delete("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    restaurant.delete();
    res.redirect("home");
  } catch {
    res.redirect("home");
  }
});

function getID(id) {
  console.log(id);
  return id;
}

module.exports = router;
