import pool from "../conexionDB.js"
export const getServiciosActivos = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.IdServicio, 
        s.DescripcionProblema, 
        s.Diagnostico,
        s.Estado, 
        s.Precio,
        s.FechaInicio,
        a.Patente, 
        a.Modelo,
        c.Nombre AS NombreCliente,
        c.Rut AS RutCliente
      FROM Servicio s
      INNER JOIN Auto a ON s.IdAuto = a.IdAuto
      INNER JOIN Cliente c ON s.IdCliente = c.IdCliente
      WHERE s.Estado IN ('Pendiente', 'En Diagnostico', 'En reparación')
      ORDER BY s.FechaInicio ASC
    `)

    res.json(rows)
  } catch (error) {
    next(error)
  }
}