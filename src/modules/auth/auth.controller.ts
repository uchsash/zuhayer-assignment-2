import { Request, Response } from "express";
import { authServices } from "./auth.services";

const SignUpUser = async (req : Request, res: Response) => {
  let { name, email, password, phone, role } = req.body;

  email = email.toLowerCase();
  role = role || 'customer'; 
  if(!password || password.length < 6){
    return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
    })
  }

  try{
    const result = await authServices.createUser(name, email, password, phone, role);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result.rows[0],
      });
  }catch(err: any){
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error"
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;


    try {
        const result = await authServices.signInUser(email, password);

        res.status(200).json({
            success: true,
            message: 'Login Successful',
            data: result,
        });
    } catch (err: any) {
      if(err.message == "User not found"){
        res.status(404).json({
            success: false,
            message: err.message || "User not found"
        });
      }else if(err.message == "Password does not match"){
        res.status(401).json({
            success: false,
            message: err.message || "Password does not match"
        });
      }else{
        res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
      }
        
    }
}

export const authController = {
    SignUpUser,
    loginUser,    
}