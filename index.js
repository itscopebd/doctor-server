const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// cardoctors
// bZB1jvK603L97Fw9
// middleware 

app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
  res.send("Server Running");
})




const uri = `mongodb+srv://${process.env.DB_Users}:${process.env.DB_PASS}@cluster0.loltiyt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const veryfyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {

    return res.status(401).send({ error: true, message: 'unauthorize access' })

  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).send({ error: true, message: "unauthorized access" })
    }
    req.decoded = decoded;
    next();
  })

}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("carsDoctors");
    const servicesCollections = database.collection("services");
    const bookingsCollection = database.collection("bookings");


    app.post('/jwt', (req, res) => {

      const user = req.body;

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      });
      res.send({ token })
    })






    app.get("/services/:id", async (req, res) => {

      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollections.findOne(query);
      res.send(result);

    })

    app.get("/bookings", veryfyJWT, async (req, res) => {
      console.log(req.headers)
      let query = {};
      if (req.query?.email) {
        console.log(query)
        query = { email: req.query.email };
      }
      console.log(query)
      const result = await bookingsCollection.find(query).toArray();
      res.send(result)
    })

    app.post("/bookings", async (req, res) => {

      const data = req.body;
      const result = await bookingsCollection.insertOne(data);
      res.send(result)

    })


    app.get("/services", async (req, res) => {
      const cursor = servicesCollections.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query)
      res.send(result)
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);









app.listen(port, () => {
  console.log("running Server")
})