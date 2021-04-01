
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors= require('cors')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config()
console.log(process.env.DB_USER);
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.he6ho.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(port);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log('error',err);
  const productCollection = client.db('laptopStore').collection("products");
  const orderCollection = client.db('laptopStore').collection("orders");
  //get all product and show in home page
  app.get('/products',(req, res)=>{
    productCollection.find({})
    .toArray()
    .then(items=>{
      res.send(items)
      console.log(items);
    })
    .catch(err => console.error(`Failed to find documents: ${err}`))
  })
  //Add new product from Admin page
  app.post('/addProduct',(req, res)=>{
    const newEvent=req.body;
    console.log('adding event:',newEvent);
    productCollection.insertOne(newEvent)
    .then(result=>{
      res.send(result.insertedCount > 0)
    })
  })
  //Add Order when checkout
  app.post('/addOrder',(req, res)=>{
    const order=req.body;
    console.log('adding order:',order);
    orderCollection.insertOne(order)
    .then(result=>{
      console.log('result',result.insertedCount);
      res.send(result.insertedCount > 0)
    })
  })
  //Get order details using email query
  app.get('/order',(req, res)=>{
    const queryEmail=req.query.email;
    if(queryEmail){
      orderCollection.find({email:queryEmail})
      .toArray((err,documents)=>{
      res.status(200).send(documents)
      })
  }
  else{
    res.status(401).send('un-authorize access')
  }
  })
  //delete product
  app.delete('/delete/:id',(req, res)=>{
    const id=ObjectId(req.params.id)
    console.log('delete',id);
    productCollection.findOneAndDelete({_id:id})
    .then(documents=>{
    res.send(!!documents.value)
    console.log("delete",documents)})
  })
  console.log('connected');
  // perform actions on the collection object
  
});

app.listen(port)

