let express = require('express');
let router = express.Router();
const controller = require('../controller/userController');
const { slotGame } = require('../controller/gameController');
const profile = require('../controller/userProfileController');
const checkToken = require('../middleware/checkToken');


// Signup
router.post('/signup', controller.signupData)

// Login
router.post('/login', controller.loginData);

// Logout
router.post('/logout', controller.logout);

// Profile
router.get('/profile/data', checkToken.verifyAccessToken, profile.userData);

// Spin
router.post('/spin', checkToken.verifyAccessToken, slotGame.gameFunction);

// Collect
router.post('/collect', checkToken.verifyAccessToken, slotGame.collectWin);

// Gamble
router.post('/gamble', slotGame.gambleData)


module.exports = router;