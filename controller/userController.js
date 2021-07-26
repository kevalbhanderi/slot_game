const dotenv = require('dotenv');
const { client, currentUser } = require("../config/database");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { messages } = require('../utils/resMessage');


// get config vars
dotenv.config();


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
                err = {messages: messages.UserExists};
                res.send(err);
            } else {
                let sql = `INSERT INTO userdata (user_id, username, email, password, user_wallet) VALUES ('${uuidv4()}', '${username}', '${email}', '${password}', '${user_wallet}')`;
                client.query(sql, (err) => {
                    if (err) {
                        throw err
                    }
                    res.send({messages: messages.Signup});
                });
            }
        });
    } else {
        res.send({messages: messages.EmptySignupData});
    }
}



// Login Data
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_SECRET_KEY, {expiresIn: '24h'});
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
                res.send({messages: messages.InvalidLoginData});
            }
        })
    } else {
        res.send({messages: messages.EmptyLoginData});
    }
}




// Logout
exports.logout = function (req, res) {
    username = currentUser(req, res);
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
    res.send({messages: messages.LogOut});
}