const { client, currentUser } = require("../config/database");
// const currentUser = require("../config/database");

require('dotenv').config();

module.exports.gameData = async (req, res) => {

    const name = currentUser(req, res);
    const query = "SELECT * FROM userdata WHERE username = '" + name + "'";
    try {
        const result = await client.query(query);
        if (result) {
            const account = {
                wallet: +result.rows[0].user_wallet,
                betAmount: 100,
                freeSpin: +result.rows[0].freespin,
                totalFreeSPin: +result.rows[0].totalfreespin,
                winFreeSpinAmount: 0,
                winInSpin: 0
            }
            return account
        }
        return {
            wallet: 1000,
            betAmount: 100,
            freeSpin: 0,
            totalFreeSPin: 0,
            winFreeSpinAmount: 0,
            winInSpin: 0
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}