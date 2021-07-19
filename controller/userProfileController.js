const jwt = require('jsonwebtoken');
const client = require('../config/database');

exports.userData = (req, res) => {
    username = req.session.username;
    client.query(`SELECT * FROM userdata where username='${username}'`, (err, data) => {
        if (err) {
            throw err
        }
        res.send(data.rows);
    })
}



exports.userProfile = (req, res) => {
    
    username = req.body.username
    
    jwt.sign({username}, process.env.ACCESS_SECRET_KEY, (err, token) => {
        if (err) {
            throw err;
        }
        res.json({token});
    });


    // return new Promise((resolve, reject) => {
    //     const payload = {
    //         name: 'Keval'
    //     }
    //     const secret = process.env.ACCESS_SECRET_KEY
    //     const options = {}

    //     jwt.sign(payload, secret, options, (err, token) => {
    //         if (err) reject(err)
    //         resolve(token)
    //     })
    // })
}