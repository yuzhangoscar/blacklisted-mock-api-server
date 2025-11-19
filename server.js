const express = require('express');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiting for blacklist endpoint
const blacklistLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per minute for blacklist checks
  message: {
    error: 'Too many blacklist requests from this IP',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blacklisted Mock API Server',
      version: '1.0.0',
      description: 'A simple mock API server with health check and blacklisted names functionality. Rate limited for security.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-app-name-production.up.railway.app'
          : `http://localhost:${PORT}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      schemas: {
        RateLimitError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Too many requests from this IP'
            },
            retryAfter: {
              type: 'string',
              example: '15 minutes'
            }
          }
        }
      }
    }
  },
  apis: ['./server.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Swagger UI (with lighter rate limiting for docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Documentation JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current health status of the API server. Rate limited to 100 requests per 15 minutes per IP.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-11-19T06:47:29.824Z
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 120.5
 *                 service:
 *                   type: string
 *                   example: blacklisted-mock-api-server
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'blacklisted-mock-api-server'
  });
});

/**
 * @swagger
 * /blacklisted:
 *   get:
 *     summary: Get blacklisted names or check if a specific name is blacklisted
 *     description: Returns all blacklisted names when no query parameter is provided, or checks if a specific name is blacklisted when name parameter is provided. Rate limited to 20 requests per minute per IP.
 *     tags:
 *       - Blacklist
 *     parameters:
 *       - in: query
 *         name: name
 *         required: false
 *         description: Name to check if blacklisted (case-insensitive)
 *         schema:
 *           type: string
 *           example: John Smith
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: All blacklisted names (when no name parameter)
 *                   properties:
 *                     blacklistedNames:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["John Smith", "Jane Doe", "Mike Johnson"]
 *                     count:
 *                       type: integer
 *                       example: 10
 *                 - type: object
 *                   description: Blacklist check result (when name parameter provided)
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: John Smith
 *                     isBlacklisted:
 *                       type: boolean
 *                       example: true
 *             examples:
 *               all_names:
 *                 summary: Get all blacklisted names
 *                 value:
 *                   blacklistedNames: ["John Smith", "Jane Doe", "Mike Johnson", "Sarah Wilson", "Robert Brown", "Emily Davis", "David Miller", "Lisa Garcia", "James Rodriguez", "Maria Martinez"]
 *                   count: 10
 *               check_blacklisted:
 *                 summary: Name is blacklisted
 *                 value:
 *                   name: "John Smith"
 *                   isBlacklisted: true
 *               check_not_blacklisted:
 *                 summary: Name is not blacklisted
 *                 value:
 *                   name: "Random Person"
 *                   isBlacklisted: false
 *       429:
 *         description: Too many requests - rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */
app.get('/blacklisted', blacklistLimiter, (req, res) => {
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