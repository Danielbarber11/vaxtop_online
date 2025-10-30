<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UlVkmD-39IF1zn3sSCjrDcKzaXkd7fXL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## New Features (Production Ready)

### ✨ Google OAuth Authentication
Seamless login with Google accounts. No need to create a new account - just sign in with your Google ID.

### 💾 Data Persistence
All your product links, preferences, and user data are automatically saved and restored. Your data persists across sessions using localStorage.

### 🔐 Enhanced Security
- Secure password validation with AI feedback
- Security questions for password recovery
- User session management

### 📱 Responsive Design
Works perfectly on desktop, tablet, and mobile devices.

### 🌍 Hebrew Language Support
Fully localized interface in Hebrew (עברית).

### ♿ Accessibility Features
- High contrast mode
- Large text option
- Reduced motion support
- Screen reader optimized

## Setup for Production

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Start:
1. Clone repository
2. `npm install`
3. Set up environment variables (see .env.example)
4. `npm run dev` for development
5. `npm run build` for production

## Environment Variables

Create a `.env.local` file with:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_KEY=your_gemini_api_key
```

See `.env.example` for all available options.

## Technologies Used

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Authentication:** Google OAuth, localStorage
- **AI:** Google Gemini API
- **Deployment:** Vercel
- **Build Tool:** Vite

## Data Management

User data includes:
- User profile and preferences
- Product links and metadata
- User subscriptions and notifications
- Saved products

All data is stored securely in localStorage and can be exported/imported for backup.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

This project is open source.

## Support

For issues and questions, please open a GitHub issue or contact the maintainers.

## Status
Project is production-ready and deployed on Vercel.
