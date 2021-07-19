const userHelper = require('./userHelper')
class getViewZone {

    /**
     * It return array of random Numbers
     * @param {low} first index of reel configuration
     * @param {high} last index of reel configuration
     * @returns ArrayOfRandomNum = [1,2,4,5,3,6]
     */
    randomNum = (low, high) => {
        let element = Math.floor(Math.random() * (high - low + 1) + low)
        return element;
    };


    /**
     * It returns a symbol at requested reel and column from reel configuration
     * @param {ArrayOfRandomNum} ArrayOfRandomNum random Numbers of Array
     * @param {reelLength} reelLength length of random numbers of array
     * @param {reel} reel number of reel 
     * @param {col} col number of column
     * @returns 
     */
    getSymbol = (ArrayOfRandomNum, arrayOfReel, reelLength, reel, col) => {
        let symbol = arrayOfReel[(ArrayOfRandomNum[reel] + col) % reelLength];
        return symbol;
    }



    generateViewZone = (sta) => {
        const arrayOfReel = sta.arrayOfReels;
        const row = sta.viewZone.rows;
        const column = sta.viewZone.columns;
        const randomNumber = [];
        for (let index = 0; index < column; index++) {
            const element = this.randomNum(0, arrayOfReel[index].length);
            randomNumber.push(element);
        }

        const viewZone = {
            reel0: [],
            reel1: [],
            reel2: [],
            reel3: [],
            reel4: [],
        };

        let generatedArray = [];
        for (let reel = 0; reel < column; reel++) {
            let symbolArray = [];
            let wildCounter = 0;
            for (let col = 0; col < row; col++) {
                const symbol = this.getSymbol(randomNumber, arrayOfReel[reel], arrayOfReel[reel].length, reel, col);
                symbolArray.push(symbol);
                if (symbol === 'WILD') {
                    wildCounter++;
                }
            }
            if (wildCounter > 1) {
                let newSymbolArray = this.countOfWild(arrayOfReel[reel], arrayOfReel[reel].length, reel, row);
                viewZone[`reel${reel}`].push(...newSymbolArray);
            } else {
                viewZone[`reel${reel}`].push(...symbolArray);
            }
            generatedArray.push(viewZone[`reel${reel}`]);
        }
        return { generatedArray: generatedArray, viewZone: viewZone }
    }



    countOfWild(arrayOfReel, length, reel, row) {
        const randomNumber = [];
        for (let index = 0; index < 5; index++) {
            const element = this.randomNum(0, arrayOfReel[index].length);
            randomNumber.push(element);
        }
        let wildCounter = 0;
        let symbolArray = [];
        for (let col = 0; col < row; col++) {
            const symbol = this.getSymbol(randomNumber, arrayOfReel, length, reel, col);
            symbolArray.push(symbol);
            if (symbol === 'WILD') {
                wildCounter++;
            }
        }
        if (wildCounter > 1) {
            this.countOfWild(arrayOfReel, length, reel, row);
        }
        return symbolArray;
    }



    expandingWildCard = (generateViewZone, wildMultiArray) => {
        const viewZone = {
            reel0: [],
            reel1: [],
            reel2: [],
            reel3: [],
            reel4: [],
        };

        const expandingWild = [];
        const newGenerateArray = [];
        for (let reel = 0; reel < generateViewZone.generatedArray.length; reel++) {

            const celement = generateViewZone.generatedArray[reel];
            const element = JSON.parse(JSON.stringify(celement));
            const found = element.find(symbol => symbol === 'WILD');
            if (found === 'WILD') {
                viewZone[`reel${reel}`].push(element.fill('WILD'));
                newGenerateArray.push(element.fill('WILD'));
                let col = 0;
                for (col; col < generateViewZone.generatedArray[reel].length; col++) {
                    if (generateViewZone.generatedArray[reel][col] === 'WILD') {
                        break;
                    }
                }
                expandingWild.push({
                    "column": reel,
                    "row": col
                })
            } else {
                viewZone[`reel${reel}`].push(element);
                newGenerateArray.push(element);
            }
        }
        return { viewZone, generatedArray: newGenerateArray, expandingWild}
    }



    matrix = (generateViewZone, row, column) => {
        let matrixReel = [];
        for (let matrixCol = 0; matrixCol < row; matrixCol++) {
            let arr = [];
            for (let matrixRow = 0; matrixRow < column; matrixRow++) {
                let num = generateViewZone.generatedArray[matrixRow][matrixCol];
                arr[matrixRow] = num;
            }
            matrixReel.push(arr);
        }
        return matrixReel;
    }


