require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const tenantsRoutes = require('./routes/tenants');
const rentRoutes = require('./routes/rent');
const complaintsRoutes = require('./routes/complaints');
const errorHandler = require('./middleware/errorHandler');

const tenantAuthRoutes = require("./routes/tenantAuth");
const tenantRentRoutes = require('./routes/tenantRent');
const tenantComplaintRoutes = require("./routes/tenantComplaint");
const testEmailRoute = require("./routes/testEmail");

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/rent', rentRoutes);
app.use('/api/complaints', complaintsRoutes);

app.use("/api/tenant/auth", tenantAuthRoutes);
app.use("/api/tenant", tenantRentRoutes);
app.use("/api/tenant/complaints", tenantComplaintRoutes);

app.use("/api/test-email", testEmailRoute);

app.use(errorHandler);

app.listen(port, ()=> console.log(`Server running on ${port}`));
