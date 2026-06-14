require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require("helmet");
const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const tenantsRoutes = require('./routes/tenants');
const rentRoutes = require('./routes/rent');
const complaintsRoutes = require('./routes/complaints');
const adminAnalyticsRoutes = require("./routes/adminAnalytics");
const errorHandler = require('./middleware/errorHandler');

const tenantAuthRoutes = require("./routes/tenantAuth");
const tenantCommonRoute = require('./routes/tenantCommonRoute');
const tenantComplaintRoutes = require("./routes/tenantComplaint");
const testEmailRoute = require("./routes/testEmail");

const { loginLimiter, apiLimiter } = require('./middleware/rateLimiter');

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

// signup/login
app.use('/api/auth/admin/login', loginLimiter);
app.use('/api/auth/admin/signup', loginLimiter);
app.use('/api/tenant/auth/login', loginLimiter);

// admin section
app.use('/api/auth', authRoutes);
app.use('/api/rooms', apiLimiter, roomsRoutes);
app.use('/api/tenants', apiLimiter, tenantsRoutes);
app.use('/api/rent', apiLimiter, rentRoutes);
app.use('/api/complaints', apiLimiter, complaintsRoutes);
app.use("/api/analytics", apiLimiter, adminAnalyticsRoutes);

// tenant section
app.use("/api/tenant/auth", tenantAuthRoutes);
app.use("/api/tenant", apiLimiter, tenantCommonRoute);
app.use("/api/tenant/complaints", apiLimiter, tenantComplaintRoutes);

app.use("/api/test-email", testEmailRoute);

app.use(errorHandler);

app.listen(port, () => console.log(`Server running on ${port}`));