const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const passport = require("passport");
const keys = require("../config/keys");x

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

//confirm the user with the returned code
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    let userId = req.user._id.toString();
    res.redirect(`${keys.frontendURL}/auth/${userId}`);
  }
);

module.exports = router;
