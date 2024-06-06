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
const dockerCredentials = require('./dockerCredentials');
const resizeMinio = require('./resizeMinio');
const deployApp = require('./deployapp');
const tektonInfra = require('./tektonInfra');
const tektonPipeline = require('./tektonPipeline');
const listGitRepos = require('./listGitRepos');
const listGitBranches = require('./listGitBranches');
const { watchPipelineEvents } = require('./pipelineEvents');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerDef');
const exposeService = require('./exposeServices');
const databasBackup = require('./databaseBackup');

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
app.use('/', dockerCredentials);
app.use('/', resizeMinio);
app.use('/', deployApp);
app.use('/', tektonInfra);
app.use('/', tektonPipeline);
app.use('/', listGitRepos);
app.use('/', listGitBranches);
app.use('/', exposeService);
app.use('/', databasBackup);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Call pipeline event watcher
//watchPipelineEvents();

// Start the server
app.listen(3000, () => console.log('Server started on port 3000.'));
