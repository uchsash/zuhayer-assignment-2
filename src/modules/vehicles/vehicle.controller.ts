import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.services";
import { checkBookingExpiry } from "../../utils/bookingUtils";


const createVehicle = async (req : Request, res: Response) => {
  let { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

if(daily_rent_price <0){
    return res.status(400).json({
        status: false,
        message: "Invalid Input"
    })
}

  try{
    const result = await vehicleServices.createVehicle(vehicle_name, type, registration_number, daily_rent_price, availability_status);

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: result.rows[0],
      });
  }catch(err: any){
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getVehicles = async (req: Request, res: Response) => {    

  try {
    await checkBookingExpiry();
    
    const result = await vehicleServices.getVehicleInService();

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.rows
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSingleVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getSingleVehicleInService(req.params.vehicleId as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicle retrieved successfully",
        data: result.rows[0]
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  let { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
  const vehicleId = req.params.vehicleId;

  try {
    const result = await vehicleServices.updateVehicleInService(vehicle_name, type, registration_number, daily_rent_price, availability_status, vehicleId as string);
    
    res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: result.rows[0]
      });

  } catch (err: any) {
    if(err.message === '404'){
      res.status(404).json({
      success: false,
      message: 'Vechicle not found',
    });
    }else{
      res.status(500).json({
      success: false,
      message: err.message,
    });
    }
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.deleteVehicleInService(req.params.vehicleId as string);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    }
  } catch (err: any) {
    if(err.message == "400"){
res.status(400).json({
      success: false,
      message: "Cannot delete vehicle. it has active bookings."
    });
    }else{
      res.status(500).json({
      success: false,
      message: err.message,
    });
    }
  }
};


export const vehicleController = {
    createVehicle,
    getVehicles,
    getSingleVehicle,
    updateVehicle,
    deleteVehicle
}