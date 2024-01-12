const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mongodbRoutes = require('./mongodb');
const rabbitmqRoutes = require('./rabbitmq');
const deploymentRoutes = require('./deployment');
const redisRoutes = require('./redis');
const mariadbRoutes = require('./mariadb');
const postgresRoutes = require('./postgres');
const mysqlRoutes = require('./mysql');
const certificateRoutes = require('./certificates');
const deploymentRestartRoutes = require('./deploymentRestart');
const dockerCredenaials = require('./dockerCredentials');
const resizeMinio = require('./resizeMinio');

app.use(bodyParser.json());
app.use('/', mongodbRoutes);
app.use('/', rabbitmqRoutes);
app.use('/', deploymentRoutes);
app.use('/', redisRoutes);
app.use('/', mariadbRoutes);
app.use('/', postgresRoutes);
app.use('/', mysqlRoutes);
app.use('/', certificateRoutes);
app.use('/', deploymentRestartRoutes);
app.use('/', dockerCredenaials);
app.use('/', resizeMinio);

// Start the server
app.listen(3000, () => console.log('Server started on port 3000.'));
