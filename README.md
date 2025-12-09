# 🌱 EcoTrace: Journey for Good

A comprehensive carbon footprint tracking application that helps users monitor, analyze, and reduce their environmental impact through intelligent journey tracking and community engagement.

## 🚀 Features

### 🎯 Core Functionality
- **Journey Tracking**: Log and monitor your daily travels with detailed carbon emission calculations
- **Real-time Carbon Calculator**: Get instant emissions data for different transportation modes
- **Interactive Maps**: Visualize your journeys and carbon footprint on Google Maps
- **Predictive Routing**: AI-powered route suggestions for optimal eco-friendly travel

### 📊 Analytics & Insights
- **Visual Impact Analytics**: Comprehensive dashboard with emission trends and patterns
- **Carbon Footprint Mapping**: Heat maps showing your environmental impact zones
- **Time-based Analysis**: Track emissions by day, week, month, and year
- **Transportation Mode Analysis**: Compare emissions across different travel methods

### 🏆 Gamification & Community
- **Achievement System**: Unlock badges for eco-friendly milestones
- **Leaderboards**: Compete with friends and community members
- **Community Stories**: Share and discover sustainability success stories
- **Team Challenges**: Participate in group sustainability goals

### 🤖 AI-Powered Features
- **Eco Storyteller**: AI-generated personalized sustainability narratives
- **Smart Route Predictions**: Machine learning-based travel optimization
- **Community Impact Analysis**: AI insights on collective environmental impact
- **Intelligent Recommendations**: Personalized suggestions for reducing carbon footprint

### 🔐 User Management
- **Secure Authentication**: NextAuth.js with multiple provider support
- **User Profiles**: Customizable profiles with achievement tracking
- **Privacy Controls**: Comprehensive data management and privacy settings
- **Account Management**: Full CRUD operations for user data

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **Lucide React**: Beautiful icon library

### Backend & Database
- **MongoDB**: NoSQL database with Mongoose ODM
- **NextAuth.js**: Authentication and session management
- **Node.js**: Server-side runtime

### APIs & Integrations
- **Google Maps API**: Interactive mapping and geocoding
- **Carbon Interface API**: Real-time emission calculations
- **OpenWeatherMap API**: Weather data for route optimization

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **TypeScript**: Static type checking

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database
- Google Maps API key
- Carbon Interface API key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/asefahmed500/EcoTrace-Journey-for-Good.git
cd EcoTrace-Journey-for-Good
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
CARBON_INTERFACE_API_KEY=your_carbon_interface_api_key
OPENWEATHER_API_KEY=your_openweather_api_key

# Email (optional)
EMAIL_SERVER_HOST=your_email_host
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email_user
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_FROM=noreply@ecotrace.com
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── ...               # Other pages
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   ├── landing/          # Landing page components
│   ├── auth/             # Authentication components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
├── models/               # Database models
├── types/                # TypeScript type definitions
└── ai/                   # AI-powered features
    ├── flows/            # AI workflow implementations
    └── tools/            # AI utility tools
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Journey Management
- `GET/POST /api/journey` - Journey CRUD operations
- `GET/PUT/DELETE /api/journey/[id]` - Individual journey operations

### Carbon Calculations
- `POST /api/carbon/calculate` - Calculate emissions for routes
- `GET /api/carbon/summary` - Get user's carbon summary

### AI Features
- `POST /api/ai/predict-route` - Predictive routing suggestions
- `POST /api/ai/eco-summary` - AI-generated eco summaries
- `POST /api/ai/community-impact` - Community impact analysis

### Gamification
- `GET /api/gamification/badges` - User achievements
- `POST /api/gamification/update` - Update user progress

## 🎨 Key Components

### Dashboard Components
- **MainDashboard**: Central hub with overview metrics
- **JourneyLogForm**: Interactive form for logging travels
- **GoogleMap**: Interactive map with journey visualization
- **AnalyticsDashboard**: Comprehensive analytics and insights
- **Leaderboard**: Community rankings and achievements

### AI Components
- **StorytellerDisplay**: AI-generated sustainability narratives
- **PredictiveRoutingForm**: Smart route suggestions
- **CommunityGamification**: Gamified community features

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Carbon Interface** for emission calculation APIs
- **Google Maps** for mapping and geocoding services
- **OpenWeatherMap** for weather data
- **Shadcn/ui** for beautiful UI components
- **Next.js** team for the amazing framework

## 📞 Support

For support, email support@ecotrace.com or join our community discussions.

## 🔗 Links

- **Live Demo**: [https://ecotrace-journey-for-good.vercel.app](https://ecotrace-journey-for-good.vercel.app)
- **Documentation**: [https://docs.ecotrace.com](https://docs.ecotrace.com)
- **API Reference**: [https://api.ecotrace.com/docs](https://api.ecotrace.com/docs)

---

**Made with 💚 for a sustainable future**