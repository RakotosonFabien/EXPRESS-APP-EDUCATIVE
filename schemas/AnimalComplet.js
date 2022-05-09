const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId
const AnimalComplet = new Schema({
  nom: { type: String, required: true },
  description: {
    type: String, required: true
  },
  image: {
    type: String
  },
  annee_naissance: {
    type: Number
  },
  id_felin: {
    type: ObjectId
  },
  id_sexe: {
    type: ObjectId
  },
  sexe: {
    _id: ObjectId,
    nom: String
  },
  felin: {
    _id: ObjectId,
    nom : String
  }
});
module.exports = AnimalComplet;
