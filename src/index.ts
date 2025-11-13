import { connectToMongoDB } from "./baseDatos";
import express from "express"
import rutillas from "./routes"
import dotenv from "dotenv"

dotenv.config()


connectToMongoDB();
const app = express();
app.use(express.json());

app.use("/api/Clase1", rutillas)

app.listen(3000, ()=>console.log("El API comenzó en el puerto 3000"));