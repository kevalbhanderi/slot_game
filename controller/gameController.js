const userHelper = require("../utils/userHelper");
const { preViewZone } = require("../utils/preViewZone");
const { gameVariable } = require("../seeder/spin");
const { messages } = require("../utils/resMessage");
const { currentUser, client, currentwallet, gameId } = require("../config/database");

class SlotGame {
  gameFunction = async (req, res) => {
    let wallet = (await userHelper.gameData(req, res)).wallet;
    let betAmount = (await userHelper.gameData(req, res)).betAmount;
    let freeSpin = (await userHelper.gameData(req, res)).freeSpin;
    let totalFreeSPin = (await userHelper.gameData(req, res)).totalFreeSPin;
    let winFreeSpinAmount = (await userHelper.gameData(req, res)).winFreeSpinAmount;
    let winInSpin = (await userHelper.gameData(req, res)).winInSpin;

    console.log(winInSpin);
    if (winInSpin === 0) {
      // Generate ViewZone
      const gameValues = await gameVariable();
      const generateViewZone = preViewZone.generateViewZone(gameValues);
      const viewZone = generateViewZone.viewZone;
      const expanding_Wild = preViewZone.expandingWildCard(generateViewZone);

      let matrixReel = preViewZone.matrix(
        expanding_Wild,
        gameValues.viewZone.rows,
        gameValues.viewZone.columns
      );

      // checkpayline in matrix
      let checkPayline = await preViewZone.checkPayline(
        gameValues.payArray,
        matrixReel,
        gameValues.payTable,
        req,
        res
      );

      winFreeSpinAmount = checkPayline.winFreeSpinAmount;
      wallet = checkPayline.wallet;
      winInSpin = checkPayline.winAmount;

      let checkFreeSpin = checkPayline.freeSpin;

      // Count of freespin if occures
      if (freeSpin !== 0) {
        freeSpin--;
        totalFreeSPin--;
      } else {
        if (wallet < betAmount) {
          res.send({ messages: messages.EmptyWallet });
          return;
        }
        wallet = preViewZone.debitWinAmount(checkPayline.wallet, betAmount);
        winFreeSpinAmount = 0;
      }

      // When freeSpin Occures
      if (checkPayline.scatterCount > 2) {
        let countOfFreeSpin = await preViewZone.countOfFreeSpin(freeSpin, totalFreeSPin);
        freeSpin = countOfFreeSpin.freeSpin;
        totalFreeSPin = countOfFreeSpin.totalFreeSpin;
      }

      const sqlquery =
        "update userdata set freespin = '" +
        freeSpin +
        "', totalfreespin = '" +
        totalFreeSPin +
        "' where username = '" +
        currentUser(req, res) +
        "'";
      const freeSpinData = await client.query(sqlquery);

      let responseFreeSpin = {};
      if (freeSpin === 0) {
        responseFreeSpin = preViewZone.freeSpin(
          checkFreeSpin,
          checkPayline.winFreeSpinAmount,
          totalFreeSPin
        );
      } else {
        responseFreeSpin = preViewZone.freeSpin(
          freeSpin,
          checkPayline.winFreeSpinAmount,
          totalFreeSPin
        );
      }
      let result = checkPayline.result;

      (await userHelper.gameData(req, res)).wallet = wallet;

      const user = currentUser(req, res);
      const query =
        "update userdata set user_wallet = " + wallet + " where username = '" + user + "'";
      const walletResult = await client.query(query);

      let data = {
        viewZone: viewZone,
        result: result,
        betAmount: betAmount,
        wallet: (await currentwallet(req, res)).rows[0].user_wallet,
        freeSpin: freeSpin > 0 ? responseFreeSpin : 0,
        wildCard: expanding_Wild.expandingWild,
        totalWin: checkPayline.winAmount,
      };
      res.send(data);
    }
  };

  collectWin = async (req, res) => {
    let betAmount = 0;
    if (req.body.mode == "collect") {
      betAmount = 0;
    } else {
      betAmount = (await userHelper.gameData(req, res)).betAmount;
    }
    const databaseWallet = (await userHelper.gameData(req, res)).wallet;
    const winAmount = req.body.winAmount;
    try {
      const wallet = databaseWallet + winAmount - betAmount;
      if (wallet < betAmount) {
        res.send({ messages: messages.EmptyWallet });
        return;
      }
      const user = currentUser(req, res);
      const query =
        "update userdata set user_wallet = " + wallet + " where username = '" + user + "'";
      const walletResult = await client.query(query);

      if (walletResult) {
        res.send({ wallet: wallet.toString() });
      } else {
        res.send("Something Went Wrong");
      }
    } catch (e) {
      throw e;
    }
  };

  gambleData = (req, res) => {
    const winChance = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]; // Winchance is 30%-70%
    if (winChance[Math.floor(Math.random() * winChance.length)]) {
      res.send({ addValue: +req.body.winAmount * 2 });
    } else {
      res.send({ addValue: 0 });
    }
  };
}

const slotGame = new SlotGame();
module.exports.slotGame = slotGame;
