const appointmentRoutes = require('./routes/appointments');
const campaignRoutes = require('./routes/campaigns');

app.use('/api/appointments', appointmentRoutes);
app.use('/api/campaigns', campaignRoutes);
