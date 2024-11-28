const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.port || 5000;
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.COFFEE_DB}:${process.env.COFFEE_DB_PASS}@cluster0.zo35n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("coffeeDB");
    const coffeeCollection = database.collection("coffees");
    //read
    app.get("/coffees", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //create
    app.post("/coffees", async (req, res) => {
      const coffees = req.body;
      console.log("insert this coffee by post method", coffees);
      const result = await coffeeCollection.insertOne(coffees);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//home path
app.get("/", (req, res) => {
  res.send("this is my coffee book server");
});

app.listen(port, () => {
  console.log("the coffee book server run on this port:", port);
});
