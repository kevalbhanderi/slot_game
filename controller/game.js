const userHelper = require('../utils/userHelper')
const { preViewZone } = require('../utils/preViewZone');
const { gameVariable } = require('../seeder/spin');
const { currentUser, client, currentwallet } = require('../config/database');

class SlotGame {
    gameFunction = async (req, res) => {

        let wallet = (await userHelper.gameData(req, res)).wallet;
        let betAmount = (await userHelper.gameData(req, res)).betAmount;
        let freeSpin = (await userHelper.gameData(req, res)).freeSpin;
        let totalFreeSPin = (await userHelper.gameData(req, res)).totalFreeSPin;
        let winFreeSpinAmount = (await userHelper.gameData(req, res)).winFreeSpinAmount;
        let winInSpin = (await userHelper.gameData(req, res)).winInSpin;

        if (winInSpin === 0) {
            // Generate ViewZone
            const generateViewZone = preViewZone.generateViewZone(gameVariable);
            const viewZone = generateViewZone.viewZone;
            const expanding_Wild = preViewZone.expandingWildCard(generateViewZone, gameVariable.wildMult);

            let matrixReel = preViewZone.matrix(expanding_Wild, gameVariable.viewZone.rows, gameVariable.viewZone.columns);
            let checkPayline = await preViewZone.checkPayline(gameVariable.payArray, matrixReel, gameVariable.payTable, req, res);

            winFreeSpinAmount = checkPayline.winFreeSpinAmount;
            wallet = checkPayline.wallet;
            winInSpin = checkPayline.winAmount;
            
            let checkFreeSpin = checkPayline.freeSpin;

            if (freeSpin !== 0) {
                freeSpin--;
                checkFreeSpin--;
            } else {
                if (wallet < betAmount) {
                    res.send('You are Bankrrupt');
                    return;
                }
                // wallet = preViewZone.debitWinAmount(checkPayline.wallet, betAmount);
                winFreeSpinAmount = 0;
            }

            if (checkPayline.scatterCount > 2) {
                let countOfFreeSpin = preViewZone.countOfFreeSpin(freeSpin, totalFreeSPin);
                freeSpin = countOfFreeSpin.freeSpin;
                totalFreeSPin = countOfFreeSpin.totalFreeSpin;
            }

            let responseFreeSpin = {}
            if (freeSpin === 0) {
                responseFreeSpin = preViewZone.freeSpin(checkFreeSpin, checkPayline.winFreeSpinAmount, totalFreeSPin);
            } else {
                responseFreeSpin = preViewZone.freeSpin(freeSpin, checkPayline.winFreeSpinAmount, totalFreeSPin);
            }
            let result = checkPayline.result;

            (await userHelper.gameData(req, res)).wallet = wallet;
            (await userHelper.gameData(req, res)).betAmount = betAmount;
            (await userHelper.gameData(req, res)).freeSpin = freeSpin;
            (await userHelper.gameData(req, res)).totalFreeSPin = totalFreeSPin;
            (await userHelper.gameData(req, res)).winFreeSpinAmount = winFreeSpinAmount;
            (await userHelper.gameData(req, res)).winInSpin = winInSpin;
            

            const user = currentUser(req, res);
            const query = "update userdata set user_wallet = " + this.collectWin(wallet, winInSpin, betAmount) + " where username = '" + user + "'";
            const walletResult = await client.query(query);
            if (walletResult) {
                let data = {
                    viewZone: viewZone,
                    result: result,
                    betAmount: betAmount,
                    wallet: (await currentwallet(req, res)).rows[0].user_wallet,
                    freeSpin: checkPayline.freeSpin > 0 ? responseFreeSpin : 0,
                    wildCard: expanding_Wild.expandingWild,
                    totalWin: checkPayline.winAmount,
                }
                res.send(data);
                // return message;
            } else {
                res.send('Error wallet')
            }
        } else {
            let message = 'Error';
            return message;
        }
    }


    collectWin = (wallet, winInSpin, betAmount) => {
        console.log('win');
        console.log(wallet, winInSpin, betAmount);
        wallet = wallet + winInSpin - betAmount;
        
        return wallet;
    }

}


const slotGame = new SlotGame();
module.exports.slotGame = slotGame;