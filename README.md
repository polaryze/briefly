# Briefly.ai - AI-Powered Newsletter Generator

Transform your social media content into engaging newsletters with AI.

## 🚀 Features

- **Multi-Platform Integration**: Connect Twitter, Instagram, LinkedIn, and YouTube
- **AI-Powered Summarization**: Automatically summarize and format your content
- **Beautiful Templates**: Professional newsletter templates with customization
- **Email Integration**: Send newsletters directly via Gmail
- **Real-time Preview**: See your newsletter before sending

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Auth0 account for authentication
- OpenAI API key
- RapidAPI key for social media data

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/briefly.ai.git
   cd briefly.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Frontend Environment Variables (VITE_ prefix)
   VITE_AUTH0_DOMAIN=your_auth0_domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your_auth0_client_id
   VITE_CUSTOM_DOMAIN=your_custom_domain.com
   
   # Server-side Environment Variables (no VITE_ prefix)
   OPENAI_API_KEY=your_openai_api_key_here
   RAPIDAPI_KEY=your_rapidapi_key_here
   PORT=3001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start the backend server**
   ```bash
   node server.cjs
   ```

## 🔧 Environment Variables

### Frontend Variables (VITE_ prefix)
These are exposed to the client and should only contain non-sensitive configuration:

- `VITE_AUTH0_DOMAIN`: Your Auth0 domain
- `VITE_AUTH0_CLIENT_ID`: Your Auth0 client ID  
- `VITE_CUSTOM_DOMAIN`: Your custom domain (optional)

### Server-side Variables (no VITE_ prefix)
These are kept secure on the server and should contain sensitive API keys:

- `OPENAI_API_KEY`: Your OpenAI API key for AI summarization
- `RAPIDAPI_KEY`: Your RapidAPI key for social media data
- `PORT`: Server port (default: 3001)

## 🔐 Security Features

- **API Key Protection**: All sensitive API calls routed through secure server endpoints
- **Authentication Required**: Protected routes require Auth0 authentication
- **XSS Protection**: HTML sanitization for user-generated content
- **Input Validation**: Server-side validation for all API requests

## 📱 Usage

1. **Sign in** with your Auth0 account
2. **Connect your social media** accounts
3. **Generate your newsletter** with AI-powered summarization
4. **Customize** the content and styling
5. **Send** via email or download as HTML

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Authentication**: Auth0
- **AI**: OpenAI API
- **Social Media**: RapidAPI
- **Styling**: Tailwind CSS + shadcn/ui

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email hello@briefly.ai or create an issue in this repository.

---

Built with ❤️ by the Briefly.ai team 