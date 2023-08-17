'use strict'
// 為了補齊R01新出現migration
// 不然會出現: ERROR: Unable to find migration: 20171125081136-xxxxxx.js
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.resolve()
  },

  down: function (queryInterface) {
    return Promise.resolve()
  }
}
