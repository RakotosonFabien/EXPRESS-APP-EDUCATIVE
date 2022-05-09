const mongoose = require('mongoose')
const mongodb = require('mongodb')
const ClientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: false },
  email: { type: String, required: true },
  num_tel: {
    type: String, required: true
  },
  date_inscription: { type: Date, required: true },
  is_admin: Boolean
})
//inscription client mbola tsy mandeha le transaction le. XD
ClientSchema.methods.inscription = function (response, isAdmin, auth) {
  if (this.nom != null && this.prenom != null && this.email != null && this.num_tel != null && auth.mdp != null) {
    this.date_inscription = new Date()
    this.is_admin = isAdmin
    this.save()
      .then(client => {
        auth.inscription(this)
        return this
      }).then((client) => {
        return client
      }).then((client) => {
        response.json(new WsRenderer("Inscription client reussi", 200, { insertedId: client._id }).jsonReturn())
      }).catch(error => {
        response.json(new WsRenderer(error, 400).jsonReturn())
      })
  }
}
ClientSchema.methods.testLogin = function (db, auth) {
  var authCollection = db.collection('user_complet')
  auth.mdp = auth.createCryptedMdp()
  const resultat = authCollection.findOne({
    "email": this.email,
    "auth_utilisateurs.mdp": auth.mdp,
    "is_admin": this.is_admin
  })
  return resultat
}
module.exports = ClientSchema;
