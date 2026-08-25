import pool from "../conexionDB.js"

export const getallServicios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Servicio")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los servicios" })
  }
}

export const getServicio = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Servicio WHERE IdServicio = ?", [req.params.id])
    if (rows.length <= 0) return res.status(404).json({ message: "Servicio no encontrado" })
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el servicio" })
  }
}

export const createServicio = async (req, res) => {
  try {
    const { IdCliente, IdAuto, FechaInicio, FechaTermino, DescripcionProblema, Diagnostico, Estado, Precio } = req.body
    const [rows] = await pool.query(
      `INSERT INTO Servicio(IdCliente, IdAuto, FechaInicio, FechaTermino, DescripcionProblema, Diagnostico, Estado, Precio) 
       VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
      [IdCliente, IdAuto, FechaInicio, FechaTermino, DescripcionProblema, Diagnostico, Estado, Precio]
    )
    res.status(201).json({
      id: rows.insertId,
      IdCliente,
      IdAuto,
      FechaInicio,
      FechaTermino,
      DescripcionProblema,
      Diagnostico,
      Estado,
      Precio
    })
  } catch (error) {
    res.status(500).json({ message: "Error al crear el servicio" })
  }
}

export const updateServicio = async (req, res) => {
  try {
    const { id } = req.params
    const { IdCliente, IdAuto, FechaInicio, FechaTermino, DescripcionProblema, Diagnostico, Estado, Precio } = req.body
    const [result] = await pool.query(
      `UPDATE Servicio SET 
        IdCliente = IFNULL(?, IdCliente), 
        IdAuto = IFNULL(?, IdAuto), 
        FechaInicio = IFNULL(?, FechaInicio), 
        FechaTermino = IFNULL(?, FechaTermino), 
        DescripcionProblema = IFNULL(?, DescripcionProblema), 
        Diagnostico = IFNULL(?, Diagnostico), 
        Estado = IFNULL(?, Estado), 
        Precio = IFNULL(?, Precio) 
       WHERE IdServicio = ?`,
      [IdCliente, IdAuto, FechaInicio, FechaTermino, DescripcionProblema, Diagnostico, Estado, Precio, id]
    )
    if (result.affectedRows <= 0) return res.status(404).json({ message: "Servicio no encontrado" })
    res.json({ message: "Servicio actualizado correctamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el servicio" })
  }
}

export const deleteServicio = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM Servicio WHERE IdServicio = ?", [req.params.id])
    if (result.affectedRows <= 0) return res.status(404).json({ message: "Servicio no encontrado" })
    res.sendStatus(204)
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el servicio" })
  }
}