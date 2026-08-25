import pool from "../conexionDB.js"

export const getallAutos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Auto")
    res.json( rows )
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los autos" })
  }
}
export const getAuto = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Auto WHERE IdAuto=?", [req.params.id])
    if (rows.length <= 0) return res.status(404).json({ message: "Auto no encontrado" })
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el auto" })
  }
}
export const createAuto = async (req, res) => {
  try {
    const { IdCliente, Patente, Modelo, Color, Anio } = req.body
    const [rows] = await pool.query("INSERT INTO Auto(IdCliente, Patente, Modelo, Color, Anio) VALUES(?,?,?,?,?)",
      [IdCliente, Patente, Modelo, Color, Anio])
    res.status(201).json({
      id: rows.insertId,
      IdCliente,
      Patente,
      Modelo,
      Color,
      Anio
    })
  } catch (error) {
    res.status(500).json({ message: "Error al crear el auto" })
  }
}
export const updateAuto = async (req, res) => {
try {  const { id } = req.params
  const { IdCliente, Patente, Modelo, Color, Anio } = req.body
  const [result] = await pool.query("UPDATE Auto SET IdCliente= IFNULL(?, IdCliente), Patente=IFNULL(?, Patente), Modelo=IFNULL(?, Modelo), Color=IFNULL(?, Color), Anio=IFNULL(?, Anio) WHERE IdAuto=?", [IdCliente, Patente, Modelo, Color, Anio, id])
  if (result.affectedRows <= 0) return res.status(404).json({ message: "Auto no encontrado" })
  res.json({ message: "Auto actualizado correctamente" })

} catch (error) {
  res.status(500).json({ message: "Error al actualizar el auto" })
}
}
export const deleteAuto = async (req, res) => {
try {  const [result] = await pool.query("DELETE FROM Auto WHERE Patente = ? ", [req.params.Patente])
  if (result.affectedRows <= 0) return res.status(404).json({ message: "Auto no encontrado" })
  res.sendStatus(204)
} catch (error) {
  res.status(500).json({ message: "Error al eliminar el auto" })
}
}