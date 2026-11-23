
import { Router } from "express";

import {
    buscarDadosDashboard,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", buscarDadosDashboard);

export default router;
