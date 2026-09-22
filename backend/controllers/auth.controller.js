import pool from "../conexionDB.js"
import "dotenv/config"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
export const signin = async(req, res) => {
    try {
        const {Correo, Contrasenia } = req.body
        if (!Correo) return res.status(400).json({ message: "Ingrese el correo" })
        if (!Contrasenia) return res.status(400).json({ message: "Ingrese la contraseña" })
        const [rows] = await pool.query("SELECT * FROM Mecanico WHERE Correo = ?", [Correo])
        if (rows.length  <= 0) return res.status(404).json({ message: "Usuario no encontrado" })
        const usuario = rows[0]
        const contraseñavalidada = await bcrypt.compare(Contrasenia, usuario.Contrasenia)
        if (!contraseñavalidada) return res.status(401).json({ message: "Contraseña incorrecta" })
        const token = jwt.sign({ id: usuario.IdMecanico, ROL: usuario.Rol }, process.env.JWT_SECRET, { expiresIn: "16h" })
        res.status(200).json({ token,
        idMecanico: usuario.IdMecanico, rol: usuario.Rol  })

    } catch (error) {
        res.status(500).json({ message: "Error al iniciar sesión", error: error.message })
}
}
