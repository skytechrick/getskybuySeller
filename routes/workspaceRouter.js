import { Router } from 'express';
const workspaceRouter = Router();
export default workspaceRouter;

import { uploadUpdateProductImageForSupportAssistant , deleteProductImageForSupportAssistant } from '../controllers/workspaceController.js';
import { uploadUpdateProductImage } from '../middlewares/upload.js';
import { productImageProcessMiddleWare } from '../middlewares/imageProcessor.js';
import isSupportAssistant from '../middlewares/isSupportAssistant.js';


workspaceRouter.put("/support-assistant/product/add/:id" ,
    isSupportAssistant , uploadUpdateProductImage ,
    productImageProcessMiddleWare , uploadUpdateProductImageForSupportAssistant );
workspaceRouter.delete("/support-assistant/product/delete/:id" , isSupportAssistant , deleteProductImageForSupportAssistant );