const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
  logging: false
});

const Profile = require("./Profile")(sequelize, DataTypes);

module.exports = {
  sequelize,
  Profile
};
