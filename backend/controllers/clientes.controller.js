import pool from "../conexionDB.js"

export const getAllClientes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Cliente")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los clientes" })
  }
}

export const getClienteByRut = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Cliente WHERE Rut = ?", [req.params.Rut])
    if (rows.length <= 0) return res.status(404).json({ message: "Cliente no encontrado con ese RUT" })
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ message: "Error al buscar el cliente por RUT" })
  }
}

export const createCliente = async (req, res) => {
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
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "El RUT ingresado ya está registrado" })
    }
    res.status(500).json({ message: "Error al crear el cliente" })
  }
}

export const updateCliente = async (req, res) => {
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
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "El RUT ingresado ya pertenece a otro cliente" })
    }
    res.status(500).json({ message: "Error al actualizar el cliente" })
  }
}


export const deleteCliente = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM Cliente WHERE Rut = ?", [req.params.Rut])

    if (result.affectedRows <= 0) return res.status(404).json({ message: "Cliente no encontrado" })

    res.sendStatus(204)
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ 
        message: "No se puede eliminar el cliente porque tiene vehículos u órdenes asociadas" 
      })
    }
    res.status(500).json({ message: "Error al eliminar el cliente" })
  }
}