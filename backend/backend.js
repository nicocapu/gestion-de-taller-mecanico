// -----------------------------
// backend/backend.js
// -----------------------------

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Conexión a la BD
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "El-rocky-mueve-sus-9-colitas",
  database: "TallerMecanico",
  port: 3307,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err);
    return;
  }
  console.log("✅ Conexión a la base de datos establecida.");
});

// ====================================================================
// CLIENTES
// ====================================================================

app.post("/clientes", (req, res) => {
  const { rut, nombre, numeroTelefonico, correoElectronico } = req.body;

  if (!rut || !nombre) {
    return res.status(400).json({ error: "RUT y nombre son obligatorios." });
  }

  const sql = `
    INSERT INTO Cliente (Rut, Nombre, NumeroTelefonico, CorreoElectronico)
    VALUES (?, ?, ?, ?)
  `.trim();

  db.query(
    sql,
    [rut, nombre, numeroTelefonico || null, correoElectronico || null],
    (err, result) => {
      if (err) {
        console.error("❌ Error al registrar cliente:", err);
        return res.status(500).json({ error: "Error al registrar cliente." });
      }

      console.log("✅ Cliente registrado con ID:", result.insertId);
      res
        .status(201)
        .json({ message: "Cliente registrado correctamente", id: result.insertId });
    }
  );
});

// ====================================================================
// AUTOS
// ====================================================================

app.post("/Auto", (req, res) => {
  const { clienteId, patente, modelo, color, anio } = req.body;

  if (!patente || !modelo || !clienteId) {
    return res
      .status(400)
      .json({ error: "Patente, modelo e ID de cliente obligatorios." });
  }

  const sql = `
    INSERT INTO Auto(IdCliente, Patente, Modelo, Color, Anio)
    VALUES (?, ?, ?, ?, ?)
  `.trim();

  db.query(
    sql,
    [clienteId, patente, modelo, color || null, anio || null],
    (err, result) => {
      if (err) {
        console.error("❌ Error al registrar Vehiculo:", err);
        return res.status(500).json({ error: "Error al registrar Vehiculo." });
      }

      console.log("✅ Vehiculo registrado con ID:", result.insertId);
      res
        .status(201)
        .json({ message: "Vehiculo registrado correctamente", id: result.insertId });
    }
  );
});

app.get("/Auto", (req, res) => {
  const sql = "SELECT IdAuto, Patente, Modelo, IdCliente FROM Auto";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener los vehículos:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener la lista de vehículos." });
    }

    res.status(200).json(results);
  });
});

// ====================================================================
// SERVICIOS (creación, listado, actualización, borrado)
// ====================================================================

app.post("/servicios", (req, res) => {
  const {
    idCliente,
    idAuto,
    descripcionProblema,
    diagnostico,
    precio,
    estado,
    idMecanico,
  } = req.body;

  if (!idCliente || !idAuto || !descripcionProblema || !estado) {
    return res.status(400).json({
      error: "idCliente, idAuto, descripcionProblema y estado son obligatorios.",
    });
  }

  if (!idMecanico) {
    return res
      .status(400)
      .json({ error: "El IdMecanico es obligatorio para iniciar el servicio." });
  }

  const sqlServicio = `
    INSERT INTO Servicio 
      (IdCliente, IdAuto, FechaInicio, DescripcionProblema, Diagnostico, Estado, Precio)
    VALUES 
      (?, ?, CURDATE(), ?, ?, ?, ?)
  `.trim();

  db.query(
    sqlServicio,
    [idCliente, idAuto, descripcionProblema, diagnostico || null, estado, precio || null],
    (err, result) => {
      if (err) {
        console.error("❌ Error al crear servicio:", err);
        return res.status(500).json({ error: "Error al crear servicio." });
      }

      const newServicioId = result.insertId;

      const sqlAsignacion = `
        INSERT INTO ServicioMecanico (IdServicio, IdMecanico)
        VALUES (?, ?)
      `.trim();

      db.query(
        sqlAsignacion,
        [newServicioId, idMecanico],
        (errAsignacion) => {
          if (errAsignacion) {
            console.error("❌ Error al asignar mecánico:", errAsignacion);
            return res.status(500).json({
              error: "Servicio creado, pero falló la asignación del mecánico.",
            });
          }

          console.log(
            `✅ Servicio ID ${newServicioId} creado y Mecánico ${idMecanico} asignado.`
          );
          res.status(201).json({
            message: "Servicio y Mecánico asignados correctamente",
            id: newServicioId,
            idMecanicoAsignado: idMecanico,
          });
        }
      );
    }
  );
});

