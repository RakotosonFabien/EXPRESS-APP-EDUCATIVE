const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId
const Animal = new Schema({
  nom: { type: String, required: true },
  description: {
    type: String, required : true
  },
  image: {
    type: String
  },
  annee_naissance: {
    type : Number
  },
  id_felin: {
    type : ObjectId
  },
  id_sexe: {
    type: ObjectId
  }
});
module.exports = Animal;
