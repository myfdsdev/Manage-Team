import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCompanyByHost,
  updateSubdomain,
} from "../controllers/domain.Controller.js";

const router = express.Router();

// Public — frontend calls this on app load to discover the tenant from Host.
router.get("/info", getCompanyByHost);

// Admin only
router.put("/subdomain", protect, updateSubdomain);

export default router;
