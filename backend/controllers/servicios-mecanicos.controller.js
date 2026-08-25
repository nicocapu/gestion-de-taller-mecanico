import pool from "../conexionDB.js"

// 1. Obtener todas las asignaciones (con nombres útiles vía JOIN)
export const getAllServicioMecanicos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sm.IdServicio, sm.IdMecanico, sm.FechaAsignacion,
             m.Nombre AS NombreMecanico, m.Especialidad,
             s.Estado AS EstadoServicio, a.Patente
      FROM ServicioMecanico sm
      INNER JOIN Mecanico m ON sm.IdMecanico = m.IdMecanico
      INNER JOIN Servicio s ON sm.IdServicio = s.IdServicio
      INNER JOIN Auto a ON s.IdAuto = a.IdAuto
    `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las asignaciones" })
  }
}

// 2. Obtener mecánicos asignados a un servicio específico
export const getMecanicosByServicio = async (req, res) => {
  try {
    const { idServicio } = req.params
    const [rows] = await pool.query(`
      SELECT sm.IdServicio, sm.FechaAsignacion,
             m.IdMecanico, m.Nombre, m.Especialidad, m.Correo
      FROM ServicioMecanico sm
      INNER JOIN Mecanico m ON sm.IdMecanico = m.IdMecanico
      WHERE sm.IdServicio = ?
    `, [idServicio])

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los mecánicos del servicio" })
  }
}

// 3. Asignar un mecánico a un servicio
export const assignMecanico = async (req, res) => {
  try {
    const { IdServicio, IdMecanico } = req.body
    await pool.query(
      "INSERT INTO ServicioMecanico (IdServicio, IdMecanico) VALUES (?, ?)",
      [IdServicio, IdMecanico]
    )

    res.status(201).json({
      message: "Mecánico asignado correctamente al servicio",
      IdServicio,
      IdMecanico
    })
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "El mecánico ya está asignado a este servicio" })
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({ message: "El Servicio o el Mecánico especificado no existe" })
    }
    res.status(500).json({ message: "Error al asignar mecánico al servicio" })
  }
}

// 4. Desasignar un mecánico de un servicio
export const removeMecanicoFromServicio = async (req, res) => {
  try {
    const { idServicio, idMecanico } = req.params
    const [result] = await pool.query(
      "DELETE FROM ServicioMecanico WHERE IdServicio = ? AND IdMecanico = ?",
      [idServicio, idMecanico]
    )

    if (result.affectedRows <= 0) {
      return res.status(404).json({ message: "No se encontró esa asignación para eliminar" })
    }

    res.sendStatus(204)
  } catch (error) {
    res.status(500).json({ message: "Error al desasignar el mecánico" })
  }
}