const mongoose = require('mongoose')
const FelinSchema = new mongoose.Schema({
  nom: { type: String }
})
module.exports = FelinSchema;
