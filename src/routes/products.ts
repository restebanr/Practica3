import { Router } from "express";
import { getDB } from "../baseDatos";
import { ObjectId } from "mongodb";
import { AuthRequest, verifyToken } from "../middlewares/verifyToken";

const router = Router();

type Product = {
    _id?: ObjectId,
    name: string,
    description?: string,
    price: number,
    stock: number,
    createdAt?: Date
};

const coleccion = () => getDB().collection<Product>("products");

// GET /api/products
router.get("/", async (req, res) => {
    try{
        const products = await coleccion().find().toArray();
        res.status(200).json(products);
    }catch(err){

        console.error("GET /api/products error:", err);
        
        res.status(500).json({message: "Error interno"});
    }
});



// POST /api/products
router.post("/", verifyToken, async (req: AuthRequest, res) => {
    try{
        const { name, description, price, stock } = req.body as Product;

        if(!name || typeof name !== "string" || name.trim().length === 0){
            return res.status(400).json({message: "El campo 'name' no puede estar vacío y tiene que ser un string"});
        }

        if(price === undefined || typeof price !== "number"){
            return res.status(400).json({message: "El campo 'price' no puede estar vacío y tiene que ser un número"});
        }

        if(price <= 0){
            return res.status(400).json({message: "Por favor, ingresa price mayor a 0"});
        }

        if(stock === undefined || typeof stock !== "number"){
            return res.status(400).json({message: "El campo 'stock' no puede estar vacío y tiene que ser un número"});
        }

        if(stock < 0){
            return res.status(400).json({message: "El campo 'stock' tiene que ser mayor que 0"});
        }

        // El producto para guardar en la base de datos
        const productToInsert: Product = {
            name,
            description: description && typeof description === "string" ? description.trim() : "",
            price,
            stock,
            createdAt: new Date()
        };

        const result = await coleccion().insertOne(productToInsert);

        // Cojo el producto creado nuevo para devolverlo en respuesta
        const created = await coleccion().findOne({_id: result.insertedId});
        res.status(201).json(created);

    }catch(err){

        console.error("POST /api/products error:", err);

        res.status(500).json({message: "Error interno"});
    }
});

export default router;
