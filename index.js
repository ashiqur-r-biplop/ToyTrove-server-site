const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    // await client.connect();
    const subCategoryCollection = client
      .db("TOYS")
      .collection("ToySubcategory");

    const commentCollection = client.db("TOYS").collection("comment")

    // find all toy in database 
    app.get('/allToys', async(req,res)=>{
        const result = await subCategoryCollection.find().toArray()
        res.send(result)
    })
    // filter by toys in title
    app.get("/toys", async (req, res) => {
      const title = req.query.title;
      const filter = { title:  title };
      const result = await subCategoryCollection.find(filter).toArray();
      res.send(result)
    });

    // post by comment out website
    app.post('/comment',async(req, res)=>{
        const body = req.body
        const result = await commentCollection.insertOne(body)
        res.send(result)
    })

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
