const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const LogError = require("../models/handle-errors");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const User = mongoose.model("User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: keys.googleCallbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let token;
        try {
          token = jwt.sign(
            { email: profile.emails[0].value },
            "top-secret-key",
            { expiresIn: "1h" }
          );
        } catch (err) {
          const error = new LogError(
            "Oops, something went wrong creating a user.",
            500
          );
          return next(error);
        }

        const existingGoogleUser = await User.findOne({ googleId: profile.id });

        if (existingGoogleUser) {
          return done(null, existingGoogleUser);
        }

        const existingEmailUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingEmailUser) {
          existingEmailUser.method = "google";
          existingEmailUser.googleId = profile.id;

          await existingEmailUser.save();
          done(null, existingEmailUser);
        } else {
          const newUser = new User({
            method: "google",
            name: profile.displayName,
            fullname: profile.displayName,
            email: profile.emails[0].value,
            status: "Active",
            confirmationCode: token,
            totalPoints: 0,
            userType: "User",
            rank: "Seedling",
            googleId: profile.id,
            bookmarkedGames: [],
            soundStatus: true,
            gameCount: 0,
            includeAuthor: true,
            notifyAuthor: true,
          });
          await newUser.save();
          done(null, newUser);
        }
      } catch (err) {
        const error = new LogError(
          "failed to create new user wiht Google",
          500
        );
        return done(error, false);
      }
    }
  )
);
