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