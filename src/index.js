const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mongodbRoutes = require('./mongodb');
const rabbitmqRoutes = require('./rabbitmq');
const deploymentRoutes = require('./deployment');
const operatorInstallRoutes = require('./operetor')

app.use(bodyParser.json());
app.use('/', mongodbRoutes);
app.use('/', rabbitmqRoutes);
app.use('/', deploymentRoutes);
app.use('/', operatorInstallRoutes);

// Start the server
app.listen(3000, () => console.log('Server started on port 3000.'));
