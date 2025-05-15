# API Documentation

This document provides detailed information about the API endpoints and their usage in the Tots Web Application.

## Authentication

### Sign Up
```typescript
signUp(email: string, password: string): Promise<UserCredential>
```
Creates a new user account.
- **Parameters**:
  - `email`: User's email address
  - `password`: User's password (min 6 characters)
- **Returns**: Promise with UserCredential object
- **Throws**: Error if email already exists or password is invalid

### Sign In
```typescript
signIn(email: string, password: string): Promise<UserCredential>
```
Authenticates an existing user.
- **Parameters**:
  - `email`: User's email address
  - `password`: User's password
- **Returns**: Promise with UserCredential object
- **Throws**: Error if credentials are invalid

### Sign Out
```typescript
signOut(): Promise<void>
```
Signs out the current user.
- **Returns**: Promise that resolves when sign out is complete

## Ideas

### Create Idea
```typescript
createIdea(headline: string, description: string, tags: string[]): Promise<string>
```
Creates a new idea post.
- **Parameters**:
  - `headline`: Title of the idea
  - `description`: Detailed description
  - `tags`: Array of relevant tags
- **Returns**: Promise with the new idea's ID
- **Throws**: Error if user is not authenticated

### Get Ideas
```typescript
getIdeas(): Promise<Idea[]>
```
Retrieves all ideas, sorted by timestamp.
- **Returns**: Promise with array of Idea objects
- **Note**: Results are paginated (20 items per page)

### Get Idea by ID
```typescript
getIdeaById(id: string): Promise<Idea>
```
Retrieves a specific idea by its ID.
- **Parameters**:
  - `id`: Idea's unique identifier
- **Returns**: Promise with Idea object
- **Throws**: Error if idea not found

### Like Idea
```typescript
likeIdea(ideaId: string): Promise<void>
```
Adds a like to an idea.
- **Parameters**:
  - `ideaId`: ID of the idea to like
- **Returns**: Promise that resolves when like is added
- **Throws**: Error if user is not authenticated

### Unlike Idea
```typescript
unlikeIdea(ideaId: string): Promise<void>
```
Removes a like from an idea.
- **Parameters**:
  - `ideaId`: ID of the idea to unlike
- **Returns**: Promise that resolves when like is removed
- **Throws**: Error if user is not authenticated

### Comment on Idea
```typescript
commentOnIdea(ideaId: string, comment: string): Promise<string>
```
Adds a comment to an idea.
- **Parameters**:
  - `ideaId`: ID of the idea to comment on
  - `comment`: Comment text
- **Returns**: Promise with the new comment's ID
- **Throws**: Error if user is not authenticated

## User Profile

### Get User Profile
```typescript
getUserProfile(userId: string): Promise<UserProfile>
```
Retrieves a user's profile information.
- **Parameters**:
  - `userId`: User's unique identifier
- **Returns**: Promise with UserProfile object
- **Throws**: Error if user not found

### Update User Profile
```typescript
updateUserProfile(userId: string, data: UserProfileData): Promise<void>
```
Updates a user's profile information.
- **Parameters**:
  - `userId`: User's unique identifier
  - `data`: Object containing updated profile data
- **Returns**: Promise that resolves when update is complete
- **Throws**: Error if user is not authenticated or not found

### Get User Ideas
```typescript
getUserIdeas(userId: string): Promise<Idea[]>
```
Retrieves all ideas posted by a specific user.
- **Parameters**:
  - `userId`: User's unique identifier
- **Returns**: Promise with array of Idea objects
- **Note**: Results are paginated (20 items per page)

### Get Liked Ideas
```typescript
getLikedIdeas(userId: string): Promise<Idea[]>
```
Retrieves all ideas liked by a specific user.
- **Parameters**:
  - `userId`: User's unique identifier
- **Returns**: Promise with array of Idea objects
- **Note**: Results are paginated (20 items per page)

## Data Types

### Idea
```typescript
interface Idea {
  id: string;
  headline: string;
  description: string;
  tags: string[];
  authorId: string;
  authorProfilePictureUrl: string;
  timestamp: Timestamp;
  likes: number;
  comments: number;
}
```

### UserProfile
```typescript
interface UserProfile {
  id: string;
  name: string;
  username: string;
  profession: string;
  profilePictureUrl: string;
  bio: string;
  joinedAt: Timestamp;
}
```

### UserProfileData
```typescript
interface UserProfileData {
  name?: string;
  username?: string;
  profession?: string;
  profilePictureUrl?: string;
  bio?: string;
}
```

## Error Handling

All API functions throw errors in the following cases:
- User is not authenticated
- Required parameters are missing or invalid
- Resource not found
- Permission denied
- Network error

Error messages are descriptive and should be displayed to the user when appropriate. 