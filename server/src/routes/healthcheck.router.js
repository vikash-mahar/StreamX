import { Router } from 'express';
import { healthCheck, healthcheck } from "../controllers/healthcheck.controller.js"

const router = Router()

router.route("/").get(healthCheck)

export default router