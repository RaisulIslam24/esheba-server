const express = require('express')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a7xog.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());

const port = 5000

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const usersCollection = client.db(`${process.env.DB_NAME}`).collection("users");
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");

  console.log("Database connected");
  app.get('/', (req, res) => {
    res.send("Welcome to E-Sheba server.")
  })

  app.post('/addUser', (req, res) => {
    const user = req.body;
    usersCollection.findOne({ email: user.email })
      .then(result => {
        if (result) {
          if (result.role === user.role) {
            res.send(true);
          } else {
            res.send(false);
          }
        } else {
          usersCollection.insertOne(user)
            .then(result => {
              res.send(result.acknowledged);
            })
        }
      })

  })

  app.post('/addService', (req, res) => {
    const service = req.body;
    servicesCollection.insertOne(service)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.get('/services', (req, res) => {
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/admins', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

});

app.listen(process.env.PORT || port);