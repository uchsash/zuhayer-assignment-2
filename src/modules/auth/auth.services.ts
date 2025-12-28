import { pool } from "../../config/db"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';
import config from "../../config";

const createUser = async(name : string, email : string, password: string, phone: string, role: string)=>{

    const hashedPass = await bcrypt.hash(password as string, 10)

    const result = await pool.query(`
          INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *
          `, [name, email, hashedPass, phone, role]);
    
        return result;
};

const signInUser = async(email: string, password: string)=>{
    const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    if(result.rows.length === 0){
        throw new Error("User not found");
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if(!match){
        throw new Error("Password does not match");
    }

    // token
    const token = jwt.sign({name: user.name, email: user.email, role: user.role, id: String(user.id)}, config.jwtSecret as string, {
        expiresIn: "7d"
    } );

    return {token, user};
}

export const authServices = {
    createUser,
    signInUser,
}