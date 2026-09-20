require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sequelize = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/projects.routes');
const contentRoutes = require('./routes/content.routes');
const imageRoutes = require('./routes/images.routes');
const aboutRoutes = require('./routes/about.routes'); // Add this

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/images', imageRoutes);
app.use('/api', contentRoutes);
app.use('/api/about', aboutRoutes); // Add this

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Import all models to ensure they're registered
    require('./models/About'); // Add this
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();