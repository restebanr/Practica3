import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {NextFunction, Request, Response} from "express";

dotenv.config();

const SECRET = process.env.SECRET;

export interface AuthRequest extends Request {
    user?: jwt.JwtPayload | string;
};

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const headerToken = req.headers["authorization"];
    const token = headerToken && headerToken.split(" ")[1];

    // Si no metemos token, sale esto
    if(!token){
        return res.status(401).json({message: "No HaY Token"});
    };

    // Vemos si el token sea válido
    jwt.verify(token, SECRET as string, (err, decoded) => {
        if(err){
            // Si el token está mal devolvemos error
            return res.status(401).json({message: "Token inválido"});
        }

        // Guardamos la info del token
        req.user= decoded;
        next();
    })
}
