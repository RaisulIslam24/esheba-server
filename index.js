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

app.get('/', (req, res) => {
  res.send("Welcome to E-Sheba server.")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const usersCollection = client.db(`${process.env.DB_NAME}`).collection("users");
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
  const reviewsCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");

  console.log("Database connected");


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
  })

  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/checkAdmin', (req, res) => {
    adminCollection.find({ adminEmail: req.body.email })
      .toArray((err, documents) => {
        res.send(documents.length > 0)
      })
  })



  app.get('/services', (req, res) => {
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/serviceDetails/:_id', (req, res) => {
    servicesCollection.find({ _id: ObjectId(req.params._id) })
      .toArray((err, service) => {
        res.send(service[0]);
      })
  })


  app.get('/admins', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/loadAll/:role', (req, res) => {
    usersCollection.find({ role: req.params.role })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.delete('/deleteService/:id', (req, res) => {
    servicesCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        console.log(result)
      })
  })


  app.patch('/updateService/:_id', (req, res) => {
    const UpdatedValues = req.body;
    console.log(UpdatedValues)
    servicesCollection.updateOne(
      { _id: ObjectId(req.params._id) },
      { $set: { isAvaiable: UpdatedValues.isAvaiable, serviceName: UpdatedValues.serviceName, price: UpdatedValues.price, image: UpdatedValues.image, } }
    )
      .then(result => {
        res.send(result.modifiedCount > 0)
        console.log('updated!')
        console.log(result)
      })
  })

  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewsCollection.find({ email: review.email })
      .toArray((err, documents) => {
        if (documents.length > 0) {
          res.send(false);
        } else {
          reviewsCollection.insertOne(review)
            .then(result => {
              res.send(result.acknowledged);
            })
        }
      })

  })

  app.get('/reviews', (req, res) => {
    reviewsCollection.find({})
    .toArray( (err, documents) => {
      res.send(documents);
    })
  })

});



app.listen(process.env.PORT || port);