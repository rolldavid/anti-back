
const LogError = require('../models/handle-errors');
const Game = require('../models/game');
const User = require('../models/user');
const { trusted } = require('mongoose');
const CryptoJS = require("crypto-js");

const newGame = async (req, res, next) => {

    const { 
        scategory,
        sauthor,
        sq1prompt,
        sq1solution,
        sq1fake,
        sq1deepfake,
        sq1source,
        sq2prompt,
        sq2solution,
        sq2fake,
        sq2deepfake,
        sq2source,
        sq3prompt,
        sq3solution,
        sq3fake,
        sq3deepfake,
        sq3source
    } = req.body;

    const q1 = {
        prompt: sq1prompt,
        solution: sq1solution,
        fake: sq1fake,
        deepfake: sq1deepfake,
        source: sq1source
    }

    const q2 = {
        prompt: sq2prompt,
        solution: sq2solution,
        fake: sq2fake,
        deepfake: sq2deepfake,
        source: sq2source
    }

    const q3 = {
        prompt: sq3prompt,
        solution: sq3solution,
        fake: sq3fake,
        deepfake: sq3deepfake,
        source: sq3source
    }
    
    const createdGame = new Game({
            category: scategory,
            cleverTitle: scategory,
            author: sauthor,
            q1,
            q2,
            q3,
            gameStatus: "backlog", 
            reviewed: false
    })

    try {
        await createdGame.save();
        res.status(201).json({author: createdGame.author }) 
    } catch (err) {
        const error = new LogError('oooooops', 500)
        return next(error)
    }
    
}

const updateGame = async (req, res, next) => {
    const { 
        gameId,
        scategory,
        scleverTitle,
        sauthor,
        sq1prompt,
        sq1solution,
        sq1fake,
        sq1deepfake,
        sq1source,
        sq2prompt,
        sq2solution,
        sq2fake,
        sq2deepfake,
        sq2source,
        sq3prompt,
        sq3solution,
        sq3fake,
        sq3deepfake,
        sq3source
    } = req.body;

    const q1 = {
        prompt: sq1prompt,
        solution: sq1solution,
        fake: sq1fake,
        deepfake: sq1deepfake,
        source: sq1source
    }

    const q2 = {
        prompt: sq2prompt,
        solution: sq2solution,
        fake: sq2fake,
        deepfake: sq2deepfake,
        source: sq2source
    }

    const q3 = {
        prompt: sq3prompt,
        solution: sq3solution,
        fake: sq3fake,
        deepfake: sq3deepfake,
        source: sq3source
    }


    let existingGame;

    try {
        existingGame = await Game.findOne({_id: gameId });
    } catch (err) {
        const error = new LogError('Didn\'t manage to connect to db', 500);
        return next(error);
    }

    if (!existingGame) {
        const error = new LogError('Didn\'t manage to find game', 500);
        return next(error);
    }
    
    existingGame.category = scategory;
    existingGame.cleverTitle = scleverTitle;
    existingGame.q1 = q1;
    existingGame.q2 = q2;
    existingGame.q3 = q3;
    existingGame.reviewed = true;

    try {
        await existingGame.save();
        
    } catch (err) {
        const error = new LogError('oooooops', 500)
        return next(error)
    }
    res.status(201).json({success: true }) 
}

const getQuestions = async (req, res, next) => {

    let category;

    try {
        category = await Game.findOne({reviewed: false })
    } catch (err) {
        const error = new LogError('Didn\'t manage to connect to db', 500)
        return next(error)
    }

    if (!category) {
        res.status(201).json({status: false})
    }

    res.status(201).json({ category, status: true })
}