app.get("/servicios/pendientes", (req, res) => {
  const sql = `
    SELECT 
      S.IdServicio, 
      S.DescripcionProblema, 
      S.Estado, 
      S.Precio,
      DATE_FORMAT(S.FechaInicio, '%Y-%m-%d') AS FechaInicio,
      A.Patente, 
      A.Modelo,
      C.Nombre AS NombreCliente,
      C.Rut AS RutCliente
    FROM Servicio AS S
    JOIN Auto AS A ON S.IdAuto = A.IdAuto
    JOIN Cliente AS C ON S.IdCliente = C.IdCliente
    WHERE S.Estado IN ('Pendiente','En Diagnostico', 'En reparación', 'Finalizado', 'Cancelado')
    ORDER BY S.FechaInicio ASC
  `.trim();

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener el listado de servicios:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener la lista de servicios." });
    }

    res.status(200).json(results);
  });
});

app.delete("/servicios/:id", (req, res) => {
  const servicioId = req.params.id;

  if (!servicioId) {
    return res.status(400).json({ error: "El ID del servicio es obligatorio." });
  }

  const sql = `DELETE FROM Servicio WHERE IdServicio = ?`;

  db.query(sql, [servicioId], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar servicio:", err);
      return res.status(500).json({ error: "Error al eliminar el servicio." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: `Servicio con ID ${servicioId} no encontrado.` });
    }

    console.log(`✅ Servicio ID ${servicioId} eliminado correctamente.`);
    res.status(204).send();
  });
});



// ====================================================================
// SERVICIOS (actualización - LIMPIEZA TRANSACCIONAL USANDO CALLBACKS)
// ====================================================================

app.patch("/servicios/:id", (req, res) => {
    const servicioId = req.params.id;
    const datosAActualizar = req.body;
    
    // Preparación de la consulta UPDATE
    const campos = Object.keys(datosAActualizar)
        .map((key) => `${key} = ?`)
        .join(", ");
    const valores = Object.values(datosAActualizar);

    if (valores.length === 0) {
        return res
            .status(400)
            .json({ error: "No se enviaron campos para actualizar." });
    }

    const sqlActualizar = `UPDATE Servicio SET ${campos} WHERE IdServicio = ?`;
    const valoresActualizar = [...valores, servicioId];
    const estadoNuevo = datosAActualizar.Estado;

    // --- 1. Ejecutar la actualización inicial del servicio ---
    db.query(sqlActualizar, valoresActualizar, (errActualizar, resultActualizacion) => {
        if (errActualizar) {
            console.error("❌ Error al actualizar servicio:", errActualizar);
            return res.status(500).json({ error: "Error interno al actualizar el servicio." });
        }

        if (resultActualizacion.affectedRows === 0) {
            return res.status(404).json({ error: "Servicio no encontrado." });
        }

        // --- 2. Lógica de limpieza post-Finalizado (TRANSACCIÓN con Callbacks) ---
        const estadosParaLimpiar = ['finalizado', 'cancelado'];
        if (estadoNuevo && estadosParaLimpiar.includes(estadoNuevo.toLowerCase())) {
            
            console.log(`⚠️ Detectado estado 'Finalizado' para Servicio ID ${servicioId}. Iniciando limpieza con Callbacks...`);
            
            // 2.A: INICIAR TRANSACCIÓN
            db.query('START TRANSACTION', (errBegin) => {
                if (errBegin) {
                    console.error("❌ Error al iniciar transacción:", errBegin);
                    // No hay ROLLBACK que hacer si no pudimos iniciarla
                    return res.status(500).json({ error: "Error de transacción (Inicio)." });
                }

                // 2.B: Obtener IdCliente y IdAuto del servicio
                const sqlGetIDs = `SELECT IdCliente, IdAuto FROM Servicio WHERE IdServicio = ?`;
                db.query(sqlGetIDs, [servicioId], (errGetIDs, rows) => {
                    if (errGetIDs || rows.length === 0) {
                        // Fallo al obtener IDs, se hace ROLLBACK
                        db.query('ROLLBACK', () => {
                            console.error("❌ Fallo al obtener IDs para limpieza. ROLLBACK.", errGetIDs);
                            return res.status(500).json({ error: "Servicio actualizado, pero falló la limpieza (Obtención de datos)." });
                        });
                        return;
                    }

                    const { IdCliente, IdAuto } = rows[0];

                    // 2.C: Eliminar Auto
                    const sqlDeleteAuto = `DELETE FROM Auto WHERE IdAuto = ?`;
                    db.query(sqlDeleteAuto, [IdAuto], (errDeleteAuto) => {
                        if (errDeleteAuto) {
                            // Fallo al eliminar Auto, se hace ROLLBACK
                            db.query('ROLLBACK', () => {
                                console.error("❌ Fallo al eliminar Auto. ROLLBACK:", errDeleteAuto);
                                return res.status(500).json({ error: "Servicio actualizado, pero falló la limpieza de Auto." });
                            });
                            return;
                        }

                        // 2.D: Eliminar Cliente
                        const sqlDeleteCliente = `DELETE FROM Cliente WHERE IdCliente = ?`;
                        db.query(sqlDeleteCliente, [IdCliente], (errDeleteCliente) => {
                            if (errDeleteCliente) {
                                // Fallo al eliminar Cliente, se hace ROLLBACK
                                db.query('ROLLBACK', () => {
                                    console.error("❌ Fallo al eliminar Cliente. ROLLBACK:", errDeleteCliente);
                                    return res.status(500).json({ error: "Servicio actualizado, pero falló la limpieza de Cliente." });
                                });
                                return;
                            }

                            // 2.E: COMMIT (todo exitoso)
                            db.query('COMMIT', (errCommit) => {
                                if (errCommit) {
                                    console.error("❌ Error al confirmar la transacción (COMMIT):", errCommit);
                                    return res.status(500).json({ error: "Error al confirmar la limpieza (COMMIT)." });
                                }
                                console.log(`✅ Transacción de limpieza completada para Servicio ID ${servicioId}: Auto ${IdAuto} y Cliente ${IdCliente} eliminados.`);
                                // Continuar a la respuesta final
                                res.status(200).json({ message: `Servicio #${servicioId} actualizado y limpieza completada.` });
                            });
                        });
                    });
                });
            });
        } else {
            // Si el estado NO es 'Finalizado', simplemente terminamos la actualización
            res.status(200).json({ message: `Servicio #${servicioId} actualizado correctamente.` });
        }
    });
});


