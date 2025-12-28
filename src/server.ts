import express, { Request, Response } from "express"
import config from "./config";
import initDB from "./config/db";
import { userRoutes } from "./modules/users/users.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicles/vehicle.routes";
import { bookingRoutes } from "./modules/bookings/bookings.routes";

const app = express();
const port = config.port;


//parser
app.use(express.json());


//Initializing DB
initDB();

// Check if DB is working
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to vehicle Rental System!')
})

//user router
app.use("/api/v1/users", userRoutes);

//auth router
app.use("/api/v1/auth", authRoutes);

//vehicle routes
app.use("/api/v1/vehicles", vehicleRoutes);

//bookings routes
app.use("/api/v1/bookings", bookingRoutes);

// Handling 404
app.use((req : Request, res : Response)=>{
  res.status(404).json({
    success: false,
    message: "URL doesn't exist",
    path: req.path
  });
})

app.listen(port, () => {
  console.log(`This Vehicle Rental System is listening on port ${port}`)
})
