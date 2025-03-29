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
