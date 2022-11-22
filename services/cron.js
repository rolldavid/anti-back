const LogError = require('../models/handle-errors');
const Game = require('../models/game');
const cron = require('node-cron');
const game = require('../models/game');

cron.schedule('0 0 0 * * *', async () => {
    let categories;

    try {
        categories = await Game.find({gameStatus: "current" })
    } catch (err) {
        console.log(err)
    }

    for (const cat of categories) {
        cat.gameStatus = "archived"
        try {
            await cat.save();
        } catch (err) {
            console.log(err)
        }
    }

    let backlogCategory;
    let nextGame;

    
    backlogCategory = await Game.aggregate([ 
        {$match: {gameStatus: "backlog", reviewed: true }},
        {$sample: { size: 1}}
    ])
    nextGame = await Game.findOne({_id: backlogCategory[0]._id});
    nextGame.gameStatus = "current"
    nextGame.save();

   
    backlogCategory = await Game.aggregate([ 
        {$match: {gameStatus: "backlog", reviewed: true }},
        {$sample: { size: 1}}
    ])
    nextGame = await Game.findOne({_id: backlogCategory[0]._id});
    nextGame.gameStatus = "current"
    nextGame.save();

    
    backlogCategory = await Game.aggregate([ 
        {$match: {gameStatus: "backlog", reviewed: true }},
        {$sample: { size: 1}}
    ])
    nextGame = await Game.findOne({_id: backlogCategory[0]._id});
    nextGame.gameStatus = "current"
    nextGame.save();
    
}, {
    scheduled: true,
    timezone: "America/New_York"
  })

