import { pool } from "../../config/db";

const createVehicle = async (vehicle_name: string, type: string, registration_number: string, daily_rent_price: number, availability_status: string) => {

    const result = await pool.query(`
          INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1, $2, $3, $4, $5) RETURNING *
          `, [vehicle_name, type, registration_number, daily_rent_price, availability_status]);

    return result;
};

const getVehicleInService = async () => {
    const result = await pool.query(`SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles`);

    return result;
};

const getSingleVehicleInService = async (id: string) => {
    const result = await pool.query(`SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1`, [id]);

    return result;
};

const updateVehicleInService = async (vehicle_name: string, type: string, registration_number: string, daily_rent_price: number, availability_status: string, id: string) => {

    const findingVehicle = await getSingleVehicleInService(id as string);

    if (findingVehicle.rows.length === 0) {
        throw new Error("404");
    }

    const existingVehicle = findingVehicle.rows[0];

    const updatedVehicleName = vehicle_name || existingVehicle.vehicle_name;
    const updatedVehicleType = type || existingVehicle.type;
    const updatedVehicleReg = registration_number || existingVehicle.registration_number;
    const updatedVehicleRent = daily_rent_price || existingVehicle.daily_rent_price;
    const updatedVehicleAvailability = availability_status || existingVehicle.availability_status;


    const result = await pool.query(`UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5, updated_at=NOW() WHERE id=$6 RETURNING *`, [updatedVehicleName, updatedVehicleType, updatedVehicleReg, updatedVehicleRent, updatedVehicleAvailability, id]);

    return result;
};

const deleteVehicleInService = async (id: string) => {

    const activeBookingsCheck = await pool.query(`SELECT id FROM bookings WHERE vehicle_id = $1 AND status = 'active'`, [id]);

    if (activeBookingsCheck.rows.length > 0) {
        throw new Error("400");
    }

    const result = await pool.query(`DELETE FROM vehicles WHERE id = $1`, [id]);
    return result;
};

export const vehicleServices = {
    createVehicle,
    getVehicleInService,
    getSingleVehicleInService,
    updateVehicleInService,
    deleteVehicleInService
}