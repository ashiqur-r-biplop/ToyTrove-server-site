const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const userName = process.env.USER_NAME;
const password = process.env.USER_PASS;

const uri = `mongodb+srv://${userName}:${password}@cluster0.klmvqmu.mongodb.net/?retryWrites=true&w=majority`;

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
    const subCategoryCollection = client
      .db("TOYS")
      .collection("ToySubcategory");

    const commentCollection = client.db("TOYS").collection("comment");

    // indexing start
    const indexKey = { toyName: 1 };
    const indexOption = { name: "toyName" };

    const result = await subCategoryCollection.createIndex(
      indexKey,
      indexOption
    );

    app.get("/allToys/:text", async (req, res) => {
      const searchToy = req.params.text;
      const result = await subCategoryCollection
        .find({ toyName: { $regex: searchToy, $options: "i" } })
        .toArray();
      res.send(result);
    });

    // get toy by useing user email
    app.get("/myToy", async (req, res) => {
      const email = req.query.email;
      const filter = { sellerEmail: email };
      const result = await subCategoryCollection.find(filter).toArray();
      // console.log(result);
      res.send(result);
    });
    // update a toy useing _id in the database
    app.patch("/update/:id", async (req, res) => {
      const body = req?.body;
      const id = req?.params?.id;
      const filter = { _id: new ObjectId(id) };
      const updateToy = {
        $set: {
          sellerName: body?.sellerName,
          sellerEmail: body?.sellerEmail,
          category: body?.category,
          photoUrl: body?.photoUrl,
          toyName: body?.toyName,
          price: body?.price,
          quantity: body?.quantity,
          description: body?.description,
        },
      };
      const option = { upsert: true };
      const result = await subCategoryCollection.updateOne(
        filter,
        updateToy,
        option
      );
      res.send(result);
    });

    // find one toy use Objectid
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await subCategoryCollection.findOne(query);
      res.send(result);
    });

    // find all toy in database
    app.get("/allToys", async (req, res) => {
      const result = await subCategoryCollection.find().limit(20).toArray();
      res.send(result);
    });
    app.get("/AllData", async (req, res) => {
      const result = await subCategoryCollection.find().toArray();
      res.send(result);
    });
    // post by toy in database
    app.post("/allToys", async (req, res) => {
      const body = req.body;
      // console.log(body);
      const result = await subCategoryCollection.insertOne(body);
      res.send(result);
    });
    // filter by toys in title
    app.get("/toys", async (req, res) => {
      const category = req.query.category;
      const filter = { category: category };
      const result = await subCategoryCollection.find(filter).toArray();
      res.send(result);
    });
    // post by comment out website
    app.post("/comment", async (req, res) => {
      const body = req.body;
      const result = await commentCollection.insertOne(body);
      res.send(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await subCategoryCollection.deleteOne(query);
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
  res.send("toy server is running");
});

app.listen(port, () => {
  console.log(`toy ser running on port: ${port}`);
});
