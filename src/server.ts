import "dotenv/config";
import "./configuration/dns";
import app from "./app";
import { connectDB } from "./configuration/database";
import { verifyEmailConfiguration } from "./utils/email";
import { createServer } from 'http';
import VoiceCallSocketService from './services/voice-call-socket.service';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io for voice calls
const voiceCallService = new VoiceCallSocketService(server);

// Connect to database
connectDB();

// Start server
server.listen(PORT, () => {
  console.log(`🚀 EventKonnect server listening on port ${PORT}`);
  console.log(`📡 Socket.io server ready for voice calls`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🎤 Voice call stats:`, voiceCallService.getStats());
  
  verifyEmailConfiguration().catch((error) => {
    console.error("Email configuration verification failed:", error.message);
  });
});
