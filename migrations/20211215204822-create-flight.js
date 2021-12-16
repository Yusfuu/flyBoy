'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('Flights', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      seats: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      departure_airport: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      arrival_airport: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departure_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      arrival_datetime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable('Flights');
  }
};