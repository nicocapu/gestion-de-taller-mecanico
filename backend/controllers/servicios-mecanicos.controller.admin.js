import pool from "../conexionDB.js";

export const getTodosLosServiciosAdmin = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.IdServicio,
        s.FechaInicio,
        s.FechaTermino,
        s.DescripcionProblema,
        s.Diagnostico,
        s.Estado,
        s.Precio,
        c.Rut AS RutCliente,
        c.Nombre AS NombreCliente,
        a.Patente,
        a.Modelo,
        m.IdMecanico,
        m.Nombre AS NombreMecanico,
        m.Especialidad AS EspecialidadMecanico
      FROM Servicio s
      INNER JOIN Auto a ON s.IdAuto = a.IdAuto
      INNER JOIN Cliente c ON s.IdCliente = c.IdCliente
      LEFT JOIN ServicioMecanico sm ON s.IdServicio = sm.IdServicio
      LEFT JOIN Mecanico m ON sm.IdMecanico = m.IdMecanico
      ORDER BY s.FechaInicio DESC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};