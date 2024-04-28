const express = require("express");
const cors = require("cors");
const crafts = require("./data.json");
const blogs = require("./blogs.json");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    withCredentials: true,
  })
);

app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.znfmgop.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const craftCollections = client.db("craftDB").collection("crafts");

    app.get("/crafts", async (req, res) => {
      const cursor = craftCollections.find();
      const result = await cursor.toArray();
      res.send(result);
      console.log(result);
    });

    app.get("/crafts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await craftCollections.findOne(query);
      res.send(result);
      console.log(result);
    });

    app.post("/crafts", async (req, res) => {
      const newCrafts = req.body;
      console.log(newCrafts);
      const result = await craftCollections.insertOne(newCrafts);
      res.send(result);
    });
    app.get("/myArt/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await craftCollections
        .find({ email: req.params.email })
        .sort({ customization: 1 }) // Sort by the "customization" field in descending order
        .toArray();
      res.send(result);
    });

    app.put("/crafts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCraft = req.body;
      const craft = {
        $set: {
          item_Name: updatedCraft.item_Name,
          subcategory_Name: updatedCraft.subcategory_Name,
          short_description: updatedCraft.short_description,
          price: updatedCraft.price,
          rating: updatedCraft.rating,
          customization: updatedCraft.customization,
          processing_time: updatedCraft.processing_time,
          stockStatus: updatedCraft.stockStatus,
          image: updatedCraft.image,
        },
      };
      const result = await craftCollections.updateOne(filter, craft, options);
      res.send(result);
    });

    app.delete("/crafts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await craftCollections.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//MIDDLEWARE

app.get("/", (req, res) => {
  res.send("art and craft server");
});
app.get("/blogs", (req, res) => {
  res.send(blogs);
});

app.listen(port, () => {
  console.log(`art and craft server is running on port: ${port}`);
});
