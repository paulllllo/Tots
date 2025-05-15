# Architecture Documentation

This document outlines the architecture and code structure of the Tots Web Application.

## Overview

The Tots Web Application is built using Next.js 14 with the App Router, TypeScript, and Firebase. It follows a component-based architecture with a focus on reusability and maintainability.

## Directory Structure

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

## Component Architecture

### Page Components
- Located in `src/app/`
- Server components by default
- Handle data fetching and state management
- Pass data to client components

### Client Components
- Located in `src/components/`
- Handle user interactions
- Manage local state
- Communicate with Firebase

## State Management

### Local State
- Managed using React's `useState` and `useEffect` hooks
- Used for UI state and form data

### Global State
- Firebase Authentication for user state
- Firestore for data persistence
- Real-time updates using Firestore listeners

## Data Flow

1. **Authentication Flow**
   - User signs up/logs in
   - Firebase Auth updates user state
   - Components react to auth state changes

2. **Idea Management Flow**
   - User creates/edits idea
   - Data is saved to Firestore
   - Real-time listeners update UI

3. **Interaction Flow**
   - User likes/comments on idea
   - Update is sent to Firestore
   - UI updates in real-time

## Firebase Integration

### Authentication
- Email/password authentication
- Session management
- Protected routes

### Firestore
- Collections:
  - `users`: User profiles
  - `ideas`: Idea posts
  - `likes`: Like relationships
  - `comments`: Comments on ideas

### Security Rules
- User authentication required for writes
- Public read access for ideas
- User-specific access for profiles

## Performance Considerations

### Code Splitting
- Next.js automatic code splitting
- Dynamic imports for large components
- Route-based code splitting

### Data Fetching
- Server-side rendering for initial load
- Client-side fetching for updates
- Pagination for large datasets

### Caching
- Next.js built-in caching
- Firebase offline persistence
- Browser caching for static assets

## Security

### Authentication
- Firebase Authentication
- Protected API routes
- Session management

### Data Protection
- Firestore security rules
- Input validation
- XSS prevention

### Environment Variables
- Sensitive data in `.env.local`
- Public variables in `.env`
- Runtime configuration

## Testing Strategy

### Unit Tests
- Component testing
- Utility function testing
- State management testing

### Integration Tests
- API endpoint testing
- Firebase integration testing
- Authentication flow testing

### End-to-End Tests
- User flow testing
- Cross-browser testing
- Performance testing

## Deployment

### Build Process
1. TypeScript compilation
2. Next.js build
3. Static optimization
4. Asset optimization

### Deployment Steps
1. Environment setup
2. Build generation
3. Static file serving
4. CDN configuration

## Monitoring and Maintenance

### Error Tracking
- Error boundaries
- Logging
- Analytics

### Performance Monitoring
- Lighthouse scores
- Core Web Vitals
- User metrics

### Maintenance
- Regular dependency updates
- Security patches
- Performance optimization 