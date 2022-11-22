const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const triviaControllers = require('../controllers/trivia-controllers');

router.post('/newgame', triviaControllers.newGame);
router.post('/updategame', triviaControllers.updateGame)
router.get('/getquestions', triviaControllers.getQuestions)
router.get('/secretgame', triviaControllers.getEncryptedGame)
router.post('/sol', triviaControllers.newSol)
router.get('/practice', triviaControllers.getPractice)
router.get('/bookmarked/:uid', triviaControllers.getBookmarked)
router.post('/addbookmark', triviaControllers.addBookmark)
router.post('/removebookmark', triviaControllers.removeBookmark)
router.post('/checkbookmark', triviaControllers.checkBookmark)
router.post('/searchbookmark', triviaControllers.searchBookmarks)


module.exports = router;