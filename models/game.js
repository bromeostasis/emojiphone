'use strict';
module.exports = (sequelize, DataTypes) => {
  const game = sequelize.define('game', {
  	completed: DataTypes.BOOLEAN,
    restarted: DataTypes.BOOLEAN,
    token: DataTypes.STRING,
    tokenExpiry: DataTypes.DATE,
    // uuid: DataTypes.UUID, // For temporary column in migration, not used live
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    }
  }, {});
  game.associate = function(models) {
    // associations can be defined here
  };
  return game;
};