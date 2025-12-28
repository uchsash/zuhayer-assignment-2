import { pool } from "../config/db";


export const checkBookingExpiry = async () => {

    const now = new Date();

    const expiredBookingsResult = await pool.query(`
        SELECT id, vehicle_id 
        FROM bookings 
        WHERE status = 'active' AND rent_end_date < NOW()
    `);

    const expiredBookings = expiredBookingsResult.rows;
    
    if (expiredBookings.length === 0) {
        return;
    }

    for (const booking of expiredBookings) {

        await pool.query(
            `UPDATE bookings SET status = 'returned' WHERE id = $1`,
            [booking.id]
        );

        await pool.query(
            `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
            [booking.vehicle_id]
        );
    }
};