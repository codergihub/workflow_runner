const { MongoClient } = require('mongodb');
const fs =require('fs')
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function uploadToMongodb({data,colName}){
const bulkData =data.map(d=>{
  const {imageUrl}=d
  return   {
    updateOne: {
      filter: { imageUrl },
      update: {
        $set: {
         ...d
        }
      },
      upsert: true,
    }
  }

})

const clnt =await client.connect()
  const collection = clnt.db("ecom").collection(colName);
  const response = await collection.bulkWrite(bulkData)

  debugger;
  clnt.close()
}

module.exports={uploadToMongodb}