const express = require('express')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()
console.log(process.env.DB_PASS);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n968s.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 5000;

//this is a message


var serviceAccount = require("./volunteer-network-916a4-firebase-adminsdk-mq1dy-37ae20b24a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-916a4.firebaseio.com"
});


const pass = "";


const app = express();
app.use(cors());
app.use(bodyParser.json());



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



client.connect(err => {
  const eventCollection = client.db("volunteer-network").collection("events");
  console.log("Db connected")

  app.post('/addEvent', (req, res) => {
    const newEvent = req.body;
    eventCollection.insertOne(newEvent)
      .then(result => {
        res.send(result.insertedCount > 0);
      })

  })

  app.get('/selected', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
  
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
         console.log(tokenEmail,queryEmail);
        if(tokenEmail == queryEmail) {
          eventCollection.find({email:queryEmail})
          .toArray((err,documents) => {
            res.status(200).send(documents)
          })
            }
            else {
              res.status(401).send('unauthorized access');
           }
       
          // ...
        }).catch(function (error) {
          res.status(401).send('unauthorized access');
        });

    }
    else {
       res.status(401).send('unauthorized access');
    }




  })

  app.delete('/delete/:id', (req, res) => {
    eventCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        console.log(result);
      })
  })


});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})