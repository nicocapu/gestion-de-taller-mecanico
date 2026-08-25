import {Router} from "express";
import { getAllClientes, getClienteByRut, createCliente, updateCliente, deleteCliente } from "../controllers/clientes.controller.js";
const router= Router();
router.post("/Cliente", createCliente)
router.get("/Cliente", getAllClientes)
router.get("/cliente/:Rut", getClienteByRut)
router.patch("/cliente/:id", updateCliente)
router.delete("/cliente/:Rut", deleteCliente)
export default router;
