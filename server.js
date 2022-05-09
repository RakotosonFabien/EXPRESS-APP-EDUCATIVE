// Use Express
const express = require("express");
// Use body-parser
const bodyParser = require("body-parser");
// Use MongoDB
const mongodb = require("mongodb");
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient
const mongoose = require('mongoose');
var ObjectID = mongodb.ObjectID;
var assert = require('assert');
const { create } = require("domain");
// The database variable
var database;
require('./dotenv')

// Local database URI.
const LOCAL_DATABASE = "mongodb://localhost:27017/app";
// Local port.
const LOCAL_PORT = 8080;
// Init the server
const db_url = process.env.DB_URL || LOCAL_DATABASE
//simple connection mongodb

//mongoose connection
mongoose.connect(
  db_url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (error) => {
    if (error) {
      console.log('ERROR DB ' + error)
    }
    var server = app.listen(process.env.PORT || LOCAL_PORT, function () {
      var port = server.address().port;
      console.log("App now running on port", port);
    });
    session = mongoose.startSession();
    console.log("mongodb is connected");
  }
);

//const db = mongoose.createConnection(db_url)
//let session = db.startSession();
// Collections
const PRODUCTS_COLLECTION = "products";
//const CLIENTS_COLLECTION = "clients";
//const SEXES_COLLECTION = "sexes";
//const ANIMAUX_COLLECTION = "animaux";
//const AUTHS_COLLECTION = "auth_client";
//const ACTUALITES_COLLECTION = "actualites";
//const FELINS_COLLECTION = "felins";
//const ADOPTION_COLLECTION = "demande_adoption";
//const AUTRES_IMAGE_COLLECTION = "autres_image";
var constants = require('./schemas/Constantes')
const WsRenderer = require('./schemas/WsRenderer')
const AuthSchema = require('./schemas/Auth')
const ClientSchema = require('./schemas/Client')
const AnimalSchema = require('./schemas/Animal')
const AnimalCompletSchema = require('./schemas/AnimalComplet')
const SexeSchema = require('./schemas/Sexe')
const FelinSchema = require('./schemas/Felin')
//MONGOOSE MODEL
var Auth = new mongoose.model('auth_utilisateurs', AuthSchema, constants.AUTHS_COLLECTION)
var Client = new mongoose.model('client', ClientSchema, constants.CLIENTS_COLLECTION)
var Animal = new mongoose.model('animal', AnimalSchema, constants.ANIMAUX_COLLECTION)
var AnimalComplet = new mongoose.model('animalComplet', AnimalCompletSchema, constants.ANIMAUX_COMPLETS)
var Sexe = new mongoose.model('sexe', SexeSchema, constants.SEXES_COLLECTION)
var Felin = new mongoose.model('felin', FelinSchema, constants.FELINS_COLLECTION)
// Create new instance of the express server
var app = express();

