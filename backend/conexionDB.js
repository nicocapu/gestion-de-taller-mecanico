import mysql from "mysql2/promise";
import "dotenv/config";
console.log("DB_HOST detectado:", process.env.DB_HOST);
console.log("DB_USER detectado:", process.env.DB_USER);
console.log("DB_NAME detectado:", process.env.DB_NAME);
// Conexión a la BD
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  port: process.env.DB_PORT,
});
async function ProbarConexion(){
    try {
        const conexion = await pool.getConnection();
        console.log("✅ Conexión a la base de datos establecida.");
        conexion.release();
    } catch (error) {
        console.error("❌ Error al conectar con la base de datos:", error);
    }
}
ProbarConexion();
export default pool;