import {Router} from "express";
import dotenv from "dotenv"
import { ObjectId } from "mongodb";
import { getDB } from "../baseDatos";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const router = Router();
const SECRET = process.env.SECRET;

type UserDB = {
    _id?: ObjectId,
    username?: string,
    email: string,
    passwordHash?: string,
    createdAt?: Date
};

const coleccion = () => getDB().collection<UserDB>("users");

// POST /api/auth/register
router.post("/register",async(req, res) => {
    try{
        const { username, email, passwordHash} = req.body as UserDB;

        if(!username || typeof username !== "string" || username.trim().length === 0){
            return res.status(400).json({message: "El campo 'username' no puede estar vacío y debe ser string"});
        }

        if(!email || typeof email !== "string"){
            return res.status(400).json({message: "Elcampo 'email' es no puede estar vacío y debe ser string"});
        }

        if(!email.endsWith("@gmail.com")){
            return res.status(400).json({message: "El formato de email inválido y tiene que terminar en @gmail.com"});
        }

        if(!passwordHash || typeof passwordHash !== "string"){
            return res.status(400).json({message: "El campo 'password' no puede estar vacío y debe ser string"});
        }



        const users = await coleccion();

        const existingUsername = await users.findOne({ username });
        if(existingUsername){
            return res.status(409).json({message: "El username ya está registrado"});
        }

        const existingEmail = await users.findOne({ email });
        if(existingEmail){
            return res.status(409).json({message: "El email ya está registrado"});
        }

        const passToEncripta = await bcrypt.hash(passwordHash, 10);

        // Crear el objeto usuario
        const newUser = {
            username: username.trim(),
            email: email.toLowerCase(),
            passwordHash: passToEncripta,
            createdAt: new Date()
        };

        const result = await users.insertOne(newUser);
        res.status(201).json({message: "User created"});
    }
    catch(err){

        console.error("Register erróneo:", err);

        res.status(500).json({message: "Error interno"});
    }
});


// POST /api/auth/login
router.post("/login", async(req, res) =>{
    try{
        const {email, passwordHash } = req.body as UserDB;

        if(!email || typeof email !== "string"){
            return res.status(400).json({message: "El campo 'email' no puede estar vacío"});
        }

        if(!email.endsWith("@gmail.com")){
            return res.status(400).json({message: "El formato de email inválido tiene que terminar en @gmail.com"});
        }

        if(!passwordHash || typeof passwordHash !== "string"){
            return res.status(400).json({message: "El campo 'password' no puede estar vacío"});
        }

        const users = await coleccion();
        const user = await users.findOne({email: email.toLowerCase()});

        // Usuario no encontrado
        if(!user || !user.passwordHash){
            return res.status(404).json({message: "No existe  usuario con dicho email"});
        };

        // Comparar contraseña
        const passMatch = await bcrypt.compare(passwordHash, user.passwordHash);
        
        if(!passMatch) return res.status(401).json({message: "La contrasena es incorrecta"});
        const token = jwt.sign({id: user._id?.toString(), email: user.email}, SECRET as string, {expiresIn: "1h"});

        // Responder token
        res.status(200).json({token});
    }

    catch(err){

        console.error("Login erróneo:", err);

        res.status(500).json({message:"Error interno"});
    }
})

export default router;