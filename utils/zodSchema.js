import z from 'zod';

export const newSignupSchema = z.object({
    pinCode: z.string({ required_error: "Pin code is required" }).regex(/^\d{6}$/, 'Pin code must be 6 digits long'),
    name: z.string({ required_error: "Name is required" }).min(2, 'Name must be at least 2 characters long'),
    email: z.string({ required_error: "Email is required"}).email().transform((val) => val.toLowerCase()),
    mobileNumber: z.string({ required_error: 'Mobile number is required' }).regex(/^\d{10}$/, 'Mobile number must be 10 digits long'),
    password: z.string({ required_error: "Password is required" }).min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
    email: z.string({ required_error: "Email is required" })
    .nonempty("Email cann't be empty")
    .email("Please enter a correct Email")
    .transform(v => v.toLowerCase()),
    password: z.string({ required_error: "Password is required" })
    .nonempty("password is required")
    .min(8, "Password must be at least 8 characters")
});

export const profileCompletionSchema = z.object({
    name: z.string({ required_error: "Name is required" }).min(2, 'Name must be at least 2 characters long').optional(),
    mobileNumber: z.string({ required_error: 'Mobile number is required' }).regex(/^\d{10}$/, 'Mobile number must be 10 digits long').optional(),
    altMobileNumber: z.string()
        .min(10, "Enter correct alt. mobile number")
        .max(10, "Enter correct alt. mobile number")
        .optional(),
    dob: z.string({ required_error: "Date of Birth is required" })
        .max(100, "Date of Birth must be in the format YYYY-MM-DD"),
    gender: z.string({ required_error: "Gender is required" })
        .min(4, "Enter corrent gender")
        .max(6, "Enter correct gender"),
    address: z.string({ required_error: "Address is required" })
});

export const addressSchema = z.object({
    address_line: z.string({ required_error: "Address line is required" })
        .min(3, "Address line must be at least 3 characters" )
        .max(255 , "Address line must be at most 255 characters" ),
    pinCode: z.string({ required_error: "PIN code is required" })
        .max(6, "PIN code must be 6 characters" )
        .min(6, "PIN code must be 6 characters" ),
    district: z.string({ required_error: "District is required" })
        .min(3, "District must be at least 3 characters" )
        .max(255 , "District must be at most 255 characters" ),
    city: z.string({ required_error: "City is required" })
        .min(3, "City must be at least 3 characters" )
        .max(255 , "City must be at most 255 characters" ),
    state: z.string({ required_error: "State is required" })
        .min(3, "State must be at least 3 characters" )
        .max(255 , "State must be at most 255 characters" ),
    country: z.string({ required_error: "Country is required" })
        .min(3, "Country must be at least 3 characters" )
        .max(255 , "Country must be at most 255 characters" ),
})

export const businessInformationSchema = z.object({
    businessMobileNumber: z.string()
        .min(10, "Enter correct business mobile number")
        .max(10, "Enter correct business mobile number")
        .optional(),
    name: z.string({ required_error: "Business name is required" })
        .min(3, "Business name must be at least 3 characters" )
        .max(255 , "Business name must be at most 255 characters" ),
    type: z.string({ required_error: "Business type is required" })
        .min(3, "Business type must be at least 3 characters" )
        .max(255 , "Business type must be at most 255 characters" ),
    description: z.string({ required_error: "Description is required" })
        .min(3, "Description must be at least 3 characters" )
        .max(500 , "Description must be at most 500 characters" ),
    gstin: z.string()
        .min(15, "GSTIN must be 15 characters" )
        .max(15, "GSTIN must be 15 characters" )
        .optional(),
    aadhaarCard: z.string()
        .min(12, "Aadhaar card number must be 12 characters" )
        .max(12, "Aadhaar card number must be 12 characters" )
        .optional(),
    panCard: z.string()
        .min(10, "PAN card number must be 10 characters" )
        .max(10, "PAN card number must be 10 characters" )
        .optional(),
    address: z.string({ required_error: "Address is required" }),
    categories: z.string({ required_error: "Categories are required" })
        .min(3, "Address must be at least 3 characters" )
        .max(255 , "Address must be at most 255 characters" ),
});


export const bankAccountDetailsSchema = z.object({
    accountHolderName: z.string({ required_error: "Account holder name is required" })
        .min(3, "Account holder name must be at least 3 characters" )
        .max(255 , "Account holder name must be at most 255 characters" ),
    bankName: z.string({ required_error: "Bank name is required" })
        .min(3, "Bank name must be at least 3 characters" )
        .max(255 , "Bank name must be at most 255 characters" ),
    accountNumber: z.string({ required_error: "Account number is required" })
        .min(3, "Account number must be at least 3 characters" )
        .max(255 , "Account number must be at most 255 characters" ),
    ifscCode: z.string({ required_error: "IFSC code is required" })
        .min(3, "IFSC code must be at least 3 characters" )
        .max(255 , "IFSC code must be at most 255 characters" ),
    upi: z.string()
        .min(3, "UPI ID or Number must be at least 3 characters" )
        .max(255 , "UPI ID or Number must be at most 255 characters" )
        .optional(),
});

export const pickupAddressDetailsSchema = z.object({
    contactPerson: z.object({
        name: z.string({ required_error: "Contact person name is required" })
            .min(3, "Contact person name must be at least 3 characters" )
            .max(255 , "Contact person name must be at most 255 characters" ),
        mobileNumber: z.string({ required_error: "Contact person mobile number is required" })
            .min(10, "Contact person mobile number must be 10 digits" )
            .max(10, "Contact person mobile number must be 10 digits" ),
    }),
    isPickupSameAsBusiness: z.boolean()
        .default(false)
        .optional(),
    address: z.object({
        address_line: z.string({ required_error: "Address line is required" })
            .min(3, "Address line must be at least 3 characters" )
            .max(255 , "Address line must be at most 255 characters" ),
        pinCode: z.string({ required_error: "PIN code is required" })
            .min(6, "PIN code must be 6 digits" )
            .max(6, "PIN code must be 6 digits" ),
        district: z.string({ required_error: "District is required" })
            .min(3, "District must be at least 3 characters" )
            .max(255 , "District must be at most 255 characters" ),
        city: z.string({ required_error: "City is required" })
            .min(3, "City must be at least 3 characters" )
            .max(255 , "City must be at most 255 characters" ),
        state: z.string({ required_error: "State is required" })
            .min(3, "State must be at least 3 characters" )
            .max(255 , "State must be at most 255 characters" ),
        country: z.string({ required_error: "Country is required" })
            .min(3, "Country must be at least 3 characters" )
            .max(255 , "Country must be at most 255 characters" ),
    }).optional(),
});

export const createProductSchema = z.object({
    title: z.string().min(3).max(255),
    description: z.string().min(3).max(5000),
    keywords: z.string().min(3).max(255),
    gender: z.string().min(3).max(255),
    ageGroup: z.string().min(3).max(255),
    category: z.string().min(3).max(255),
    subCategory: z.string().min(3).max(255),
    variants: z.string(),
    specificationTable: z.string(),
    videos: z.string().optional(),
})


export const updateProductSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    specificationTable: z.array().optional(),
    keywords: z.string().optional(),
    gender: z.string().optional(),
    keywords: z.string().optional(),
    videos: z.array().optional(),
})