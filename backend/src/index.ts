import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import router from "./routes";
import path from "path";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { setIo } from "./socket";
import { attacks } from "./db";
import { ApiError } from "./types";

const app = express();
// Trust reverse proxies/load balancers so X-Forwarded-For is honored
app.set('trust proxy', true);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-forwarded-for'],
  credentials: true
}));

app.use(express.json({
  limit: '10kb'
}));

app.use(router);

app.get("/", (_req: Request, res: Response) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString() 
  });
});

// Serve frontend build (SPA) and fallback for client-side routes
const distPath = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(distPath));

// SPA fallback: send index.html for non-API routes
app.get("*", (req: Request, res: Response, _next: NextFunction) => {
  const isApi = req.path.startsWith("/api") || req.path.startsWith("/honeypot");
  if (isApi) {
    res.status(404).json({ error: "Route not found" });
    return;
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const error: ApiError = {
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  };
  res.status(500).json(error);
});

// Keep 404 handler last for any unmatched routes (API only)
// Note: SPA fallback above handles non-API routes
app.use((req: Request, res: Response) => {
  const error: ApiError = {
    error: "Route not found"
  };
  res.status(404).json(error);
});

const server = createServer(app);

// Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});
setIo(io);

io.on('connection', (socket: any) => {
  socket.emit('status', { message: 'Connected', serverTime: new Date().toISOString() });
  socket.on('request_latest_attacks', () => {
    socket.emit('latest_attacks', attacks.slice(0, 10).map(attack => ({
      ...attack,
      timestamp: attack.timestamp.toISOString()
    })));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shutdown complete');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server shutdown complete');
    process.exit(0);
  });
});

export default app;
