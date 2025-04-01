import multer from 'multer';
import path from 'path';
import fs from 'fs';

const profileImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const pathFolder = path.join(process.cwd(), './public/profile-images');
        if (!fs.existsSync(pathFolder)) {
            fs.mkdirSync(pathFolder, { recursive: true });
        }
        cb(null, pathFolder);
    },
    filename: (req, file, cb) => {
        const f = `${Date.now()}-${file.originalname}`;
        cb(null, f);
    }
});

const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

    if(allowedTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type. Only images are allowed.'));
    };
};

const uploadProfileImages = multer({
    storage: profileImageStorage,
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
    fileFilter: imageFileFilter,
});

export const uploadProfileImage = uploadProfileImages.fields([
    { name: 'profileImage', maxCount: 1 },
]);

const businessImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const pathFolder = path.join(process.cwd(), './public/business-images');
        if (!fs.existsSync(pathFolder)) {
            fs.mkdirSync(pathFolder, { recursive: true });
        }
        cb(null, pathFolder);
    },
    filename: (req, file, cb) => {
        const f = `${Date.now()}-${file.originalname}`;
        cb(null, f);
    }
});

const businessImageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

    if(allowedTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type. Only images are allowed.'));
    };
};

const uploadBusinessImages = multer({
    storage: businessImageStorage,
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
    fileFilter: businessImageFileFilter,
});

export const uploadBusinessImage = uploadBusinessImages.fields([
    { name: 'panFile', maxCount: 1 },
    { name: 'aadhaarFile', maxCount: 1 },
    { name: 'shopPhoto', maxCount: 1 },
    { name: 'businessLogo', maxCount: 1 }, // optional
]);

const productImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const pathFolder = path.join(process.cwd(), './public/product-images');
        if (!fs.existsSync(pathFolder)) {
            fs.mkdirSync(pathFolder, { recursive: true });
        }
        cb(null, pathFolder);
    },
    filename: (req, file, cb) => {
        const f = `${Date.now()}-${file.originalname}`;
        cb(null, f);
    }
});

const productImageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

    if(allowedTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type. Only images are allowed.'));
    };
};

const uploadProductImages = multer({
    storage: productImageStorage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: productImageFileFilter,
});

export const uploadProductImage = uploadProductImages.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'image5', maxCount: 1 },
    { name: 'image6', maxCount: 1 },
    { name: 'image7', maxCount: 1 },
]);

export const uploadUpdateProductImage = uploadProductImages.fields([
    { name: 'image1', maxCount: 1 },
]);