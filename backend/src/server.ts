import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { providerService } from "./services/providerService";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Get all providers and their models
app.get("/api/providers/models", (req: Request, res: Response): void => {
  try {
    const providersData = providerService.getAllProvidersAndModels();
    res.status(200).json(providersData);
  } catch (error) {
    console.error("Providers endpoint error:", error);
    res.status(500).json({
      error: "Failed to fetch providers and models",
    });
  }
});

// Get models for a specific provider
app.get("/api/providers/:providerId/models", (req: Request, res: Response): void => {
  try {
    const { providerId } = req.params;
    
    if (!providerId) {
      res.status(400).json({
        error: "Provider ID is required",
      });
      return;
    }
    
    const provider = providerService.getProvider(providerId);
    
    if (!provider) {
      res.status(404).json({
        error: "Provider not found",
      });
      return;
    }
    
    res.status(200).json({
      provider: provider.name,
      models: provider.models
    });
  } catch (error) {
    console.error("Provider models endpoint error:", error);
    res.status(500).json({
      error: "Failed to fetch provider models",
    });
  }
});

// Chat endpoint
app.post("/api/chat", (req: Request, res: Response): void => {
  try {
    const { message, providerId, modelId } = req.body;

    if (!message) {
      res.status(400).json({
        error: "Message is required",
      });
      return;
    }

    // Validate provider and model if provided
    if (providerId && modelId) {
      const isValid = providerService.isValidProviderModel(providerId, modelId);
      if (!isValid) {
        res.status(400).json({
          error: "Invalid provider or model combination",
        });
        return;
      }
    }

    // TODO: Implement AI provider logic
    res.status(200).json({
      message: "Chat endpoint received your message",
      received: message,
      provider: providerId || "default",
      model: modelId || "default",
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", error);
  if (!res.headersSent) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Providers: http://localhost:${PORT}/api/providers/models`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});
