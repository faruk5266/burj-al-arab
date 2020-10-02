const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config()
console.log(process.env.DB_PASS);

const port = 5000
const pass = "arabianHorse79";


var serviceAccount = require("./burj-al-arab-825aa-firebase-adminsdk-btdti-0d369ca948.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://burj-al-arab-825aa.firebaseio.com"
});



const app = express();
app.use(cors());
app.use(bodyParser.json());



const uri =` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0p7gq.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking);
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({idToken}); 
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    console.log(tokenEmail, queryEmail);
                    if(tokenEmail == queryEmail){
                        bookings.find({email: queryEmail})
                        .toArray((err, documents) => {
                            res.send(documents);  
                        })
                    }
                    else{
                        res.status(401).send('unauthorized access');
                    }

                }).catch(function (error) {
                    res.status(401).send('unauthorized access');
                });
        }
        else{
            res.status(401).send('unauthorized access');
        }

    })


});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)