const getEncryptedGame = async (req, res, next) => {

    let categories;

    try {
        categories = await Game.find({gameStatus: "current" })
    } catch (err) {
        const error = new LogError('Didn\'t manage to connect to db', 500)
        return next(error)
    }

    if (!categories) {
        const error = new LogError('No more games available to play', 422)
        return next(error)
    }
    
    const scramble = (array) => {
        let currentIndex = array.length,  randomIndex;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    const scrambleCat1Q1 = scramble([categories[0].q1.solution, categories[0].q1.fake, categories[0].q1.deepfake]);
    const scrambleCat1Q2 = scramble([categories[0].q2.solution, categories[0].q2.fake, categories[0].q2.deepfake]);
    const scrambleCat1Q3 = scramble([categories[0].q3.solution, categories[0].q3.fake, categories[0].q3.deepfake]);

    const scrambleCat2Q1 = scramble([categories[1].q1.solution, categories[1].q1.fake, categories[1].q1.deepfake]);
    const scrambleCat2Q2 = scramble([categories[1].q2.solution, categories[1].q2.fake, categories[1].q2.deepfake]);
    const scrambleCat2Q3 = scramble([categories[1].q3.solution, categories[1].q3.fake, categories[1].q3.deepfake]);

    const scrambleCat3Q1 = scramble([categories[2].q1.solution, categories[2].q1.fake, categories[2].q1.deepfake]);
    const scrambleCat3Q2 = scramble([categories[2].q2.solution, categories[2].q2.fake, categories[2].q2.deepfake]);
    const scrambleCat3Q3 = scramble([categories[2].q3.solution, categories[2].q3.fake, categories[2].q3.deepfake]);

    const cat1 = {
        category: categories[0].category,
        author: categories[0].author,
        q1: {
            prompt: categories[0].q1.prompt,
            a1: scrambleCat1Q1[0],
            a2: scrambleCat1Q1[1],
            a3: scrambleCat1Q1[2],
        },
        q2: {
            prompt: categories[0].q2.prompt,
            a1: scrambleCat1Q2[0],
            a2: scrambleCat1Q2[1],
            a3: scrambleCat1Q2[2],
        },
        q3: {
            prompt: categories[0].q3.prompt,
            a1: scrambleCat1Q3[0],
            a2: scrambleCat1Q3[1],
            a3: scrambleCat1Q3[2],
        },
        id: categories[0].id
    }

    const cat2 = {
        category: categories[1].category,
        author: categories[1].author,
        q1: {
            prompt: categories[1].q1.prompt,
            a1: scrambleCat2Q1[0],
            a2: scrambleCat2Q1[1],
            a3: scrambleCat2Q1[2],
        },
        q2: {
            prompt: categories[1].q2.prompt,
            a1: scrambleCat2Q2[0],
            a2: scrambleCat2Q2[1],
            a3: scrambleCat2Q2[2],
        },
        q3: {
            prompt: categories[1].q3.prompt,
            a1: scrambleCat2Q3[0],
            a2: scrambleCat2Q3[1],
            a3: scrambleCat2Q3[2],
        },
        id: categories[1].id
    }

    const cat3 = {
        category: categories[2].category,
        author: categories[2].author,
        q1: {
            prompt: categories[2].q1.prompt,
            a1: scrambleCat3Q1[0],
            a2: scrambleCat3Q1[1],
            a3: scrambleCat3Q1[2],
        },
        q2: {
            prompt: categories[2].q2.prompt,
            a1: scrambleCat3Q2[0],
            a2: scrambleCat3Q2[1],
            a3: scrambleCat3Q2[2],
        },
        q3: {
            prompt: categories[2].q3.prompt,
            a1: scrambleCat3Q3[0],
            a2: scrambleCat3Q3[1],
            a3: scrambleCat3Q3[2],
        },
        id: categories[2].id
    }

    const cat1encrypt = CryptoJS.AES.encrypt(JSON.stringify(cat1), 'antitriv').toString();
    const cat2encrypt = CryptoJS.AES.encrypt(JSON.stringify(cat2), 'antitriv').toString();
    const cat3encrypt = CryptoJS.AES.encrypt(JSON.stringify(cat3), 'antitriv').toString();

    res.status(201).json({cat1: cat1encrypt, cat2: cat2encrypt, cat3: cat3encrypt}) 
}


const getPractice = async (req, res, next) => {

    let categoriesOrdered;

    try {
        categoriesOrdered = await Game.find({gameStatus: "archived" })
    } catch (err) {
        const error = new LogError('Didn\'t manage to connect to db', 500)
        return next(error)
    }

    if (!categoriesOrdered) {
        const error = new LogError('No more games available to play', 422)
        return next(error)
    }

    
    const scramble = (array) => {
        let currentIndex = array.length,  randomIndex;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    const categories = scramble(categoriesOrdered)

    const scrambleCat1Q1 = scramble([categories[0].q1.solution, categories[0].q1.fake, categories[0].q1.deepfake]);
    const scrambleCat1Q2 = scramble([categories[0].q2.solution, categories[0].q2.fake, categories[0].q2.deepfake]);
    const scrambleCat1Q3 = scramble([categories[0].q3.solution, categories[0].q3.fake, categories[0].q3.deepfake]);

    const scrambleCat2Q1 = scramble([categories[1].q1.solution, categories[1].q1.fake, categories[1].q1.deepfake]);
    const scrambleCat2Q2 = scramble([categories[1].q2.solution, categories[1].q2.fake, categories[1].q2.deepfake]);
    const scrambleCat2Q3 = scramble([categories[1].q3.solution, categories[1].q3.fake, categories[1].q3.deepfake]);

    const scrambleCat3Q1 = scramble([categories[2].q1.solution, categories[2].q1.fake, categories[2].q1.deepfake]);
    const scrambleCat3Q2 = scramble([categories[2].q2.solution, categories[2].q2.fake, categories[2].q2.deepfake]);
    const scrambleCat3Q3 = scramble([categories[2].q3.solution, categories[2].q3.fake, categories[2].q3.deepfake]);
    
    const cat1 = {
        category: categories[0].category,
        author: categories[0].author,
        q1: {
            prompt: categories[0].q1.prompt,
            a1: scrambleCat1Q1[0],
            a2: scrambleCat1Q1[1],
            a3: scrambleCat1Q1[2],
        },
        q2: {
            prompt: categories[0].q2.prompt,
            a1: scrambleCat1Q2[0],
            a2: scrambleCat1Q2[1],
            a3: scrambleCat1Q2[2],
        },
        q3: {
            prompt: categories[0].q3.prompt,
            a1: scrambleCat1Q3[0],
            a2: scrambleCat1Q3[1],
            a3: scrambleCat1Q3[2],
        },
        id: categories[0].id
    }

    const cat2 = {
        category: categories[1].category,
        author: categories[1].author,
        q1: {
            prompt: categories[1].q1.prompt,
            a1: scrambleCat2Q1[0],
            a2: scrambleCat2Q1[1],
            a3: scrambleCat2Q1[2],
        },
        q2: {
            prompt: categories[1].q2.prompt,
            a1: scrambleCat2Q2[0],
            a2: scrambleCat2Q2[1],
            a3: scrambleCat2Q2[2],
        },
        q3: {
            prompt: categories[1].q3.prompt,
            a1: scrambleCat2Q3[0],
            a2: scrambleCat2Q3[1],
            a3: scrambleCat2Q3[2],
        },
        id: categories[1].id
    }

    const cat3 = {
        category: categories[2].category,
        author: categories[2].author,
        q1: {
            prompt: categories[2].q1.prompt,
            a1: scrambleCat3Q1[0],
            a2: scrambleCat3Q1[1],
            a3: scrambleCat3Q1[2],
        },
        q2: {
            prompt: categories[2].q2.prompt,
            a1: scrambleCat3Q2[0],
            a2: scrambleCat3Q2[1],
            a3: scrambleCat3Q2[2],
        },
        q3: {
            prompt: categories[2].q3.prompt,
            a1: scrambleCat3Q3[0],
            a2: scrambleCat3Q3[1],
            a3: scrambleCat3Q3[2],
        },
        id: categories[2].id
    }

    const cat1encrypt = CryptoJS.AES.encrypt(JSON.stringify(cat1), 'antitriv').toString();
    const cat2encrypt = CryptoJS.AES.encrypt(JSON.stringify(cat2), 'antitriv').toString();
    const cat3encrypt = CryptoJS.AES.encrypt(JSON.stringify(cat3), 'antitriv').toString();

    res.status(201).json({cat1: cat1encrypt, cat2: cat2encrypt, cat3: cat3encrypt}) 
}



const getBookmarked = async (req, res, next) => {
    const uid = req.params.uid 

    let existingUser;
    try {
        existingUser = await User.findOne({_id: uid })
    } catch (err) {
        const error = new LogError('Didn\'t manage to connect to db', 500)
        return next(error)
    }

    if (!existingUser) {
        const error = new LogError('Didn\'t manage to find user', 500)
        return next(error)
    }

    const bookmarkedQuestions = existingUser.bookmarkedGames.map(game => {
        if (game.q1 && game.q2 && game.q3) {
            return [game.bookmarkId, true, true, true]
        } else if (game.q1 && game.q2) {
            return [game.bookmarkId, true, true, false]
        } else if (game.q1 && game.q3) {
            return [game.bookmarkId, true, false, true]
        } else if (game.q2 && game.q3) {
            return [game.bookmarkId, false, true, true]
        } else if (game.q1) {
            return [game.bookmarkId, true, false, false]
        } else if (game.q2) {
            return [game.bookmarkId, false, true, false]
        } else if (game.q3) {
            return [game.bookmarkId, false, false, true]
        } else {
            return [game.bookmarkId, false, false, false]
        }
    })

    const returnBookmarks = [];
    const categoriesList = [];

    if (bookmarkedQuestions.length > 0) {
        for (let i = 0; i < bookmarkedQuestions.length; i++) {
            for (let j = 0; j < 4; j++) {
                let question;
                let gameNum = bookmarkedQuestions[i][0];
                if (j === 1 && bookmarkedQuestions[i][j]) {
                    
                    try {
                        question = await Game.find({_id: gameNum })
                    } catch (err) {
                        /* const error = new LogError('Didn\'t manage to connect to db', 500)
                        return next(error) */
                        continue;
                    }
                    if (!question) {
                        continue;
                    }
                    returnBookmarks.push({gameNum: gameNum, questionNum: 0, question: question[0].q1})

                    if (categoriesList.includes(question[0].category)) {
                        continue;
                    }
                    categoriesList.push(question[0].category)
                } else if (j === 2 && bookmarkedQuestions[i][j]) {
                    try {
                        question = await Game.find({_id: gameNum })
                    } catch (err) {
                        /* const error = new LogError('Didn\'t manage to connect to db', 500)
                        return next(error) */
                        continue;
                    }
                    if (!question) {
                        continue;
                    }
                    
                    returnBookmarks.push({gameNum: gameNum, questionNum: 1, question: question[0].q2})
                    
                    if (categoriesList.includes(question[0].category)) {
                        continue;
                    }
                    categoriesList.push(question[0].category)
                    
                } else if (j === 3 && bookmarkedQuestions[i][j]) {
                    try {
                        question = await Game.find({_id: gameNum })
                    } catch (err) {
                        /* const error = new LogError('Didn\'t manage to connect to db', 500)
                        return next(error) */
                        continue;
                    }
                    if (!question) {
                        continue;
                    }
                
                    returnBookmarks.push({gameNum: gameNum, questionNum: 2, question: question[0].q3})
                    
                    if (categoriesList.includes(question[0].category)) {
                        continue;
                    }
                    categoriesList.push(question[0].category)
                }

            }
        }
    }

    res.status(201).json({ bookmarkedQuestions: returnBookmarks, categories: categoriesList })

}

const addBookmark = async (req, res, next) => {

    const { gameId, uid, question } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({_id: uid });
    } catch (err) {
        const error = new LogError('Didn\'t manage to connect to db', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new LogError('Didn\'t manage to find user', 500);
        return next(error);
    }
    

    const bookmarkIndex = existingUser.bookmarkedGames.findIndex(bookmark => bookmark.bookmarkId === gameId)
    
    let addNewBookmark;
    let updateExistingBookmarks;

    if (bookmarkIndex >= 0) {
        updateExistingBookmarks = existingUser.bookmarkedGames.map((bookmark, index) => {
            if (index === bookmarkIndex) {
                if (question === 0) {
                    return {...bookmark, q1: true}
                } else if (question === 1) {
                    return {...bookmark, q2: true}
                } else if (question === 2) {
                    return {...bookmark, q3: true}
                }
            }
            return {...bookmark};
        })
        
    } else {
        if (question === 0) {
            addNewBookmark = {
                bookmarkId: gameId, 
                q1: true,
                q2: false,
                q3: false

            };  
            
        } else if (question === 1) {
            addNewBookmark = {
                bookmarkId: gameId, 
                q1: false,
                q2: true,
                q3: false
            }
        
        } else if (question === 2) {
            addNewBookmark = {
                bookmarkId: gameId, 
                q1: false,
                q2: false,
                q3: true
            }
            
        }
    }
    if (!addNewBookmark) {
        existingUser.bookmarkedGames = updateExistingBookmarks;
        existingUser.save();
        res.status(201).json({ added: true })
    } else {
        existingUser.bookmarkedGames.unshift(addNewBookmark);  
        existingUser.save();
        res.status(201).json({ added: true })
    }
}

const removeBookmark = async (req, res, next) => {

    const { gameId, uid, question } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({_id: uid });
    } catch (err) {
        const error = new LogError('Didn\'t manage to connect to db', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new LogError('Didn\'t manage to find user', 500);
        return next(error);
    }

    const bookmarkIndex = existingUser.bookmarkedGames.findIndex(bookmark => bookmark.bookmarkId === gameId)
    

    const updateExistingBookmarks = existingUser.bookmarkedGames.map((bookmark, index) => {
        if (index === bookmarkIndex) {
            if (question === 0) {
                return {...bookmark, q1: false}
            } else if (question === 1) {
                return {...bookmark, q2: false}
            } else if (question === 2) {
                return {...bookmark, q3: false}
            }
        }
        return {...bookmark};
    })
    
    existingUser.bookmarkedGames = updateExistingBookmarks;
    existingUser.save();
    res.status(201).json({ added: true })
    
}

const checkBookmark = async (req, res, next) => {
    const { gameId, uid, question } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({_id: uid });
    } catch (err) {
        console.log('no user')
    }

    if (!existingUser) {
        console.log('no user')
    }

    const bookmarkIndex = existingUser.bookmarkedGames.findIndex(bookmark => bookmark.bookmarkId === gameId)

    const bookmarkArray = existingUser.bookmarkedGames.map((bookmark, index) => {
        if (index === bookmarkIndex) {
            if (question === 0) {
                if (bookmark.q1 === true) {
                    return 'bookmarked'
                }
                return;
            } else if (question === 1) {
                if (bookmark.q2 === true) {
                    return 'bookmarked'
                }
                return;
            } else if (question === 2) {
                if (bookmark.q3 === true) {
                    return 'bookmarked'
                }
                return;
            }
        }
        return;
    })
    
    if (bookmarkArray.includes('bookmarked')) {
        
        res.status(201).json({isBookmarked: true});
    } else {
        res.status(201).json({isBookmarked: false});
    }
} 

const newSol = async (req, res, next) => {
    const { id, question } = req.body

    let solFound;
    try {
        solFound = await Game.findOne({_id: id })
    } catch (err) {
        const error = new LogError('Didn\'t manage to connect to db', 500)
        return next(error)
    }

    let encryptedSol;
    if (question === 'q1') {
        encryptedSol = CryptoJS.AES.encrypt(JSON.stringify(solFound.q1.solution), 'antitriv').toString();
    } else if (question === 'q2') {
        encryptedSol = CryptoJS.AES.encrypt(JSON.stringify(solFound.q2.solution), 'antitriv').toString();
    } else if (question === 'q3') {
        encryptedSol = CryptoJS.AES.encrypt(JSON.stringify(solFound.q3.solution), 'antitriv').toString();
    }
    
    res.status(201).json({enc: encryptedSol})
}

const searchBookmarks = async (req, res, next) => {
    const {uid, term, type} = req.body;
 
    let existingUser;
    try {
        existingUser = await User.findOne({_id: uid })
    } catch (err) {
        const error = new LogError('Didn\'t manage to connect to db', 500)
        return next(error)
    }

    if (!existingUser) {
        const error = new LogError('Didn\'t manage to find user', 500)
        return next(error)
    }

    const returnBookmarks = [];

    if (type === 'search') {
        for (let i = 0; i < existingUser.bookmarkedGames.length; i++) {
            let gameNum = existingUser.bookmarkedGames[i].bookmarkId
            
            if (existingUser.bookmarkedGames[i].q1) {
                
                try {
                    let question = await Game.find({_id: gameNum })
                    let questionString = question[0].q1.prompt.toString()
                    if (questionString.includes(term)) {
                        returnBookmarks.push({gameNum: gameNum, questionNum: 0, question: question[0].q1})
                    }
                } catch (err) {
                    continue;
                }
            
            }

            if (existingUser.bookmarkedGames[i].q2) {
                
                try {
                    let question = await Game.find({_id: gameNum })
                    let questionString = question[0].q2.prompt.toString()
                    if (questionString.includes(term)) {
                        returnBookmarks.push({gameNum: gameNum, questionNum: 1, question: question[0].q2})
                    }
                } catch (err) {
                    continue;
                }
            }

            if (existingUser.bookmarkedGames[i].q3) {
                
                try {
                    let question = await Game.find({_id: gameNum })
                    let questionString = question[0].q3.prompt.toString()
                    if (questionString.includes(term)) {
                        returnBookmarks.push({gameNum: gameNum, questionNum: 2, question: question[0].q3})
                    }
                } catch (err) {
                    continue;
                }
            }
        }
    }
    if (type === 'sort') {
      
        for (let i = 0; i < existingUser.bookmarkedGames.length; i++) {
            let gameNum = existingUser.bookmarkedGames[i].bookmarkId
            
            if (existingUser.bookmarkedGames[i].q1) {
                 
                try {
                    let question = await Game.find({_id: gameNum })
                    let questionString = question[0].category.toString()
                    if (questionString.includes(term)) {
                        returnBookmarks.push({gameNum: gameNum, questionNum: 0, question: question[0].q1})
                    }
                } catch (err) {
                    continue;
                }
            
            }

            if (existingUser.bookmarkedGames[i].q2) {
                
                try {
                    let question = await Game.find({_id: gameNum })
                    let questionString = question[0].category.toString()
                    if (questionString.includes(term)) {
                        returnBookmarks.push({gameNum: gameNum, questionNum: 1, question: question[0].q2})
                    }
                } catch (err) {
                    continue;
                }
            }

            if (existingUser.bookmarkedGames[i].q3) {
                
                try {
                    let question = await Game.find({_id: gameNum })
                    let questionString = question[0].category.toString()
                    if (questionString.includes(term)) {
                        returnBookmarks.push({gameNum: gameNum, questionNum: 2, question: question[0].q3})
                    }
                } catch (err) {
                    continue;
                }
            }
        }
    }

    res.status(201).json({ bookmarkedQuestions: returnBookmarks })

}



exports.newGame = newGame;
exports.updateGame = updateGame;
exports.getQuestions = getQuestions;
exports.getEncryptedGame = getEncryptedGame;
exports.getPractice = getPractice;
exports.getBookmarked = getBookmarked;
exports.addBookmark = addBookmark;
exports.removeBookmark = removeBookmark;
exports.checkBookmark = checkBookmark;
exports.newSol = newSol;
exports.searchBookmarks = searchBookmarks;





