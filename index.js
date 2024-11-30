const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const userCollection = client.db("usersDB").collection("users");
    //read
    app.get("/coffees", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });
    app.post("/coffees", async (req, res) => {
      const coffees = req.body;
      console.log("insert this coffee by post method", coffees);
      const result = await coffeeCollection.insertOne(coffees);
      res.send(result);
    });
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const coffee = req.body;
      const updateCoffee = {
        $set: {
          name: coffee.name,
          supplier: coffee.supplier,
          category: coffee.category,
          chef: coffee.chef,
          taste: coffee.taste,
          details: coffee.details,
          photo: coffee.photo,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updateCoffee,
        options
      );
      res.send(result);
    });
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    //users
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });
    app.patch("/users", async (req, res) => {
      const email = req.body?.email;
      const filter = { email };
      const updatedLastSignInTime = req.body?.lastSignInTime;
      const updatedUser = {
        $set: {
          lastSignInTime: updatedLastSignInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updatedUser);
      res.send(result);
    });
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
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
