# EcoTrace: Journey for Good

EcoTrace is a modern, AI-powered web application designed to help users track, understand, and reduce their carbon footprint from daily travel. By providing intelligent insights, personalized suggestions, and gamified challenges, EcoTrace turns every journey into a meaningful step towards a greener planet.

This project is built with Next.js, React, Tailwind CSS, and ShadCN UI components. It leverages Google's Genkit for its powerful AI and generative features.

## Core Features

-   **Journey Logging & Carbon Calculation**: Automatically log your travel and calculate real-time CO₂ emissions for different modes of transportation using an advanced carbon calculation engine.
-   **AI-Powered Predictive Routing**: Receive suggestions for optimal departure times based on predictive traffic patterns to minimize emissions and avoid congestion.
-   **Alternative Route Suggestions**: Get recommendations for lower-carbon routes with clear comparisons of their environmental impact.
-   **Interactive Footprint Map**: Visualize your carbon footprint evolving over time on an interactive map. See your journey history, explore an emissions heatmap, and find nearby EV charging stations.
-   **Community & Team Features**: Create or join teams to compete in challenges, view team leaderboards, and see your collective impact.
-   **Gamified Achievements**: Stay motivated by unlocking badges and achievements for reaching eco-friendly milestones.
-   **Personalized AI Summaries**: Receive personalized narrative summaries of your eco-journey, generated by an AI Eco-Coach.
-   **Community Impact Analysis**: Use AI tools to identify areas that would benefit most from improved public transportation, contributing to smarter urban planning.
-   **User Preference Settings**: Customize the app by recording your favorite routes, preferred transport types, and environmental priorities.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **UI Library**: [React](https://react.dev/)
-   **AI/Generative**: [Google Genkit](https://firebase.google.com/docs/genkit)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
-   **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose

## Getting Started

To run this project locally, you will need to set up the following environment variables in a `.env` file at the root of the project:

```bash
# MongoDB Connection String
MONGODB_URI="your_mongodb_connection_string"

# Google Maps API Key (for routing and maps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# NextAuth.js Configuration
AUTH_SECRET="your_nextauth_secret"
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"

# Genkit/Google AI Configuration
GEMINI_API_KEY="your_google_ai_api_key"

# The public URL of your application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

1.  Install the dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002` or the port specified in your `dev` script.
