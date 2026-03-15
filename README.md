# ZLINGO - The Ultimate GenZ Rizz Engine

ZLINGO is a next-generation conversation coach and cultural decoder built for the Gemini Live Agent Challenge. It leverages the power of Gemini 2.5 Live API to provide real-time voice coaching, helping users master modern slang and social vibes.

## 🚀 Features

- **Live Rizz Coach**: Real-time voice interaction using `gemini-2.5-flash-native-audio-preview-09-2025`. Get instant feedback on your slang, aura, and conversational flow.
- **Meme Decoder**: Upload any meme to get a deep-lore breakdown. Uses Gemini's multimodal capabilities to explain the cultural context and "rizz rating" of any image.
- **Contextual Learning**: Seamlessly transition from decoding a meme to practicing the slang with the Live Coach.
- **Vibrant GenZ UI**: A glassmorphic, atmospheric interface designed for the next generation.

## 🛠️ Tech Stack

### **Core AI & APIs**
*   **Google GenAI SDK (`@google/genai`)**: The primary interface for all AI interactions.
*   **Gemini 2.5 Live API**: Specifically the `gemini-2.5-flash-native-audio-preview-09-2025` model for low-latency, full-duplex voice coaching.
*   **Gemini 3 Flash API**: The `gemini-3-flash-preview` model for high-speed multimodal analysis of memes.
*   **Web Audio API**: Used for raw PCM audio processing, Int16 encoding, and implementing a scheduled playback queue for gapless AI speech.
*   **MediaDevices API**: For accessing the user's microphone and camera in the browser.

### **Frontend & Languages**
*   **TypeScript**: Used across the entire codebase for robust type safety.
*   **React 18**: The core UI framework, utilizing functional components and hooks.
*   **Vite**: The build tool and development server, ensuring lightning-fast HMR.
*   **Tailwind CSS**: For all styling, enabling a custom "glassmorphic" design system with neon accents.
*   **Motion (`motion/react`)**: For high-performance layout animations and tab transitions.
*   **Lucide React**: For a consistent and crisp SVG icon system.

### **Cloud & Infrastructure**
*   **Google Cloud Run**: The primary hosting platform, providing a scalable, serverless environment.
*   **Docker**: For containerizing the application for production deployment.
*   **Google Cloud Console**: For monitoring logs, managing deployments, and configuring API quotas.

## 📦 Spin-up Instructions

To run this project locally:

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd zlingo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to `http://localhost:3000` in your browser.

## ☁️ Google Cloud Integration

This project is deployed on **Google Cloud Run**, providing a scalable, serverless environment for the ZLINGO agent. The deployment is fully automated using a CI/CD pipeline that builds the container and deploys it to the europe-west2 region.

---
Built for the #GeminiLiveAgentChallenge
