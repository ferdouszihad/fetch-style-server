const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.URI;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const commentCollection = client.db("comments").collection("comments");

    app.get("/comments", async (req, res) => {
      const cursor = commentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await commentCollection.findOne(query);
      res.send(result);
    });

    app.post("/comments", async (req, res) => {
      const newComment = req.body;
      console.log(newComment);
      const result = await commentCollection.insertOne(newComment);
      res.send(result);
    });

    app.put("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedComments = req.body;

      const comment = {
        $set: {
          ...updatedComments,
        },
      };

      const result = await commentCollection.updateOne(
        filter,
        comment,
        options
      );
      res.send(result);
    });

    app.delete("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await commentCollection.deleteOne(query);
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

app.get("/", (req, res) => {
  res.send("Comments server is running");
});

app.listen(port, () => {
  console.log(`Comments is running on port: ${port}`);
});
