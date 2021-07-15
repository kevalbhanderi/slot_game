const {Pool, Client} = require('pg');
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
    if(err){
        throw err;
    }
    console.log('Connected');
})

module.exports = client