// ====================================================================
// MECÁNICOS (registro, login, listado)
// ====================================================================

app.post("/mecanicos", (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({
      error: "Faltan campos obligatorios: nombre, correo y contraseña.",
    });
  }

  const sql = `
    INSERT INTO Mecanico (Nombre, Correo, Contrasenia)
    VALUES (?, ?, ?)
  `.trim();

  db.query(sql, [nombre, correo, password], (err, result) => {
    if (err) {
      console.error("❌ Error al registrar el mecánico:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ error: "El correo electrónico ya está registrado." });
      }
      return res
        .status(500)
        .json({ error: "Error interno al registrar el mecánico." });
    }

    const newId = result.insertId;
    res.status(201).json({
      mensaje: "Mecánico registrado exitosamente.",
      id: newId,
      nombre: nombre,
    });
  });
});

// 🧩 LISTADO DE MECÁNICOS (para tabla y selects)
app.get("/mecanicos", (req, res) => {
  const sql = `
    SELECT IdMecanico, Nombre, Correo
    FROM Mecanico
    ORDER BY Nombre ASC
  `.trim();

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener mecánicos:", err);
      return res
        .status(500)
        .json({ error: "Error del servidor al listar mecánicos." });
    }
    res.status(200).json(results);
  });
});

// 🔐 LOGIN DE MECÁNICO
app.post("/mecanicos/login", (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res
      .status(400)
      .json({ error: "Debe enviar correo y contraseña." });
  }

  const sql = `
    SELECT IdMecanico, Nombre, Correo
    FROM Mecanico
    WHERE Correo = ? AND Contrasenia = ?
    LIMIT 1
  `.trim();

  db.query(sql, [correo, password], (err, results) => {
    if (err) {
      console.error("❌ Error en login de mecánico:", err);
      return res.status(500).json({ error: "Error interno en login." });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const mec = results[0];
    // Esto es lo que guardará el frontend en localStorage
    res.json({
      id: mec.IdMecanico,
      nombre: mec.Nombre,
      correo: mec.Correo,
    });
  });
});

// ====================================================================
// ASIGNACIÓN DE MECÁNICOS A SERVICIOS
// ====================================================================

