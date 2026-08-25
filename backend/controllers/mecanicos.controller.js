import pool from "../conexionDB.js"

export const getallMecanicos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Mecanico")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los mecánicos" })
  }
}

export const getMecanico = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Mecanico WHERE IdMecanico = ?", [req.params.id])
    if (rows.length <= 0) return res.status(404).json({ message: "Mecánico no encontrado" })
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el mecánico" })
  }
}

export const createMecanico = async (req, res) => {
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
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "El correo ingresado ya está registrado" })
    }
    res.status(500).json({ message: "Error al crear el mecánico" })
  }
}

export const updateMecanico = async (req, res) => {
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
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "El correo ingresado ya pertenece a otro mecánico" })
    }
    res.status(500).json({ message: "Error al actualizar el mecánico" })
  }
}

export const deleteMecanico = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM Mecanico WHERE IdMecanico = ?", [req.params.id])
    if (result.affectedRows <= 0) return res.status(404).json({ message: "Mecánico no encontrado" })
    res.sendStatus(204)
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el mecánico" })
  }
}