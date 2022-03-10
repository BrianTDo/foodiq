if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const flash = require("express-flash");
const session = require("express-session");
const bodyParser = require('body-parser');
const methodOverride = require("method-override");

const indexRouter = require("./routes/index");
const accountRouter = require("./routes/account");
const restaurantsRouter = require("./routes/restaurants");

//Set Templating Engine
app.use(expressLayouts)
app.set("layout", "./layouts/layout.ejs")
app.set("view-engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

//Set Mongodb
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
mongoose.connect(process.env.DATABASE_URL, {
  useNewURLParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

//Express Session
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ 
      mongoUrl: process.env.DATABASE_URL,
      collection: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 //Equals 1 day
    }
  })
);

//Routes
app.use('/', indexRouter)
app.use('/account', accountRouter)
app.use('/restaurants', restaurantsRouter)

app.listen(process.env.PORT || 3000);
