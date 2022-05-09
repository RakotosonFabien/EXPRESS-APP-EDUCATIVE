var md5 = require('md5');
const mongoose = require('mongoose')
const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId
const AuthSchema = new mongoose.Schema({
  date_token: {
    type: Date, required: true
  },
  token: {
    type: String, required: true
  },
  mdp: {
    type: String, required: true
  },
  id_client: {
    type: ObjectId, required: true
  }
})
AuthSchema.methods.getRequestToken = function (req) {
  var tokenUser = req.headers.authorization.split('Bearer ')[1]
  return tokenUser
}
//crypting mdp
AuthSchema.methods.saltedMdp = function () {
  if (this.mdp == null) {
    throw ('Mot de passe obligatoire')
  }
  this.mdp = "MyPassword" + this.mdp + "RussiaMadagascar"
}
AuthSchema.methods.createCryptedMdp = function () {
  this.saltedMdp()
  return md5(this.mdp)
}
//creating token
AuthSchema.methods.saltedToken = function (email) {
  return "MyPasswordMyEmail" + email + this.mdp + Date.now() + "salted"
}
AuthSchema.methods.createToken = function (email) {
  var defaultPassword = this.saltedToken(email)
  return md5(defaultPassword)
}
AuthSchema.methods.inscription = function (client) {
  this.token = this.createToken(client.email)
  this.mdp = this.createCryptedMdp()
  this.id_client = client._id
  this.date_token = Date.now()
  this.save()
}
module.exports = AuthSchema;
