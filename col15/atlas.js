const { MongoClient } = require('mongodb');
const fs =require('fs')


async function uploadToAtlas({data}){
  try {
    
 
  const uri = process.env.mongodb_url
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('data.length...',data.length)
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
  const collection = clnt.db("ecom").collection("collection2023");
  const response = await collection.bulkWrite(bulkData)

  debugger;
  clnt.close()
} catch (error) {
    console.log('Mongo db Error',error)
}
}

module.exports={uploadToAtlas}
