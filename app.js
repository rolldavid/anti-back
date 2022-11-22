const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");

const keys = require("./config/keys");
const userRoutes = require("./routes/user-routes");
const triviaRoutes = require("./routes/trivia-routes");
const authRoutes = require("./routes/auth-routes");

require("./models/user");
require("./services/passport");
require("./services/cron");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

app.use(passport.initialize());

app.use("/api/users", userRoutes);
app.use("/api/trivia", triviaRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5001;

mongoose
  .connect(keys.mongoURI)
  .then(() => {
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });
