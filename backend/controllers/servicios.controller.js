import pool from "../conexionDB.js"

export const getallServicios = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Servicio")
    res.json(rows)
  } catch (error) {
    next(error)
  }
}

export const getServicio = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Servicio WHERE IdServicio = ?", [req.params.id])
    if (rows.length <= 0) return res.status(404).json({ message: "Servicio no encontrado" })
    res.json(rows[0])
  } catch (error) {
    next(error)
  }
}

export const createServicio = async (req, res, next) => {
  try {
    const { IdCliente, IdAuto, FechaInicio, FechaTermino, DescripcionProblema, Diagnostico, Estado, Precio } = req.body
    
    const [serviciosActivos] = await pool.query(
      `SELECT IdServicio, Estado 
       FROM Servicio 
       WHERE IdAuto = ? AND Estado NOT IN ('Finalizado', 'Cancelado')`,
      [IdAuto]
    )

    if (serviciosActivos.length > 0) {
      return res.status(409).json({
        error: `El vehículo ya tiene un servicio activo (#${serviciosActivos[0].IdServicio} en estado "${serviciosActivos[0].Estado}"). Debe finalizarse antes de registrar uno nuevo.`
      })
    }
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
    next(error)
  }
}

export const updateServicio = async (req, res, next) => {
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
    next(error)
  }
}

export const deleteServicio = async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM Servicio WHERE IdServicio = ?", [req.params.id])
    if (result.affectedRows <= 0) return res.status(404).json({ message: "Servicio no encontrado" })
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}