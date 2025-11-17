import express from "express";
import {
  createAndEditShop,
  getShopByOwner,
  getShopByCity,
  getShopById
} from "../controllers/shop.controller.js";
import { verifyToken, checkRole } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../config/multer.js";

const router = express.Router();

router.post("/create-edit", verifyToken, checkRole("owner"), uploadSingle, createAndEditShop);
router.get("/get-shop", verifyToken, checkRole("owner"), getShopByOwner);
router.get("/get-shop-by-city/:city", verifyToken, checkRole("user"), getShopByCity);

export default router;
