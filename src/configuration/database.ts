import "./dns";
import {Pool} from "pg";
import "dotenv/config";

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const connectDB = async()=>{
    try{
        const client=await pool.connect();
        console.log("Connected PostgreSQL");
        client.release();
    }
    catch(error){
        console.log(`Dabase connection failed: ${error}`);
    }
}