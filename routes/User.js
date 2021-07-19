let express = require('express');
let router = express.Router();
const controller = require('../controller/User');
const { slotGame } = require('../controller/game');
const profile = require('../controller/userProfile');
const checkToken = require('../middleware/checkToken');



router.get('/', controller.homePage);

// Signup
// router.get('/signup', controller.signupPage);
router.post('/signup', controller.signupData)

// Login
// router.get('/login', controller.loginPage);
router.post('/login', controller.loginData);

// Logout
router.get('/logout', controller.logout);

// Profile
router.get('/profile/data', checkToken.verifyAccessToken, profile.userData);

// Spin
router.post('/spin', checkToken.verifyAccessToken, slotGame.gameFunction);

// Collect
// router.post('/collect', checkToken.verifyAccessToken, slotGame.collectWin);


module.exports = router;