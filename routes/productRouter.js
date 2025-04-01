import { Router } from 'express';
const productRouter = Router();
export default productRouter;

import { createProduct , getAllProducts } from '../controllers/productController.js';

import { uploadProductImage } from '../middlewares/upload.js';
import { productImageProcessMiddleWare } from '../middlewares/imageProcessor.js';

productRouter.post("/create" , uploadProductImage , productImageProcessMiddleWare , createProduct );
productRouter.get("/all" , getAllProducts );