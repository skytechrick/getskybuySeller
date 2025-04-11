import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import securityMiddleware from './middlewares/securityMiddleware.js';
import dbConfig from './config/dbConfig.js';
import accessHandleMiddlerware from './middlewares/accessHandleMiddleware.js';
import api from './routes/api.js';
import errorHandleMiddleware from './middlewares/errorHandleMiddleware.js';

dotenv.config();

const app = express();

await dbConfig();
app.use(accessHandleMiddlerware);
securityMiddleware(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/profile-images", express.static(path.join(process.cwd(), "/public/converted-profile-images" )));

app.use('/api', ( req, res , next ) => {
    req.isApi = true;
    next();
} , api);

app.get('/', ( req , res , next ) => {
    try {
        return res.status(200).send({
            status: 'success',
            message: 'Server is running successfully',
        });
    } catch (error) {
        next(error);
    }
})

app.get("*", ( req , res , next ) => {
    return res.status(404).send({status: 'failed',message: 'Route not found'})
});
app.post("*", ( req , res , next ) => {
    return res.status(404).send({status: 'failed',message: 'Route not found'})
});
app.patch("*", ( req , res , next ) => {
    return res.status(404).send({status: 'failed',message: 'Route not found'})
});
app.put("*", ( req , res , next ) => {
    return res.status(404).send({status: 'failed',message: 'Route not found'})
});
app.delete("*", ( req , res , next ) => {
    return res.status(404).send({status: 'failed',message: 'Route not found'})
});
app.head("*", ( req , res , next ) => {
    return res.status(404).send({status: 'failed',message: 'Route not found'})
});



app.use(errorHandleMiddleware);
// For running in commonjs
export default app;

// For running in esm - Uncomment the following code
// app.listen(process.env.PORT, () => {
    // console.log(`Server is listening on port ${process.env.PORT}`);
// })