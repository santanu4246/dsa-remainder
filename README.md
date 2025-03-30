# DSA Remainder

A Next.js application that helps you maintain your daily DSA (Data Structures and Algorithms) practice streak by sending you personalized LeetCode problems and tracking your progress.

## Features

- 🔐 Google Authentication
- 📊 LeetCode Progress Tracking
- 🔥 Daily Streak Counter
- 📈 Practice Rate Analytics
- 📧 Daily Problem Reminders
- 🎯 Personalized Problem Selection
- 🌙 Dark Mode UI

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: NextAuth.js
- **Database**: Neon DB (PostgreSQL) with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Email Service**: Nodemailer
- **Deployment**: Vercel

## Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm
- Neon DB account (PostgreSQL)
- Gmail account for sending emails
- LeetCode account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Neon Database
DATABASE_URL="postgresql://[user]:[password]@[neon-host]/[dbname]?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
NODEMAILER_USER="your-gmail-address"
NODEMAILER_PASS="your-gmail-app-password"
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dsa-remainder.git
   cd dsa-remainder
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up Neon Database:
   - Create a new project at [Neon](https://neon.tech)
   - Get your connection string from the project dashboard
   - Add the connection string to your `.env` file

4. Set up the database:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

## Usage

1. Sign in with your Google account
2. Set up your LeetCode username in your profile
3. Configure your practice preferences:
   - Select topics you want to practice
   - Choose difficulty level
   - Set preferred practice time
4. Receive daily problem reminders
5. Track your progress on the dashboard

## API Endpoints

- `/api/user` - Get user profile
- `/api/user/leetcode` - Get/Update LeetCode username
- `/api/user/streak` - Get current streak
- `/api/user/practice` - Get practice statistics
- `/api/scheduledQuestions` - Get scheduled questions
- `/api/cron/sendQuestions` - Send daily questions

## Database Schema

The application uses Neon DB with the following main tables:
- `User` - Stores user profiles and preferences
- `Topic` - Available DSA topics
- `EmailLog` - Tracks sent problem reminders
- `Question` - Stores problem history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [LeetCode](https://leetcode.com/) for their problem database
- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Neon](https://neon.tech) for the serverless PostgreSQL database
