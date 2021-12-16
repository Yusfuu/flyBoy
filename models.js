const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('fly', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

const User = sequelize.define('User', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});


const Flight = sequelize.define('Flight', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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
  }
});


const Reservation = sequelize.define('Reservation', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  }
});

Reservation.belongsTo(Flight);
Reservation.belongsTo(User);
User.hasMany(Reservation);


// sequelize.sync({ force: true });

module.exports = { User, Flight, Reservation };