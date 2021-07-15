const userHelper = require('../utils/userHelper')
const { preViewZone } = require('../utils/preViewZone');
const { gameVariable } = require('../seeder/spin');


class SlotGame {
    gameFunction = (req, res) => {
        let wallet = userHelper.gameFunction(req, res)['wallet'];
        let betAmount = userHelper.gameFunction(req, res)['betAmount'];
        let freeSpin = userHelper.gameFunction(req, res)['freeSpin'];
        let totalFreeSPin = userHelper.gameFunction(req, res)['totalFreeSpin'];
        let winFreeSpinAmount = userHelper.gameFunction(req, res)['winFreeSpinAmount'];
        let wildMultipliar = userHelper.gameFunction(req, res)['wildMultipliar'];
        let winInSpin = userHelper.gameFunction(req, res)['winInSpin'];

        if (winInSpin === 0) {
            // Generate ViewZone
            const generateViewZone = preViewZone.generateViewZone(gameVariable);
            const viewZone = generateViewZone.viewZone;
            const expanding_Wild = preViewZone.expandingWildCard(generateViewZone, gameVariable.wildMult);
            wildMultipliar = expanding_Wild.wildMultipliar;

            let matrixReel = preViewZone.matrix(expanding_Wild, gameVariable.viewZone.rows, gameVariable.viewZone.columns);
            let checkPayline = preViewZone.checkPayline(gameVariable.payArray, matrixReel, gameVariable.payTable);
            winFreeSpinAmount = checkPayline.winFreeSpinAmount;
            wallet = checkPayline.wallet;
            winInSpin = checkPayline.winAmount;
            let checkFreeSpin = checkPayline.freeSpin;
            if (freeSpin !== 0) {
                freeSpin--;
                checkFreeSpin--;
            } else {
                wallet = preViewZone.debitWinAmount(checkPayline.wallet, betAmount);
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
            

            userHelper.gameFunction(req, res)['wallet'] = wallet;
            userHelper.gameFunction(req, res)['betAmount'] = betAmount;
            userHelper.gameFunction(req, res)['freeSpin'] = freeSpin;
            userHelper.gameFunction(req, res)['winFreeSpinAmount'] = winFreeSpinAmount;
            userHelper.gameFunction(req, res)['totalFreeSpin'] = totalFreeSPin;
            userHelper.gameFunction(req, res)['winInSpin'] = winInSpin;
            userHelper.gameFunction(req, res)['wildMultipliar'] = wildMultipliar;

            let data = {
                viewZone: viewZone,
                result: result,
                betAmount: betAmount,
                wallet: wallet,
                freeSpin: checkPayline.freeSpin > 0 ? responseFreeSpin : 0,
                wildCard: expanding_Wild.expandingWild,
                totalWin: checkPayline.winAmount,
                wildMultipliar: expanding_Wild.wildMultipliar
            }
            let message = ('Success', data);
            res.send(message);
            // return message;
        } else {
            let message = 'Error';
            // res.send(message);
            return message;
        }
    }
    

    collect = (req, res) => {
        (result) => {
            let wallet = userHelper.gameFunction(req, res)['wallet'];
            let winInSpin = userHelper.gameFunction(req, res)['winInSpin'];
            let wildMultipliar = userHelper.gameFunction(req, res)['wildMultipliar'];

            if (winInSpin !== 0) {
                let collectWallet = preViewZone.collectWallet(result);
                wallet = collectWallet.wallet;
                winInSpin = collectWallet.winInSpin;
                wildMultipliar = collectWallet.wildMultipliar;

                userHelper.gameFunction(req, res)['wildMultipliar'] = wildMultipliar;
                userHelper.gameFunction(req, res)['winInSpin'] = winInSpin;
                userHelper.gameFunction(req, res)['wallet'] = wallet;

                let data = {
                    wallet: wallet,
                }
                let response = ("Success", data);
                console.log(data);
                // return response;
            } else {
                let message = "Collect Money";
                return message;
            }
        }
    }

}


const slotGame = new SlotGame();
module.exports.slotGame = slotGame;