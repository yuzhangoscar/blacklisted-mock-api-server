const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Mock data - blacklisted names
const blacklistedNames = [
  'John Smith',
  'Jane Doe',
  'Mike Johnson',
  'Sarah Wilson',
  'Robert Brown',
  'Emily Davis',
  'David Miller',
  'Lisa Garcia',
  'James Rodriguez',
  'Maria Martinez'
];

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'blacklisted-mock-api-server'
  });
});

// Blacklisted endpoint
app.get('/blacklisted', (req, res) => {
  const { name } = req.query;
  
  // If no name parameter provided, return all blacklisted names
  if (!name) {
    return res.status(200).json({
      blacklistedNames: blacklistedNames,
      count: blacklistedNames.length
    });
  }
  
  // If name parameter provided, check if it's blacklisted
  const isBlacklisted = blacklistedNames.some(blacklistedName => 
    blacklistedName.toLowerCase() === name.toLowerCase()
  );
  
  res.status(200).json({
    name: name,
    isBlacklisted: isBlacklisted
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /blacklisted',
      'GET /blacklisted?name=<name>'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server is running on port ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
  console.log(`Blacklisted endpoint: http://localhost:${PORT}/blacklisted`);
  console.log(`Check specific name: http://localhost:${PORT}/blacklisted?name=John%20Smith`);
});

module.exports = app;