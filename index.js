const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());

// Verifining jwt token
// const verifingToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: "unAuthorize" });
//   }
//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.USER_JWT_TOKEN, (err, decoded) => {
//     if (err) return res.status(403).send({ message: "forbidden" });
//     req.decoded = decoded;
//     next();
//   });
// };
// Create a get api

// "mongodb+srv://mongodbUser:hSMFLPo6zrAqzr8w@cluster0.6plls.mongodb.net/myFirstDatabase?retryWrites=

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.6plls.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("power_hack").collection("users");
    const billListCollection = client.db("power_hack").collection("billList");

    // user added or replace on the database
    app.put("/users", async (req, res) => {
      let filter = { email: req.body.email };
      let data = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: data,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //   get the all user
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);

      const result = await cursor.toArray();
      res.send(result);
    });
    //   get the all data
    app.get("/", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = billListCollection.find(query);
      if (page || size) {
        const result = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
        res.send(result);
      } else {
        const result = await cursor.toArray();
        res.send(result);
      }
    });

    // get bill list count
    app.get("/billCount", async (req, res) => {
      const query = {};
      const cursor = billListCollection.find(query);
      const count = await cursor.count();
      res.send({ count });
    });
    // bill list added or replace on the database
    app.put("/", async (req, res) => {
      let filter = { email: req.body.email };
      let data = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: data,
      };
      const result = await billListCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Delete single bill list from database
    app.delete("/:id", async (req, res) => {
      let id = req.params.id;
      let query = { _id: ObjectId(id) };
      const result = await billListCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send(result);
      }
    });
    // Edit single bill list from database
    app.put("/:id", async (req, res) => {
      let id = req.params.id;
      let data = req.body;
      console.log(data);
      let query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: data,
      };
      const result = await billListCollection.updateOne(query, updateDoc);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
