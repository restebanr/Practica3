import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client: MongoClient;
let db: Db;

export const connectToMongoDB = async(): Promise<void> => {
    try{
        const urlMongo = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.CLUSTER}.8ivrdjk.mongodb.net/?appName=${process.env.CLUSTER_NAME}`;
        client = new MongoClient(urlMongo);
        await client.connect();
        db = client.db("Practica3");
        console.log("Conectado a mongo");
    }catch(err){
        console.error("Error para conectar al Mongo", err);
        process.exit(1);
    }
};

export const getDB = () : Db => db;
