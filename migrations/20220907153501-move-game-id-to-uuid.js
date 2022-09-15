'use strict';
const { DataTypes } = require("sequelize"); // Import the built-in data types
const { v4: uuidv4 } = require("uuid");
const models = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('games', 'uuid', { 
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    });
    const games = await models.game.findAll({})
    const gameIdToUuidMap = {}
    for (const game of games) {
      const myUuid = uuidv4();
      gameIdToUuidMap[game.id] = myUuid
      await game.update({
        uuid: myUuid,
      })
    }
    await queryInterface.removeConstraint(
      'turns',
      'gameId_fk',
      {},
    )
    await queryInterface.removeConstraint(
      'games',
      'games_pkey',
      {},
    );
    await queryInterface.addConstraint(
      'games',
      ['uuid'],
      {
        type: 'primary key',
        name: 'games_pkey',
      }
    )
    let turns = await models.turn.findAll({})
    const turnIdToUuidMap = {}
    for (const turn of turns) {
      turnIdToUuidMap[turn.id] = gameIdToUuidMap[turn.gameId]
    }

    await queryInterface.removeColumn('turns', 'gameId')
    await queryInterface.addColumn('turns', 'gameId', { 
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    });

    turns = await models.turn.findAll({})
    for (const turn of turns) {
      const uuidForTurn = turnIdToUuidMap[turn.id]
      await turn.update({
        gameId: uuidForTurn,
      })
    }
    await queryInterface.changeColumn('turns', 'gameId', {
      type: DataTypes.UUID,
      allowNull: false,
    })
    return queryInterface.addConstraint(
      'turns',
      ['gameId'],
      {
        type: 'foreign key',
        name: 'gameId_fk',
        references: {
          table: 'games',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'turns',
      'gameId_fk'
    )
    await queryInterface.removeColumn('turns', 'gameId')
    await queryInterface.addColumn('turns', 'gameId', {
      type: DataTypes.INTEGER,
    })
    await queryInterface.removeConstraint(
      'games',
      'games_pkey',
    )
    await queryInterface.addConstraint(
      'games',
      ['id'],
      {
        type: 'primary key',
        name: 'games_pkey',
      }
    )
    await queryInterface.addConstraint(
      'turns',
      ['gameId'],
      {
        type: 'foreign key',
        name: 'gameId_fk',
        references: {
          table: 'games',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    )

    // TODO: Didn't work?
    return queryInterface.removeColumn('games', 'uuid');
    // return queryInterface.removeConstraint(
    //   'turns',
    //   ['gameId']
    // )
  }
};
