const { validationResult } = require("express-validator");
const LogError = require("../models/handle-errors");
const uuid = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const postmailer = require("../mail/postmark.config");
const User = require("../models/user");
const Allow = require("../models/allow-user");

const userSignup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      LogError(
        "Invalid inputs, please enter valid name, email, and password",
        422
      )
    );
  }

  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new LogError("Email already exists, try signing in.", 422);
    res.status(422).json({
      message: "A user already exists with this email, try signing in.",
    });
    return next(error);
  }

  let hashedPass;

  try {
    hashedPass = await bcrypt.hash(password, 10);
  } catch (err) {
    const error = new LogError(
      "Something went wrong while creating user password",
      500
    );
    return next(error);
  }

  //create temp jwt
  let token;

  try {
    token = jwt.sign({ email: email, password: hashedPass }, "top-secret-key", {
      expiresIn: "1h",
    });
  } catch (err) {
    const error = new LogError(
      "Oops, something went wrong creating a user.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    method: "email",
    name,
    fullname: name,
    email,
    password: hashedPass,
    status: "Pending",
    confirmationCode: token,
    totalPoints: 0,
    userType: "User",
    rank: "Seedling",
    googleId: "",
    bookmarkedGames: [],
    soundStatus: true,
    gameCount: 0,
    includeAuthor: true,
    notifyAuthor: true,
  });

  try {
    await createdUser.save();
    postmailer.sendConfirmation(
      createdUser.name,
      createdUser.email,
      createdUser.confirmationCode
    );

    res.status(201).json({
      userId: createdUser.id,
      email: createdUser.email,
      message: "Please check your email",
      sound: createdUser.soundStatus,
    });
  } catch (err) {
    const error = new LogError(
      "Oops, something went wrong creating a user.",
      500
    );
    return next(error);
  }
};

const allowUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      LogError(
        "Invalid inputs, please enter valid name, email, and password",
        422
      )
    );
  }

  const { email } = req.body;

  let existingUser;

  try {
    existingUser = await Allow.findOne({ email: email });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new LogError("Email already exists, try signing in.", 422);
    res.status(422).json({
      message: "This email is already on the waitlist.",
    });
    return next(error);
  }

  const createdUser = new Allow({
    email,
  });

  try {
    await createdUser.save();
    postmailer.sendAllowConfirmation(createdUser.email);

    res.status(201).json({
      email: createdUser.email,
      message: "Please check your email",
    });
  } catch (err) {
    const error = new LogError(
      "Oops, something went wrong creating a user.",
      500
    );
    return next(error);
  }
};

const verifyUser = async (req, res, next) => {
  const confirmationCode = req.params.confirmationCode;

  const existingUser = await User.findOne({
    confirmationCode: confirmationCode,
  });

  if (!existingUser) {
    return res.status(404).send({ message: "User not found..." });
  }

  existingUser.status = "Active";
  await existingUser.save();
  res
    .status(201)
    .send({ message: "everything worked", email: existingUser.email });
};

const userLogin = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      LogError("Invalid inputs, please enter valid email, and password", 422)
    );
  }

  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new LogError("Failed to fetch user.", 500);
    return next(error);
  }

  if (existingUser.googleId) {
    return res.status(401).send({
      google: true,
    });
  }

  if (!existingUser) {
    const error = new LogError("Sorry, invalid credentials", 403);
    return next(error);
  }

  let isValidPass = false;

  try {
    isValidPass = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new LogError("Could not log you in.", 500);
    return next(error);
  }

  if (!isValidPass) {
    return res.json({ badpass: true });
  }

  if (existingUser.status !== "Active") {
    return res.status(401).send({
      message: "Pending account. Please verify your email.",
    });
  }

  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "top-secret-key",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new LogError("Oops, something went wrong logging in.", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    userType: existingUser.userType,
    rank: existingUser.rank,
    token: token,
    fullname: existingUser.fullname,
    sound: existingUser.soundStatus,
    gameCount: existingUser.gameCount,
  });
};

const loginWithGoogle = async (req, res, next) => {
  const authId = req.params.authId;

  let existingUser;

  try {
    existingUser = await User.findOne({ _id: authId });
  } catch (err) {
    const error = new LogError("Failed to fetch user.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new LogError("Sorry, invalid credentials", 403);
    return next(error);
  }

  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "top-secret-key",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new LogError("Oops, something went wrong logging in.", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    userType: existingUser.userType,
    fullname: existingUser.fullname,
    sound: existingUser.soundStatus,
    gameCount: existingUser.gameCount,
  });
};

const resendToken = async (req, res, next) => {
  const { email } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new LogError("Failed to fetch user.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new LogError("Sorry, invalid credentials", 403);
    return next(error);
  }

  //create temp jwt
  let token;

  try {
    token = jwt.sign({ email: email }, "top-secret-key", { expiresIn: "1h" });
  } catch (err) {
    const error = new LogError(
      "Oops, something went wrong creating a user.",
      500
    );
    return next(error);
  }

  existingUser.confirmationCode = token;

  try {
    await existingUser.save();

    postmailer.sendConfirmation(
      existingUser.name,
      existingUser.email,
      existingUser.confirmationCode
    );

    res
      .status(201)
      .json({ email: existingUser.email, message: "Please check your email" });
  } catch (err) {
    const error = new LogError("Oops, something went wrong resending..", 500);
    return next(error);
  }
};

