const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const gameSchema = new Schema({
        category: { type: String, required: true },
        cleverTitle: { type: String, required: true },
        author: { type: String, required: true },
        q1: {
            prompt: { type: String, required: true },
            solution: { type: String, required: true },
            fake: { type: String, required: true },
            deepfake: { type: String, required: true },
            source: { type: String }
        },
        q2: {
            prompt: { type: String, required: true },
            solution: { type: String, required: true },
            fake: { type: String, required: true },
            deepfake: { type: String, required: true },
            source: { type: String }
        },
        q3: {
            prompt: { type: String, required: true },
            solution: { type: String, required: true },
            fake: { type: String, required: true },
            deepfake: { type: String, required: true },
            source: { type: String }
        },
        gameStatus: { type: String, required: true },
        reviewed: { type: Boolean, required: true }
});


module.exports = mongoose.model('Game', gameSchema);