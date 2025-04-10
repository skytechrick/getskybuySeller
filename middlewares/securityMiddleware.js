import cors from "cors";
import helmet from "helmet";

const securityMiddleware = (app) => {
    app.use(cors({
        origin: [
            "http://192.168.0.12:5173",
            "https://getskybuy-react-seller.vercel.app",
        ],
        credentials: true,
        optionsSuccessStatus: 200,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        allowedHeaders: ["Content-Type", "Authorization", "X-Client-App"],
        exposedHeaders: ["Content-Length", "X-Knowledge-Base"],
    }));

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrcAttr: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:"],
            }
        },
        frameguard: {
            action: "deny"
        },
        hsts: process.env.NODE_ENV === "production" ? { 
                maxAge: 31536000, 
                includeSubDomains: true, 
                preload: true 
            } : false,
        xssFilter: true,
        noSniff: true,
        hidePoweredBy: true,
        referrerPolicy: {
            policy: "no-referrer"
        }
    }));
};

export default securityMiddleware;