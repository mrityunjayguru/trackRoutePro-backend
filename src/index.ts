import express, { Application } from 'express';
import http from 'http';
import config from 'config';
import cors from 'cors';
import db from './startup/db';
import errorHandler from './startup/error';
import models from './startup/models';
import routes from './startup/router';
import { scheduleTask, scheduleTask2 } from './helper/Scheduler';
import helmet from 'helmet'; // Security header middleware

const app: Application = express();

// CORS Configuration
// const allowedOrigins = [
//   'http://3.108.155.90:5173', 

//   'https://admin.trackroutepro.com'
// ];

// const corsOptions: any = {
//   origin: function (origin: string, callback: (err: Error | null, allow: boolean | undefined) => void) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } 
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://admin.trackroutepro.com');
//   next();
// });
// Enable CORS
app.use(cors())
// app.options('*', cors(corsOptions));

// Helmet for security headers

app.use(cors({
  origin: "https://admin.trackroutepro.com/"
}));
app.use(helmet());

// HTTP Server Setup
const server = http.createServer(app);

// Database, Models, Routes
db();
models();
routes(app);
errorHandler();
scheduleTask();
scheduleTask2();
// sendNotificationBefore7Days()
const port = process.env.PORT || config.get('port');

// Start the server
server.listen(port, () => {
  console.log(`Server is connected on port ${port}`);
});
