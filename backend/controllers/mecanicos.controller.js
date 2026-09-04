import pool from "../conexionDB.js"

export const getallMecanicos = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Mecanico")
    res.json(rows)
  } catch (error) {
    next(error)
  }
}

export const getMecanico = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Mecanico WHERE IdMecanico = ?", [req.params.id])
    if (rows.length <= 0) return res.status(404).json({ message: "Mecánico no encontrado" })
    res.json(rows[0])
  } catch (error) {
    next(error)
  }
}

export const createMecanico = async (req, res, next) => {
  try {
    const { Nombre, Especialidad, Correo, Contrasenia } = req.body
    const [rows] = await pool.query(
      "INSERT INTO Mecanico(Nombre, Especialidad, Correo, Contrasenia) VALUES(?,?,?,?)",
      [Nombre, Especialidad, Correo, Contrasenia]
    )
    res.status(201).json({
      id: rows.insertId,
      Nombre,
      Especialidad,
      Correo
    })
  } catch (error) {
    next(error)
  }
}

export const updateMecanico = async (req, res, next) => {
  try {
    const { id } = req.params
    const { Nombre, Especialidad, Correo, Contrasenia } = req.body
    const [result] = await pool.query(
      `UPDATE Mecanico SET 
        Nombre = IFNULL(?, Nombre), 
        Especialidad = IFNULL(?, Especialidad), 
        Correo = IFNULL(?, Correo), 
        Contrasenia = IFNULL(?, Contrasenia) 
       WHERE IdMecanico = ?`,
      [Nombre, Especialidad, Correo, Contrasenia, id]
    )
    if (result.affectedRows <= 0) return res.status(404).json({ message: "Mecánico no encontrado" })
    res.json({ message: "Mecánico actualizado correctamente" })
  } catch (error) {
    next(error)
  }
}

export const deleteMecanico = async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM Mecanico WHERE IdMecanico = ?", [req.params.id])
    if (result.affectedRows <= 0) return res.status(404).json({ message: "Mecánico no encontrado" })
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}