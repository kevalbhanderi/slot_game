const { Pool, Client } = require('pg');
const jwt = require('jsonwebtoken');
// const connectionString = 'postgresql://postgres:1234@localhost:5432/slot_game';

const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'slot_game'
})

client.connect();

client.query('SELECT * FROM userdata', (err, result) => {
    if (err) {
        throw err;
    }
    console.log('Connected');
})


exports.currentUser = (req, res) => {
    const token = (req.headers.authorization).replace('Bearer ', '')
    const { name, iat } = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    return name;
}

exports.currentwallet = async (req, res) => {
    const token = (req.headers.authorization).replace('Bearer ', '')
    const { name, iat } = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    const sql = "SELECT * FROM userdata WHERE username = '" + name + "'";

    const result = await client.query(sql);
    return result;
}

exports.gameId = async () => {
    const game_id = 2
    const sqlquery = "select * from gamedata where game_id = " + game_id;
    const gameId_data = await client.query(sqlquery);
    const newPayline = gameId_data.rows[0].payline.map((paylineRow) => {
        const newPayline = paylineRow.map((num) => +num);
        return newPayline;
    });
    gameId_data.rows[0].payline = newPayline;
    return gameId_data.rows[0];
}

exports.client = client;