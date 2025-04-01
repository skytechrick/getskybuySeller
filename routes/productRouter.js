import { Router } from 'express';
const productRouter = Router();
export default productRouter;

import { createProduct , updateProduct , updateProductDeleteImage , updateProductImage , getAllProducts , productSubmit } from '../controllers/productController.js';

import { uploadProductImage , uploadUpdateProductImage } from '../middlewares/upload.js';
import { productImageProcessMiddleWare } from '../middlewares/imageProcessor.js';

productRouter.post("/create" , uploadProductImage , productImageProcessMiddleWare , createProduct );
productRouter.put("/update/:id" , updateProduct );
productRouter.delete("/update-image/:id" , updateProductDeleteImage );
productRouter.put("/update-image/:id" , uploadUpdateProductImage , productImageProcessMiddleWare , updateProductImage );
productRouter.get("/all" , getAllProducts );
productRouter.post("/submit/:id" , productSubmit );