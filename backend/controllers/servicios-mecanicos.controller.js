import pool from "../conexionDB.js"


export const getAllServicioMecanicos = async (req, res, next) => {
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
    next(error)
  }
}


export const getMecanicosByServicio = async (req, res, next) => {
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
    next(error)
  }
}

export const getServiciosByMecanico = async (req, res, next) => {
  try {

    const { idMecanico } = req.params;

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
        a.Modelo
      FROM ServicioMecanico sm
      INNER JOIN Servicio s ON sm.IdServicio = s.IdServicio
      INNER JOIN Auto a ON s.IdAuto = a.IdAuto
      INNER JOIN Cliente c ON s.IdCliente = c.IdCliente
      WHERE sm.IdMecanico = ?
      ORDER BY s.FechaInicio DESC
    `, [idMecanico]);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const asignarMecanico = async (req, res, next) => {
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
    next(error)
  }
}


export const removeMecanicoFromServicio = async (req, res, next) => {
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
    next(error)
  }
}

export const actualizarAsignacion = async (req, res, next) => {
  try {
    const { idServicio, idMecanico } = req.params;
    const { FechaAsignacion } = req.body;

    const [result] = await pool.query(
      "UPDATE ServicioMecanico SET FechaAsignacion = ? WHERE IdServicio = ? AND IdMecanico = ?",
      [FechaAsignacion, idServicio, idMecanico]
    );
    res.json({
      status: "success",
      message: "Asignación actualizada correctamente",
      data: {
        IdServicio: Number(idServicio),
        IdMecanico: Number(idMecanico),
        FechaAsignacion
      }
    });
  } catch (error) {
    next(error);
  }
};