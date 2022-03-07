import fs from 'fs';
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {
    fileURLToPath
} from 'url';

// import {
//     ErrorRunner,
//     errorHandler
// } from './utils/errors';

// Global Middleware
const app = express();
app.enable('trust proxy');

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.options('*', cors());
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
                baseUri: ["'self'"],
                fontSrc: ["'self'", 'https:', 'data:'],
                scriptSrc: [
                    "'self'",
                    'https:',
                    'http:',
                    'blob:',
                    'https://*.mapbox.com',
                    'https://js.stripe.com',
                    'https://m.stripe.network',
                    'https://*.cloudflare.com',
                ],
                frameSrc: ["'self'", 'https://js.stripe.com'],
                objectSrc: ["'none'"],
                styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
                workerSrc: [
                    "'self'",
                    'data:',
                    'blob:',
                    'https://*.tiles.mapbox.com',
                    'https://api.mapbox.com',
                    'https://events.mapbox.com',
                    'https://m.stripe.network',
                ],
                childSrc: ["'self'", 'blob:'],
                imgSrc: ["'self'", 'data:', 'blob:'],
                formAction: ["'self'"],
                connectSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'data:',
                    'blob:',
                    'https://*.stripe.com',
                    'https://*.mapbox.com',
                    'https://*.cloudflare.com/',
                    'https://bundle.js:*',
                    'ws://127.0.0.1:*/',
                ],
                upgradeInsecureRequests: [],
            },
        },
    })
);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP address, please try again in an hour.',
}); // 100 requests / hour limit
app.use('/api', limiter);

app.use(express.json({
    limit: '10kb'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
    hpp({
        whitelist: [
            'duration',
            'numRatings',
            'avgRating',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);
app.use(compression());

// app.use((req, res, next) => {
//   console.log('Received a cookie:', req.cookies);
//   next();
// });

// set up routes:
app.post('/', (req, res) => {
    const {
        message
    } = req.body;
    res.json({
        success: true,
        message: `you have posted the following message to the api: ${message}`,
    });
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Confer. The civilized way to tell someone they're on mute."
    })
})

// app.all('*', (req, res, next) => {
//     next(new ErrorRunner(`Can't find ${req.originalUrl} on this server.`, 404));
// });
// app.use(errorHandler);

export default app;