    checkPayline = async (payArray, matrixReel, pay, req, res) => {
        let scatterCount = 0;
        let result = [];
        let wallet = (await userHelper.gameData(req, res)).wallet;
        let betAmount = (await userHelper.gameData(req, res)).betAmount;
        let winAmount = 0;
        let winFreeSpinAmount = (await userHelper.gameData(req, res)).winFreeSpinAmount;
        let freeSpin = (await userHelper.gameData(req, res)).freeSpin;
        let totalFreeSPin = (await userHelper.gameData(req, res)).totalFreeSPin;
        for (let rowOfMatrix = 0; rowOfMatrix < matrixReel.length; rowOfMatrix++) {
            for (let rowOfPayArray = 0; rowOfPayArray < payArray.length; rowOfPayArray++) {
                let payLine = payArray[rowOfPayArray];
                if (payLine) {
                    let countOfSym = this.countOfSymbol(matrixReel, payLine, rowOfMatrix);
                    let count = countOfSym.count;
                    let symbol = countOfSym.symbol;
                    if (count > 2) {
                        if (symbol === 'WILD') {
                            break;
                        }
                        let symbolOfResult = this.buildPayLine(count, symbol, pay, payLine, betAmount, freeSpin, winFreeSpinAmount);
                        result.push({ symbol: symbolOfResult.symbol, wintype: symbolOfResult.wintype, payLine: symbolOfResult.payLine, winAmount: symbolOfResult.winAmount });
                        winAmount += symbolOfResult.winAmount;
                        winFreeSpinAmount = symbolOfResult.winFreeSpinAmount;
                    }
                }
                let check = matrixReel[rowOfMatrix][rowOfPayArray];
                if (check === 'SCATTER') {
                    scatterCount++;
                }
            }
        }
        if (scatterCount > 2) {
            let countOfFreeSpin = this.countOfFreeSpin(freeSpin, totalFreeSPin);
            freeSpin = countOfFreeSpin.freeSpin;
            totalFreeSPin = countOfFreeSpin.totalFreeSpin;
        }
        return { scatterCount, result, wallet, winFreeSpinAmount, freeSpin, totalFreeSPin, winAmount }
    }



    countOfSymbol = (matrixReel, payLine, rowOfMatrix) => {
        let count = 0;
        let x = 0;
        let symbol = matrixReel[rowOfMatrix][x];
        if (payLine[0] === rowOfMatrix) {
            count++;
            for (let element = 1; element < payLine.length; element++) {
                if (symbol == 'WILD') {
                    symbol = matrixReel[payLine[element]][element];
                    count++;
                    continue;
                }
                if (matrixReel[payLine[element]][element] !== 'WILD' && matrixReel[payLine[element]][element] !== symbol) {
                    break;
                }
                count++;
            }
        }
        return { count, symbol };
    }



    buildPayLine = (count, symbol, pay, payLine, betAmount, freeSpin, winFreeSpinAmount) => {
        let multipliar = pay[`${symbol}`][`${count}ofakind`];
        if (freeSpin > 0) {
            winFreeSpinAmount = this.creditWinAmount(multipliar, betAmount, winFreeSpinAmount);
        }
        return { symbol, wintype: `${count}ofakind`, payLine, winAmount: betAmount + multipliar, winFreeSpinAmount }
    }


    countOfFreeSpin = (freeSpin, totalFreeSpin) => {
        if (freeSpin > 0) {
            totalFreeSpin += 1;
            freeSpin += 1;
        } else {
            freeSpin = 2;
            totalFreeSpin = freeSpin;
        }
        return { freeSpin, totalFreeSpin }
    }

    freeSpin = (freeSpin, winFreeSpinAmount, totalFreeSPin) => {
        let scatterOfFreeSpin = {
            numberOfFreeSpin: totalFreeSPin,
            remainingSpin: freeSpin,
            freeSpinTriggered: freeSpin === totalFreeSPin ? 'true' : 'false',
            winAmount: winFreeSpinAmount
        }
        return scatterOfFreeSpin;
    }

    debitWinAmount = (wallet, betAmount) => {
        wallet -= betAmount;
        return wallet;
    }

    creditWinAmount = (multipliar, betAmount, winFreeSpinAmount) => {
        winFreeSpinAmount += betAmount + multipliar;
        return winFreeSpinAmount;
    }

}





const preViewZone = new getViewZone();
module.exports.preViewZone = preViewZone;