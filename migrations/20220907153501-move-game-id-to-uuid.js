'use strict';
const { DataTypes } = require("sequelize"); // Import the built-in data types
const { v4: uuidv4 } = require("uuid");
const models = require('../models');


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('games', 'uuid', { 
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      // allowNull: false,
      primaryKey: true,
    });
    const games = await models.game.findAll({})
    for (const game of games) {
      console.log('whats this?', game)
      await game.update({
        uuid: uuidv4(),
      })
    }
    return
    // return queryInterface.addConstraint(
    //   'turns',
    //   ['gameId'],
    //   {
    //     type: 'foreign key',
    //     name: 'gameId_fk',
    //     references: {
    //       table: 'games',
    //       field: 'id'
    //     },
    //     onDelete: 'cascade',
    //     onUpdate: 'cascade'
    //   }
    // )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('games', 'uuid');
    // return queryInterface.removeConstraint(
    //   'turns',
    //   ['gameId']
    // )
  }
};
