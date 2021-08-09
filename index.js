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

const port = 5001

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const usersCollection = client.db(`${process.env.DB_NAME}`).collection("users");
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  console.log("Database connected");
  app.get('/', (req, res) => {
    res.send("Welcome to E-Sheba server.")
  })

  // e-sheba services
  app.get('/services', (req, res) => {
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  //   client.close();
});

app.listen(process.env.PORT || port);