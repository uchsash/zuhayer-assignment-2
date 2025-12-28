import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { bookingServices } from "./bookings.services";
import { checkBookingExpiry } from "../../utils/bookingUtils";


const createBooking = async (req: Request, res: Response) => {
    try {
        await checkBookingExpiry();

        const { id: customerId, role } = req.user as JwtPayload;

        const { customer_id, vehicle_id, rent_start_date: startTime, rent_end_date: endTime } = req.body;

        if(String(customerId) !== String(customer_id) && role !== "admin"){
            res.status(403).json({
                success: false,
                message: "You are not authorized",
            });
            
            return;
        }

        const result = await bookingServices.createBookingInService(customer_id as string, vehicle_id as string, startTime, endTime);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });

    } catch (err: any) {
        if (err.message === "Vehicle not found") {
            res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        } else if (err.message === "This vehicle is already booked") {
            res.status(400).json({
                success: false,
                message: "This vehicle is already booked",
            });
        } else if (err.message === "End date must be after start date") {
            res.status(400).json({
                success: false,
                message: "End date must be after start date",
            });
        } else {
            res.status(500).json({
                success: false,
                message: err.message || "Something went wrong",
            });
        }
    }
};

const getBookings = async (req: Request, res: Response) => {

    try {
        await checkBookingExpiry();

        const { id: userId, role: userRole } = req.user as JwtPayload;

        if (userRole === 'admin') {
            const result = await bookingServices.getAllBookings();

            res.status(200).json({
                success: true,
                message: "Bookings retrieved successfully",
                data: result
            });
        } else {
            const result = await bookingServices.getSingleUserBookings(userId as string);

            res.status(200).json({
                success: true,
                message: "Your bookings retrieved successfully",
                data: result
            });
        }

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
};

const updateBooking = async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    const { id: userId, role: userRole } = req.user as JwtPayload;

    try {

        const result = await bookingServices.updateBookingStatusInService(bookingId as string, status, userId as string, userRole);

        if (status === 'returned') {
            res.status(200).json({
                success: true,
                message: "Booking marked as returned. Vehicle is now available",
                data: {
                    ...result,
                    vehicle: { availability_status: "available" }
                }
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Booking cancelled successfully",
                data: result
            });
        }

    } catch (err: any) {
        if (err.message == "400") {
            res.status(400).json({
                success: false,
                message: "You cannot cancel a booking after the rental has started"
            });
        } else if (err.message == "403") {
            res.status(500).json({
                success: false,
                message: "You are not authorized"
            });
        } else if (err.message == "404") {
            res.status(500).json({
                success: false,
                message: "Booking not found"
            });
        } else {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
};

export const bookingController = {
    createBooking,
    getBookings,
    updateBooking
}