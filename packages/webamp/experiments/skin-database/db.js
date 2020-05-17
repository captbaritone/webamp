const db = require("monk")("mongodb://127.0.0.1:27017/winamp");

module.exports = db;
