const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    method: { type: String, required: true },
    name: { type: String, required: true},
    fullname: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String },
    status: { type: String, required: true },
    confirmationCode: { type: String, unique: true },
    totalPoints: { type: Number, required: true},
    userType: { type: String, required: true},
    rank: { type: String, required: true },
    googleId: { type: String },
    bookmarkedGames: { type: Array, required: true },
    soundStatus: { type: Boolean, required: true },
    gameCount: { type: Number, required: true },
    link: {type: String},
    bio: {type: String},
    includeAuthor: { type: Boolean },
    notifyAuthor: { type: Boolean }
})

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);