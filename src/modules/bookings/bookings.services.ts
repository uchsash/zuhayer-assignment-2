import { pool } from "../../config/db";


const createBookingInService = async (customerId: string, vehicle_id: string, startTime: string, endTime: string) => {

  const vehicleRes = await pool.query(
    `SELECT daily_rent_price, availability_status, vehicle_name FROM vehicles WHERE id = $1`,
    [vehicle_id]
  );

  if (vehicleRes.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleRes.rows[0];


  if (vehicle.availability_status !== 'available') {
    throw new Error("This vehicle is already booked");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const timeDifference = end.getTime() - start.getTime();

  const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  if (numberOfDays <= 0) {
    throw new Error("End date must be after start date");
  }

  const totalPrice = numberOfDays * vehicle.daily_rent_price;

  const bookingResult = await pool.query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
     VALUES ($1, $2, $3, $4, $5, 'active') 
     RETURNING *`,
    [customerId, vehicle_id, startTime, endTime, totalPrice]
  );

  const newBooking = bookingResult.rows[0];

  await pool.query(
    `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
    [vehicle_id]
  );

  return {
    ...newBooking,
    vehicle: {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: vehicle.daily_rent_price
    }
  };
};



const getSingleUserBookings = async (userId: string) => {
  const result = await pool.query(`
        SELECT 
            b.*, 
            v.vehicle_name, 
            v.registration_number, 
            v.type as vehicle_type
        FROM bookings b
        JOIN vehicles v ON b.vehicle_id = v.id
        WHERE b.customer_id = $1
    `, [userId]);

  const formattedData = result.rows.map(row => ({
    id: row.id,
    vehicle_id: row.vehicle_id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: row.total_price,
    status: row.status,
    vehicle: {
      vehicle_name: row.vehicle_name,
      registration_number: row.registration_number,
      type: row.vehicle_type
    }
  }));

  return formattedData;
}

const getAllBookings = async () => {

  const result = await pool.query(`
        SELECT 
            b.*, 
            u.name as customer_name, 
            u.email as customer_email,
            v.vehicle_name, 
            v.registration_number,
            v.type as vehicle_type 
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
    `);

  const formattedData = result.rows.map(row => ({
    id: row.id,
    customer_id: row.customer_id,
    vehicle_id: row.vehicle_id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: row.total_price,
    status: row.status,
    customer: {
      name: row.customer_name,
      email: row.customer_email
    },
    vehicle: {
      vehicle_name: row.vehicle_name,
      registration_number: row.registration_number
    }
  }));

  return formattedData;
};

const updateBookingStatusInService = async (id: string, status: string, userId: string, userRole: string) => {

  const bookingCheck = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [id]);

  if (bookingCheck.rows.length === 0) {
    throw new Error("404");
  }
  const currentBooking = bookingCheck.rows[0];

  if (status === 'returned' && userRole !== 'admin') {
    throw new Error("403");
  }

  if (status === 'cancelled' && userRole !== 'admin') {
    
    if (String(currentBooking.customer_id) !== String(userId)) {
      throw new Error("403");
    }

    const currentTime = new Date();
    const startTime = new Date(currentBooking.rent_start_date);
    if (currentTime >= startTime) {
      throw new Error("400");
    }
  }

  const bookingResult = await pool.query(`
      UPDATE bookings 
      SET status = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `, [status, id]);

  const updatedBooking = bookingResult.rows[0];

  if (status === 'cancelled' || status === 'returned') {
    await pool.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
      [currentBooking.vehicle_id]
    );
  }

  return updatedBooking;
};


export const bookingServices = {
  createBookingInService,
  getSingleUserBookings,
  getAllBookings,
  updateBookingStatusInService
};