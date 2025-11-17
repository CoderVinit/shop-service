import express from "express";
import {
  createItem,
  EditItem,
  getItemsByShop,
  getItem,
  deleteItem,
  getAllItemsOfCity,
  getAllItems,
  updateItemRating
} from "../controllers/item.controller.js";
import { uploadSingle } from "../config/multer.js";
import { authMiddleware, authorizeRoles } from "../../../auth-service/middleware/authMiddleware.js";

const router = express.Router();

router.post("/addItem", authMiddleware, authorizeRoles("owner"), uploadSingle, createItem);
router.put("/editItem/:itemId", authMiddleware, authorizeRoles("owner"), uploadSingle, EditItem);
router.get("/getItems", authMiddleware, authorizeRoles("owner"), getItemsByShop);
router.get("/getItem/:itemId", authMiddleware, authorizeRoles("owner"), getItem);
router.delete("/deleteItem/:itemId", authMiddleware, authorizeRoles("owner"), deleteItem);
router.get("/getItems/:city",authMiddleware,authorizeRoles("user"),getAllItemsOfCity);
router.get("/getAllItems", authMiddleware, authorizeRoles("user"), getAllItems);

// Internal route for updating ratings
router.patch("/:itemId/rating", updateItemRating);

export default router;
