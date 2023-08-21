const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mongodbRoutes = require('./mongodb');
const rabbitmqRoutes = require('./rabbitmq');
const deploymentRoutes = require('./deployment');
const operatorInstallRoutes = require('./operetor');
const redisRoutes = require('./redis');

app.use(bodyParser.json());
app.use('/', mongodbRoutes);
app.use('/', rabbitmqRoutes);
app.use('/', deploymentRoutes);
app.use('/', operatorInstallRoutes);
app.use('/', redisRoutes);

// Start the server
app.listen(3000, () => console.log('Server started on port 3000.'));
