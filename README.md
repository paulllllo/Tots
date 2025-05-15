# Tots Web Application

A modern web application for sharing and discovering ideas, built with Next.js, TypeScript, and Firebase.

## Features

- 🔐 User Authentication
  - Sign up and login functionality
  - Profile management
  - Secure session handling

- 💡 Idea Management
  - Create and post new ideas
  - View idea feed
  - Like and comment on ideas
  - Search functionality
  - Tag-based organization

- 👤 User Profiles
  - View user information
  - See user's posted ideas
  - Edit profile information
  - View liked ideas

- 🔍 Search and Discovery
  - Search ideas by title and description
  - Filter by tags
  - Sort by latest/popular

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tots-app.git
cd tots-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── profile/           # Profile pages
│   └── liked/             # Liked ideas page
├── components/            # React components
│   ├── IdeaFeed.tsx      # Idea feed component
│   ├── IdeaPreview.tsx   # Idea preview component
│   └── SearchBar.tsx     # Search component
├── utils/                # Utility functions
│   ├── firebaseConfig.ts # Firebase configuration
│   └── likes.ts         # Like functionality
└── types/               # TypeScript type definitions
```

## API Documentation

### Authentication

- `signUp(email: string, password: string)`: Register a new user
- `signIn(email: string, password: string)`: Sign in existing user
- `signOut()`: Sign out current user

### Ideas

- `createIdea(headline: string, description: string, tags: string[])`: Create a new idea
- `getIdeas()`: Fetch all ideas
- `getIdeaById(id: string)`: Fetch a specific idea
- `likeIdea(ideaId: string)`: Like an idea
- `unlikeIdea(ideaId: string)`: Unlike an idea
- `commentOnIdea(ideaId: string, comment: string)`: Add a comment to an idea

### User Profile

- `getUserProfile(userId: string)`: Fetch user profile
- `updateUserProfile(userId: string, data: UserProfileData)`: Update user profile
- `getUserIdeas(userId: string)`: Fetch user's posted ideas
- `getLikedIdeas(userId: string)`: Fetch user's liked ideas

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Firebase team for the backend services
- Tailwind CSS team for the utility-first CSS framework
