import pool from "../conexionDB.js"

export const getAllClientes = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Cliente")
    res.json(rows)
  } catch (error) {
    next(error)
  }
}

export const getClienteByRut = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Cliente WHERE Rut = ?", [req.params.Rut])
    if (rows.length <= 0) return res.status(404).json({ message: "Cliente no encontrado con ese RUT" })
    res.json(rows[0])
  } catch (error) {
    next(error)
  }
}

export const createCliente = async (req, res, next) => {
  try {
    const { Rut, Nombre, NumeroTelefonico, CorreoElectronico } = req.body
    
    const [rows] = await pool.query(
      "INSERT INTO Cliente (Rut, Nombre, NumeroTelefonico, CorreoElectronico) VALUES (?, ?, ?, ?)",
      [Rut, Nombre, NumeroTelefonico, CorreoElectronico]
    )

    res.status(201).json({
      id: rows.insertId,
      Rut,
      Nombre,
      NumeroTelefonico,
      CorreoElectronico,
    })
  } catch (error) {
    next(error)
  }
}

export const updateCliente = async (req, res, next ) => {
  try {
    const { id } = req.params
    const { Rut, Nombre, NumeroTelefonico, CorreoElectronico } = req.body

    const [result] = await pool.query(
      `UPDATE Cliente 
       SET Rut = IFNULL(?, Rut), 
           Nombre = IFNULL(?, Nombre), 
           NumeroTelefonico = IFNULL(?, NumeroTelefonico), 
           CorreoElectronico = IFNULL(?, CorreoElectronico) 
       WHERE IdCliente = ?`,
      [Rut, Nombre, NumeroTelefonico, CorreoElectronico, id]
    )

    if (result.affectedRows <= 0) return res.status(404).json({ message: "Cliente no encontrado" })

    res.json({ message: "Cliente actualizado correctamente" })
  } catch (error) {
    next(error)
  }
}


export const deleteCliente = async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM Cliente WHERE Rut = ?", [req.params.Rut])

    if (result.affectedRows <= 0) return res.status(404).json({ message: "Cliente no encontrado" })

    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}