const { gameId } = require("../config/database");

module.exports.gameVariable = async () => {
  return {
    gameName: (await gameId()).game_name,
    viewZone: {
      rows: +(await gameId()).view_zone.rows,
      columns: +(await gameId()).view_zone.columns,
    },
    payArray: [
      (await gameId()).payline[0],
      (await gameId()).payline[1],
      (await gameId()).payline[2],
      (await gameId()).payline[3],
      (await gameId()).payline[4],
    ],
    payTable: {
      H1: {
        "3ofakind": 50,
        "4ofakind": 150,
        "5ofakind": 500,
      },
      H2: {
        "3ofakind": 40,
        "4ofakind": 130,
        "5ofakind": 250,
      },
      H3: {
        "3ofakind": 30,
        "4ofakind": 100,
        "5ofakind": 150,
      },
      A: {
        "3ofakind": 20,
        "4ofakind": 40,
        "5ofakind": 80,
      },
      K: {
        "3ofakind": 10,
        "4ofakind": 20,
        "5ofakind": 40,
      },
      J: {
        "3ofakind": 5,
        "4ofakind": 10,
        "5ofakind": 20,
      },
      SCATTER: {
        "3ofakind": 20,
        "4ofakind": 40,
        "5ofakind": 80,
      },
    },
    arrayOfReels: [
      (await gameId()).reels[0],
      (await gameId()).reels[1],
      (await gameId()).reels[2],
      (await gameId()).reels[3],
      (await gameId()).reels[4],
      // ['H1', 'SCATTER', 'H2', 'H3', 'K', 'A', 'J', 'H1', "WILD"],
      // ['A', 'H2', 'H1', 'J', 'SCATTER', 'H3', "WILD", 'K', 'H2'],
      // ['J', 'H2', 'H3', 'K', "WILD", 'A', 'H1', 'A', 'SCATTER'],
      // ['H2', "WILD", 'H3', 'SCATTER', 'A', 'H1', 'J', 'H2', 'K'],
      // ['H3', 'K', 'J', 'H1', 'H2', "WILD", 'A', 'SCATTER', 'H3']
    ],
  };
};
