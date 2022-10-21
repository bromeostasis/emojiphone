'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    await queryInterface.addColumn('users', 'needsOnboarding', { 
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    })

    // Don't onboarding existingusers
    return queryInterface.bulkUpdate('users', {
      needsOnboarding: false,
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'needsOnboarding')
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
