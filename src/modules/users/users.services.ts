import { pool } from "../../config/db";


const getUserInService = async()=>{
    const result = await pool.query(`SELECT id, name, email, phone, role FROM users`);

    return result;
}

const getSingleUserInService = async(id: string)=>{
    const result = await pool.query(`SELECT id, name, email, phone, role FROM users WHERE id = $1`, [id]);
    
    return result;
}

const updateUserInService = async(name : string, email : string, phone: string, role: string, id : string, reqRole: string)=>{

    const findingUser = await getSingleUserInService(id as string);

    if (findingUser.rows.length === 0) {
      throw new Error("404");
    }

    const existingUser = findingUser.rows[0];

    let updatedRole = existingUser.role;
    if (reqRole === 'admin' && role) {
      updatedRole = role;
    }

    const updatedName = name || existingUser.name;
    const updatedPhone = phone || existingUser.phone;
    const updatedEmail = email || existingUser.email;


    const result = await pool.query(`UPDATE users SET name=$1, email=$2, phone=$3, role=$4, updated_at=NOW() WHERE id=$5 RETURNING *`, [updatedName, updatedEmail, updatedPhone, updatedRole, id]);

    return result;
}

const deleteUserInService = async(id: string)=>{
    const activeBookingsCheck = await pool.query(`SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`, [id]);

    if (activeBookingsCheck.rows.length > 0) {
        throw new Error("400");
    }
    
    const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    return result;
}

export const userServices = {
    getUserInService,
    getSingleUserInService,
    updateUserInService,
    deleteUserInService,
}