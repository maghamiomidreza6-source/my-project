const app = require('./app');

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Issue & Task Tracker API Service`);
  console.log(` Listening on: http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

const handleTermination = (signal) => {
  console.log(`Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    console.log('HTTP service terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('SIGINT', () => handleTermination('SIGINT'));