app.post("/servicios-mecanicos", (req, res) => {
  const { idServicio, idMecanico } = req.body;

  if (!idServicio || !idMecanico) {
    return res.status(400).json({
      error: "IdServicio y IdMecanico son obligatorios para la asignación.",
    });
  }

  const sql = `
    INSERT INTO ServicioMecanico (IdServicio, IdMecanico)
    VALUES (?, ?)
  `.trim();

  db.query(sql, [idServicio, idMecanico], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ error: "Este mecánico ya está asignado a este servicio." });
      }
      console.error("❌ Error al asignar mecánico al servicio:", err);
      return res
        .status(500)
        .json({ error: "Error al asignar el mecánico." });
    }

    console.log(
      `✅ Mecánico ID ${idMecanico} asignado al Servicio ID ${idServicio}.`
    );
    res.status(201).json({
      message: "Mecánico asignado correctamente al servicio.",
      idServicio,
      idMecanico,
    });
  });
});

app.get("/servicios/:id/mecanicos", (req, res) => {
  const servicioId = req.params.id;

  const sql = `
    SELECT 
      M.IdMecanico, 
      M.Nombre, 
      M.Especialidad,
      SM.FechaAsignacion
    FROM ServicioMecanico AS SM
    JOIN Mecanico AS M ON SM.IdMecanico = M.IdMecanico
    WHERE SM.IdServicio = ?
    ORDER BY M.Nombre ASC
  `.trim();

  db.query(sql, [servicioId], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener mecánicos asignados:", err);
      return res.status(500).json({
        error: "Error al obtener la lista de mecánicos para el servicio.",
      });
    }
    res.status(200).json(results);
  });
});

app.delete("/servicios-mecanicos/:idServicio/:idMecanico", (req, res) => {
  const { idServicio, idMecanico } = req.params;

  const sql = `
    DELETE FROM ServicioMecanico 
    WHERE IdServicio = ? AND IdMecanico = ?
  `.trim();

  db.query(sql, [idServicio, idMecanico], (err, result) => {
    if (err) {
      console.error("❌ Error al desasignar mecánico:", err);
      return res
        .status(500)
        .json({ error: "Error al desasignar el mecánico del servicio." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Asignación no encontrada." });
    }

    console.log(
      `✅ Mecánico ID ${idMecanico} desasignado del Servicio ID ${idServicio}.`
    );
    res.status(204).send();
  });
});

// ====================================================================
// CONSULTA PÚBLICA DE ESTADO DEL VEHÍCULO (RUT + PATENTE)
// ====================================================================

app.get("/estado-vehiculo", (req, res) => {
  const { rut, patente } = req.query;

  if (!rut || !patente) {
    return res
      .status(400)
      .json({ error: "RUT y Patente son obligatorios para la consulta." });
  }

  const sql = `
    SELECT
      S.IdServicio,
      S.FechaInicio,
      DATE_FORMAT(S.FechaTermino, '%Y-%m-%d') AS FechaTerminoEstimada,
      S.DescripcionProblema,
      S.Diagnostico,
      S.Estado,
      S.Precio,
      A.Modelo AS VehiculoModelo,
      A.Patente AS VehiculoPatente,
      C.Nombre AS NombreCliente,
      (
        SELECT 
          GROUP_CONCAT(Mec.Nombre SEPARATOR ', ')
        FROM ServicioMecanico AS SM
        JOIN Mecanico AS Mec ON SM.IdMecanico = Mec.IdMecanico
        WHERE SM.IdServicio = S.IdServicio
      ) AS MecanicosACargo
    FROM Servicio AS S
    JOIN Auto AS A ON S.IdAuto = A.IdAuto
    JOIN Cliente AS C ON S.IdCliente = C.IdCliente
    WHERE C.Rut = ? AND A.Patente = ?
      AND S.Estado IN ('Pendiente', 'En reparación')
    ORDER BY S.FechaInicio DESC
  `.trim();

  db.query(sql, [rut, patente], (err, results) => {
    if (err) {
      console.error("❌ Error al consultar el estado del vehículo:", err);
      return res.status(500).json({
        error: "Error interno del servidor al realizar la consulta.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message:
          "No se encontró ningún servicio activo para el RUT y Patente proporcionados.",
        details:
          "Asegúrese de que el vehículo esté registrado y tenga un servicio en curso.",
      });
    }

    res.status(200).json(results[0]);
  });
});

// ====================================================================
// INICIO DEL SERVIDOR
// ====================================================================

app.listen(port, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${port}`);
});