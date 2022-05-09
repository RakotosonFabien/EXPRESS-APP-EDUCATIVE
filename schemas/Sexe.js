const mongoose = require('mongoose')
const SexeSchema = new mongoose.Schema({
  nom: { type : String }
})
module.exports = SexeSchema;
