import pool from "../conexionDB.js"

export const getEstadoPublicoVehiculo = async (req, res) => {
  try {
    const { rut, patente } = req.query

    if (!rut || !patente) {
      return res.status(400).json({ message: "RUT y Patente son obligatorios para la consulta" })
    }

    const [rows] = await pool.query(`
      SELECT
        s.IdServicio,
        s.FechaInicio,
        s.DescripcionProblema,
        s.Diagnostico,
        s.Estado,
        s.Precio,
        a.Modelo AS VehiculoModelo,
        a.Patente AS VehiculoPatente,
        c.Nombre AS NombreCliente,
        (
          SELECT GROUP_CONCAT(m.Nombre SEPARATOR ', ')
          FROM ServicioMecanico sm
          INNER JOIN Mecanico m ON sm.IdMecanico = m.IdMecanico
          WHERE sm.IdServicio = s.IdServicio
        ) AS MecanicosACargo
      FROM Servicio s
      INNER JOIN Auto a ON s.IdAuto = a.IdAuto
      INNER JOIN Cliente c ON s.IdCliente = c.IdCliente
      WHERE c.Rut = ? AND a.Patente = ?
        AND s.Estado NOT IN ('Finalizado', 'Cancelado')
      ORDER BY s.FechaInicio DESC
      LIMIT 1
    `, [rut, patente])

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No se encontró ningún servicio activo para el RUT y Patente ingresados"
      })
    }

    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ message: "Error al consultar el estado del vehículo" })
  }
}