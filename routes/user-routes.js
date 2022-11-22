const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const userControllers = require("../controllers/user-controllers");

router.post("/allow", [check("email").isEmail()], userControllers.allowUser);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userControllers.userSignup
);

router.post(
  "/login",
  [check("email").isEmail(), check("password").isLength({ min: 6 })],
  userControllers.userLogin
);

router.post("/resend", userControllers.resendToken);

router.get("/confirm/:confirmationCode", userControllers.verifyUser);

router.get("/checkuser/:username", userControllers.checkUser);

router.get("/checkemail/:email", userControllers.checkEmail);

router.get("/checkloginemail/:email", userControllers.checkLoginEmail);

router.post("/resetpass", userControllers.resetPass);

router.post("/sound", userControllers.updateSound);

router.post("/updateuser", userControllers.updateUser);

router.get("/googlelogin/:authId", userControllers.loginWithGoogle);

router.get("/profile/:userId", userControllers.getUser);

router.post("/updatescore", userControllers.updateScore);

router.post(
  "/updatepass",
  [check("password").isLength({ min: 6 })],

  userControllers.updatePass
);

module.exports = router;
