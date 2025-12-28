
import { Router } from "express";
import auth from "../../middleware/auth";
import { bookingController } from "./bookings.controller";

const router = Router();

router.post("/", auth("admin", "customer"), bookingController.createBooking);

router.get("/", auth("admin", "customer"), bookingController.getBookings);

router.put("/:bookingId", auth("admin", "customer"), bookingController.updateBooking);


export const bookingRoutes = router;