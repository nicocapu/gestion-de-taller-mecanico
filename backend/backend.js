import CarRoutes from "./routes/autos.routes.js";
import ClientRoutes from "./routes/clientes.routes.js";
import MecanicoRoutes from "./routes/mecanicos.routes.js";
import ServicioRoutes from "./routes/servicios.routes.js";
import ServicioMecanicoRoutes from "./routes/servicios-mecanicos.routes.js";
import ConsultaVehiculoRoutes from "./routes/consulta-vehiculo.routes.js";
import EstadoVehiculoRoutes from "./routes/estado-vehiculo.routes.js";
// -----------------------------
// backend/backend.js
// -----------------------------
import "dotenv/config";
import express from "express";

import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
import conexiondb from "./conexionDB.js";
app.use(express.json());
app.use(cors());
app.use(CarRoutes);
app.use(ClientRoutes);
app.use(MecanicoRoutes);
app.use(ServicioRoutes);
app.use(ServicioMecanicoRoutes);
app.use(ConsultaVehiculoRoutes);
app.use(EstadoVehiculoRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${port}`);
});