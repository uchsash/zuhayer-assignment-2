import { Request, Response } from "express";
import { userServices } from "./users.services";
import { JwtPayload } from "jsonwebtoken";


const getUser = async (req: Request, res: Response) => {

  try {
    const result = await userServices.getUserInService();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  try {
    const tarId = req.params.userId;
    console.log(tarId);

    const { id: reqId, role: reqRole } = req.user as JwtPayload;

    if (reqId !== tarId && reqRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to see another user's data",
      })
    }

    const result = await userServices.getSingleUserInService(tarId as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User data retrieved successfully",
        data: result.rows[0]
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

const updateUser = async (req: Request, res: Response) => {
  let { name, email, phone, role } = req.body;
  const tarId = req.params.userId;

  const { id: reqId, role: reqRole } = req.user as JwtPayload;


  if (reqId !== tarId && reqRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to see another user's data",
    })
  }

  try {
    const result = await userServices.updateUserInService(name, email, phone, role, tarId as string, reqRole);
    
    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: result.rows[0]
      });

  } catch (err: any) {
    if(err.message === '404'){
      res.status(404).json({
      success: false,
      message: 'User not found',
    });
    }else{
      res.status(500).json({
      success: false,
      message: err.message,
    });
    }
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.deleteUserInService(req.params.userId as string);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    }
  } catch (err: any) {
    if(err.message == "400"){
      res.status(400).json({
      success: false,
      message: "Cannot delete user. The user has active bookings."
    });
    }else{
      res.status(500).json({
      success: false,
      message: err.message,
    });
    }
  }
};

export const userControllers = {
  getUser,
  getSingleUser,
  updateUser,
  deleteUser,
}