const checkUser = async (req, res, next) => {
  const username = req.params.username;

  let existingUser;

  try {
    existingUser = await User.findOne({ name: username });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new LogError("Username not available", 422);
    res.status(422).json({ message: "Username not available" });
    return next(error);
  } else {
    res.status(201).json({ message: "You're good to go!" });
  }
};

const checkEmail = async (req, res, next) => {
  email = req.params.email;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new LogError("User already exists.", 500);
    return next(error);
  }

  return res.status(201).json({ message: "good to go" });
};

const checkLoginEmail = async (req, res, next) => {
  const email = req.params.email;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new LogError("User does not exist", 500);
    return next(error);
  }

  if (existingUser.googleId) {
    const error = new LogError("User is using google", 500);
    return next(error);
  }

  if (existingUser.status === "Pending") {
    return res.send({ status: "Pending" });
  } else {
    return res.send({ status: "Active" });
  }
};

const resetPass = async (req, res, next) => {
  const { email } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  //create temp jwt
  let token;

  try {
    token = jwt.sign({ email: email }, "top-secret-key", { expiresIn: "1h" });
  } catch (err) {
    const error = new LogError("Oops, something went wrong.", 500);
    return next(error);
  }

  existingUser.confirmationCode = token;

  try {
    await existingUser.save();

    postmailer.sendReset(
      existingUser.name,
      existingUser.email,
      existingUser.confirmationCode
    );

    res
      .status(201)
      .json({ email: existingUser.email, message: "Please check your email" });
  } catch (err) {
    const error = new LogError("Oops, something went wrong resending..", 500);
    return next(error);
  }
};

const updatePass = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(LogError("Invalid inputs, please enter password length", 422));
  }

  const { password, email } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  let hashedPass;

  try {
    hashedPass = await bcrypt.hash(password, 10);
  } catch (err) {
    const error = new LogError(
      "Something went wrong while creating user password",
      500
    );
    return next(error);
  }

  existingUser.password = hashedPass;

  try {
    await existingUser.save();
  } catch (err) {
    const error = new LogError(
      "Oops, something went wrong creating a user.",
      500
    );
    return next(error);
  }

  res.json({ email: existingUser.email });
};

const getUser = async (req, res, next) => {
  const userId = req.params.userId;

  let existingUser;

  try {
    existingUser = await User.findOne({ _id: userId });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  res.json({
    rank: existingUser.rank,
    totalPoints: existingUser.totalPoints,
    name: existingUser.name,
    email: existingUser.email,
  });
};

const updateSound = async (req, res, next) => {
  const { sound, uid } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ _id: uid });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  existingUser.soundStatus = sound;

  try {
    await existingUser.save();
  } catch {
    const error = new LogError("Didn't manage to update sound", 500);
    return next(error);
  }
  res.status(201).json({ soundResponse: existingUser.soundStatus });
};

const updateUser = async (req, res, next) => {
  const { name, uid } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ _id: uid });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  if (name) {
    existingUser.name = name;
  }

  try {
    await existingUser.save();
  } catch {
    const error = new LogError("Didn't manage to update sound", 500);
    return next(error);
  }
  res.status(201).json({ updatedUsername: existingUser.name });
};

const updateScore = async (req, res, next) => {
  const { uid, score } = req.body;

  let existingUser;
  let userRank;

  try {
    existingUser = await User.findOne({ _id: uid });
  } catch (err) {
    const error = new LogError("Didn't manage to connect to db", 500);
    return next(error);
  }

  let currentPoints = existingUser.totalPoints;

  const newScore = currentPoints + score;

  existingUser.totalPoints = newScore;

  if (newScore < 10000) {
    userRank = "Seedling";
  } else if (newScore < 30000) {
    userRank = "Sapling";
  } else if (newScore < 50000) {
    userRank = "Pollinator";
  } else if (newScore < 100000) {
    userRank = "Tree of Knowledge";
  } else if (newScore < 1000000) {
    userRank = "Eater of Forbidden Fruit";
  } else {
    userRank = "Dirtbag";
  }

  existingUser.rank = userRank;

  try {
    existingUser.save();
  } catch (err) {
    const error = new LogError("Could not update points", 500);
    return next(error);
  }

  res.status(201).json({ totalScore: existingUser.totalPoints });
};

exports.userSignup = userSignup;
exports.allowUser = allowUser;
exports.userLogin = userLogin;
exports.loginWithGoogle = loginWithGoogle;
exports.verifyUser = verifyUser;
exports.resendToken = resendToken;
exports.checkUser = checkUser;
exports.checkEmail = checkEmail;
exports.resetPass = resetPass;
exports.updatePass = updatePass;
exports.checkLoginEmail = checkLoginEmail;
exports.getUser = getUser;
exports.updateSound = updateSound;
exports.updateUser = updateUser;
exports.updateScore = updateScore;
