'use strict';
const { DataTypes } = require("sequelize"); // Import the built-in data types
const { v4: uuidv4 } = require("uuid");
const models = require('../models');


// URGENT: BEFORE RUNNING THIS, be sure to ADD this to the game model:
// uuid: DataTypes.UUID
// Once the migration is successful, you must remove it. Hacky, but here we are :(
// Note: Make sure turns.gameId is populated
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
    await queryInterface.removeConstraint('turns','gameId_fk')
    await queryInterface.removeConstraint('games','games_pkey');
    let turns = await models.turn.findAll({})
    const turnIdToUuidMap = {}
    for (const turn of turns) {
      turnIdToUuidMap[turn.id] = gameIdToUuidMap[turn.gameId]
    }

    await queryInterface.removeColumn('turns', 'gameId')
    await queryInterface.addColumn('turns', 'gameId', { 
      type: DataTypes.UUID,
    });

    turns = await models.turn.findAll({})
    for (const turn of turns) {
      const uuidForTurn = turnIdToUuidMap[turn.id]
      await turn.update({
        gameId: uuidForTurn,
      })
    }
    await queryInterface.renameColumn('games', 'id', 'oldId')
    await queryInterface.renameColumn('games', 'uuid', 'id')

    await queryInterface.changeColumn('turns', 'gameId', {
      type: DataTypes.UUID, // necessary for validation
      allowNull: false,
    })
    await queryInterface.changeColumn('games', 'oldId', {
      type: DataTypes.INTEGER, // necessary for validation
      autoIncrementIdentity: true,
      allowNull: true,
    })

    await queryInterface.addConstraint(
      'games',
      ['id'],
      {
        type: 'primary key',
        name: 'games_pkey',
      }
    )
    return queryInterface.addConstraint(
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
  },
  // URGENT: After running this, update game model to remove uuid
  // Note: NOT reverse-engineering turn.gameIds from uuids.. Not super worth it at this moment
  // Note: You may need to populate 'oldId' if running this reverse migration
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'turns',
      'gameId_fk'
    )
    await queryInterface.removeConstraint(
      'games',
      'games_pkey',
    )
    await queryInterface.removeColumn('turns', 'gameId')
    await queryInterface.addColumn('turns', 'gameId', {
      type: DataTypes.INTEGER,
    })

    await queryInterface.removeColumn('games', 'id');
    await queryInterface.renameColumn('games', 'oldId', 'id')


    await queryInterface.changeColumn('games', 'id', {
      type: DataTypes.INTEGER, // necessary to redefine type for validation
      allowNull: false,
    })

    await queryInterface.addConstraint(
      'games',
      ['id'],
      {
        type: 'primary key',
        name: 'games_pkey',
      }
    )
    return queryInterface.addConstraint(
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
  }
};