// Define the JSON parser as a default way 
// to consume and produce data through the 
// exposed APIs
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({
  limit: '50mb'
}))
// Create link to Angular build directory
// The `ng build` command will save the result
// under the `dist` folder.
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));
//mongodbconnection
MongoClient.connect(db_url, { useUnifiedTopology: true }).then(client => {
  db = client.db('amitsi')
  //felins
  app.get('/api/felins', function (req, res) {
    Felin.find(req.params).then((resultats) => {
      res.json(new WsRenderer("Liste des felins", 200, resultats).jsonReturn())
    }).catch(error => {
      res.json(new WsRenderer(error, 400).jsonReturn())
    })
  })
  //sexes
  app.get('/api/sexes', function (req, res) {
    Sexe.find(req.params).then((resultats) => {
      res.json(new WsRenderer("Liste des sexes", 200, resultats).jsonReturn())
    }).catch(error => {
      res.json(new WsRenderer(error, 400).jsonReturn())
    })
  })
  //CRUD animal
  app.get('/api/animal', function (req, res) {
    AnimalComplet.find(req.params).then((resultats) => {
      console.log(resultats)
      res.json(new WsRenderer("Liste des animaux", 200, resultats).jsonReturn())
    }).catch(error => {
      res.json(new WsRenderer(error, 400).jsonReturn())
    })

  })
  app.post('/api/animal', function (req, res) {
    var animal = new Animal(req.body)
    animal.id_felin = ObjectId(animal.id_felin)
    animal.id_sexe = ObjectId(animal.id_sexe)
    console.log()
    animal.save(function (error, resultat) {
      if(error)
        res.json(new WsRenderer(error, 400))
      res.json(new WsRenderer("Nouvel animal insere avec succes", 200, { insertedId: resultat.id }).jsonReturn())
    })
      
  })
  app.get('/api/animal/:_id', function (req, res) {
    var _id = req.params._id
    Animal.findById(_id).then(animal => {
      res.json(new WsRenderer("Fiche animal succes", 200, animal).jsonReturn())
    }).catch(error => {
      console.log(error)
      res.json(new WsRenderer("Fiche animal echoue ==> " + error, 400).jsonReturn())
    })
  })
  //CLIENTS
  app.get('/api/client/:id', function (req, res) {
    var id = req.params.id
    Client.findById(id).select('nom prenom image email num_tel date_inscription').then(client => {
      res.json(new WsRenderer("Fiche client succes", 200, client).jsonReturn())
    }).catch(error => {
      res.json(new WsRenderer("Fiche client echoue ==> " + error, 400).jsonReturn())
    })
  })
  //inscription et login
  app.post('/api/inscription', function (req, res) {
    var client = new Client(req.body)
    var auth = new Auth(req.body)
    if (req.body.mdp_confirmation != null && req.body.mdp != null) {
      if (req.body.mdp_confirmation != req.body.mdp) {
        res.json(new WsRenderer("Mots de passe differents", 400).jsonReturn())
      }
    }
    else {
      res.json(new WsRenderer("Mot de passe obligatoire", 400).jsonReturn())
    }
    client.inscription(res, false, auth)
  })
  app.post('/api/login-client', function (req, res) {
    var client = new Client(req.body)
    var auth = new Auth(req.body)
    client.is_admin = false
    client.testLogin(db, auth).then(resultat => {
      if (resultat != null) {
        res.json(new WsRenderer("Authentification client reussi", 200, {
          token: resultat.auth_utilisateurs[0].token,
          id_client: resultat._id
        }).jsonReturn())
      }
      else {
        res.json(new WsRenderer("Identification non valide", 400))
      }
    })
      .catch(error => {
        res.json(new WsRenderer(error, 400).jsonReturn())
      })
  })
})
//Clients

app.get("/api/status", function (req, res) {
    res.status(200).json({ status: "UP" });
});

/*  "/api/products"
 *  GET: finds all products
 */
app.get("/api/products", function (req, res) {
    database.collection(PRODUCTS_COLLECTION).find({}).toArray(function (error, data) {
        if (error) {
            manageError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(data);
        }
    });
});

/*  "/api/products"
 *   POST: creates a new product
 */
app.post("/api/products", function (req, res) {
    var product = req.body;
    if (!product.name) {
        manageError(res, "Invalid product input", "Name is mandatory.", 400);
    } else if (!product.brand) {
        manageError(res, "Invalid product input", "Brand is mandatory.", 400);
    } else {
        database.collection(PRODUCTS_COLLECTION).insertOne(product, function (err, doc) {
            if (err) {
                manageError(res, err.message, "Failed to create new product.");
            } else {
                res.status(201).json(doc.ops[0]);
            }
        });
    }
});

/*  "/api/products/:id"
 *   DELETE: deletes product by id
 */
app.delete("/api/products/:id", function (req, res) {
    if (req.params.id.length > 24 || req.params.id.length < 24) {
        manageError(res, "Invalid product id", "ID must be a single String of 12 bytes or a string of 24 hex characters.", 400);
    } else {
        database.collection(PRODUCTS_COLLECTION).deleteOne({ _id: new ObjectID(req.params.id) }, function (err, result) {
            if (err) {
                manageError(res, err.message, "Failed to delete product.");
            } else {
                res.status(200).json(req.params.id);
            }
        });
    }
});

// Errors handler.
function manageError(res, reason, message, code) {
    console.log("Error: " + reason);
    res.status(code || 500).json({ "error": message });
}
