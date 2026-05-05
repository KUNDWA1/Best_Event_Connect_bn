import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const setupSwagger = (app: Express): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const port = process.env.PORT || 3000;
  const localUrl = `http://localhost:${port}`;
  const renderUrl = process.env.RENDER_EXTERNAL_URL || "https://event-konnect-limited-bn.onrender.com";

  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "EventKonnect API",
        version: "1.0.0",
        description: "API documentation for EventKonnect - Event Management Platform",
        contact: {
          name: "EventKonnect Team",
          email: "support@eventkonnect.com",
        },
        license: {
          name: "ISC",
        },
      },
      servers: isProduction
        ? [
            {
              url: renderUrl,
              description: "Production server (Render)",
            },
          ]
        : [
            {
              url: localUrl,
              description: "Local development server",
            },
            {
              url: renderUrl,
              description: "Deployed server (Render)",
            },
          ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          Vendor: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique vendor ID (CUID)",
                example: "cuid1234567890"
              },
              userId: {
                type: "string",
                description: "Associated user ID",
                example: "cuid1234567890"
              },
              businessName: {
                type: "string",
                description: "Business or company name",
                example: "Creative Events Rwanda"
              },
              bio: {
                type: "string",
                nullable: true,
                description: "Vendor biography or description",
                example: "Professional event organizing company with 5 years experience"
              },
              experienceYears: {
                type: "integer",
                description: "Years of experience",
                example: 5
              },
              location: {
                type: "string",
                nullable: true,
                description: "Business location",
                example: "Kigali, Rwanda"
              },
              isVerified: {
                type: "boolean",
                description: "Vendor verification status",
                example: false
              },
              averageRating: {
                type: "number",
                format: "float",
                description: "Average rating from customers (0-5)",
                example: 4.5
              },
              profileImage: {
                type: "string",
                nullable: true,
                description: "Vendor profile image URL (Cloudinary)",
                example: "https://cloudinary.com/image.jpg"
              },
              portfolioImages: {
                type: "array",
                description: "Vendor portfolio image URLs stored in Cloudinary",
                items: {
                  type: "string"
                },
                example: ["https://cloudinary.com/portfolio-1.jpg", "https://cloudinary.com/portfolio-2.jpg"]
              },
              certifications: {
                type: "array",
                description: "Vendor certifications",
                items: {
                  type: "string"
                },
                example: ["Certified Wedding Planner", "Project Management Professional"]
              },
              awards: {
                type: "array",
                description: "Vendor awards and recognitions",
                items: {
                  type: "string"
                },
                example: ["Best Event Stylist 2025", "Top Wedding Vendor Kigali"]
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Profile creation timestamp",
                example: "2026-02-20T09:13:03.000Z"
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Profile last update timestamp",
                example: "2026-02-20T09:13:03.000Z"
              }
            },
            required: ["id", "userId", "businessName", "isVerified", "averageRating", "createdAt", "updatedAt"]
          },
          VendorServicePackage: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique service package ID (CUID)",
                example: "cuidpkg1234567890"
              },
              userId: {
                type: "string",
                description: "Associated user ID (vendor owner)",
                example: "cuiduser1234567890"
              },
              category: {
                type: "string",
                description: "Service category",
                example: "Photography"
              },
              title: {
                type: "string",
                description: "Service package title",
                example: "Wedding photography full-day package"
              },
              description: {
                type: "string",
                nullable: true,
                description: "Detailed description of what is included",
                example: "Includes 10 hours of coverage, edited photos, and online gallery."
              },
              minPrice: {
                type: "number",
                format: "float",
                description: "Minimum price for this package",
                example: 300000
              },
              maxPrice: {
                type: "number",
                format: "float",
                description: "Maximum price for this package",
                example: 600000
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Creation timestamp",
                example: "2026-02-20T09:13:03.000Z"
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Last update timestamp",
                example: "2026-02-20T09:13:03.000Z"
              }
            },
            required: ["id", "userId", "category", "title", "minPrice", "maxPrice", "createdAt", "updatedAt"]
          },
          ServiceCategory: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique service category ID (CUID)",
                example: "cuidcat1234567890"
              },
              name: {
                type: "string",
                description: "Category name (unique)",
                example: "Photography"
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Creation timestamp",
                example: "2026-03-16T09:00:00.000Z"
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Last update timestamp",
                example: "2026-03-16T09:00:00.000Z"
              }
            },
            required: ["id", "name", "createdAt", "updatedAt"]
          },
          EventCategory: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique event category ID (CUID)",
                example: "cuidevcat1234567890"
              },
              name: {
                type: "string",
                description: "Event category name (unique)",
                example: "Wedding"
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Creation timestamp",
                example: "2026-03-16T09:00:00.000Z"
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Last update timestamp",
                example: "2026-03-16T09:00:00.000Z"
              }
            },
            required: ["id", "name", "createdAt", "updatedAt"]
          }
        }
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ["./src/router/*.ts", "./src/controller/*.ts"], // Path to route and controller files
  };

  const swaggerSpec = swaggerJsdoc(options);

  // Swagger UI options for better appearance
  const uiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "EventKonnect API Documentation",
    customfavIcon: "/favicon.ico",
  };

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, uiOptions));
};


