const dotenv = require('dotenv');
const { client } = require("../config/database");
const { connect, use } = require("../routes/User");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


// get config vars
dotenv.config();

// Home Page
exports.homePage = (req, res) => {
    res.render('home');
};



// Signup Page
exports.signupPage = (req, res) => {
    res.render('signup');
};

// Signup Data
exports.signupData = function (req, res) {

    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let user_wallet = 1000;

    if (username && email && password) {
        let databaseUser = `SELECT username FROM userdata WHERE username='${username}'`;
        client.query(databaseUser, function (err, data) {

            if ((data.rows).length != 0) {
                err = 'Username is Already Exist';
                return res.render('signup', { err: err });
            } else {
                let sql = `INSERT INTO userdata (user_id, username, email, password, user_wallet) VALUES ('${uuidv4()}', '${username}', '${email}', '${password}', '${user_wallet}')`;
                client.query(sql, function (err) {
                    if (err) {
                        throw err
                    }
                    res.redirect('/login');
                });
            }
        });
    } else {
        error_msg = 'Please Fill the Details';
        return res.render('signup', { error_msg: error_msg });
    }
}



// Login Page
exports.loginPage = (req, res) => {
    res.render('login');
};

// Login Data
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_SECRET_KEY);
}

exports.loginData = function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    const user = { name: username };
    const accesToken = generateAccessToken(user);

    if (username && password) {
        client.query(`SELECT * FROM userdata WHERE username = '${username}' and password = '${password}'`, (err, data) => {
            if ((data.rows).length >= 1) {
                req.session.loggedin = true;
                req.session.username = username;
                client.query(`INSERT INTO userauth (user_token, user_id) VALUES ('${accesToken}', '${data.rows[0].user_id}')`, (err, data) => {
                    if (err) {
                        throw err
                    }
                })
                res.send(accesToken);
            } else {
                err = 'Invalid Username or Password';
                res.send(err);
            }
        })
    } else {
        error_msg = "Please Enter Username or Password";
        res.send(error_msg);
    }
}




// Logout
exports.logout = function (req, res) {
    username = req.session.username;
    let token = req.headers['authorization'].split(' ')[1];
    if (token) {
        delete req.headers['authorization'];
        client.query(`DELETE FROM userauth WHERE user_token='${token}'`, (err, data) => {
            if (err) {
                throw err;
            }
        })
    }
    res.clearCookie('username');
    req.session.destroy();

    // res.send('Logout Success Token Deleted')
    res.redirect('/login');
}