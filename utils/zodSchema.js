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