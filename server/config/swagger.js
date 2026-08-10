import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Restaurant Operations API",
      version: "1.0.0",
      description:
        "REST API for restaurant inventory, orders, food waste, analytics and demand prediction",
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
  },

  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
