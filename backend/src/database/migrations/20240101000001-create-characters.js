'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('characters', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      external_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      species: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(100),
        defaultValue: '',
      },
      gender: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      origin_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      location_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      episode: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('characters', ['name']);
    await queryInterface.addIndex('characters', ['status']);
    await queryInterface.addIndex('characters', ['species']);
    await queryInterface.addIndex('characters', ['gender']);
    await queryInterface.addIndex('characters', ['is_deleted']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('characters');
  },
};
