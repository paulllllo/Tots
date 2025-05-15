# Tots Web Application Development Plan (Next.js App Router)

**Phase 1: Project Setup and Core Infrastructure**

1.  **Initialize Next.js Project with App Router:**
    ```bash
    npx create-next-app@latest tots --typescript --app
    cd tots
    ```
2.  **Install Dependencies:**
    ```bash
    npm install firebase @headlessui/react @heroicons/react
    npm install -D tailwindcss postcss autoprefixer
    ```
3.  **Configure Tailwind CSS:**
    * Initialize Tailwind configuration: `npx tailwindcss init -p`
    * Update `tailwind.config.js` with content paths (using the `app` directory).
    * Update `postcss.config.js` to include Tailwind and Autoprefixer.
    * Add Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`) to `app/globals.css`.
4.  **Initialize Firebase Project:** Create and configure a Firebase project on the Firebase console.
5.  **Configure Firebase in Next.js (`utils/firebaseConfig.ts`):**
    * Create `utils/firebaseConfig.ts` with Firebase project credentials.
    * Initialize Firebase app: `initializeApp(firebaseConfig)`.
    * Export `auth`, `firestore`, and `storage` instances.
6.  **Basic Layout Component (`app/layout.tsx`):** Create a root layout to structure the main application UI (header, navigation placeholders).

**Phase 2: User Authentication**

7.  **Implement Signup Page (`app/signup/page.tsx`):**
    * Input fields: name, username, email, password, profile picture upload, profession.
    * Implement UI with Tailwind CSS.
8.  **Implement Login Page (`app/login/page.tsx`):**
    * Input fields: email, password.
    * Implement UI with Tailwind CSS.
9.  **Firebase Authentication Integration (`utils/auth.ts` or within pages/components):**
    * **Signup:**
        * Use `createUserWithEmailAndPassword(auth, email, password)`.
        * Implement logic to upload the profile picture to Firebase Storage using `ref(storage, ...)` and `uploadBytesResumable(...)`.
        * Get download URL using `getDownloadURL(...)`.
        * Store user data (name, username, profilePictureUrl, profession) in Firestore `users` collection using `setDoc(doc(firestore, 'users', user.uid), ...)`.
    * **Login:**
        * Use `signInWithEmailAndPassword(auth, email, password)`.
    * **Authentication State Management (`app/providers/AuthProvider.tsx` - Client Component):**
        * Create a client component using `'use client'`.
        * Use `useState` and `useEffect` with `onAuthStateChanged(auth, (user) => { ... })` to track login status.
        * Store user information in a `Context` using `createContext` and `useContext`.
10. **Implement Protected Routes (`middleware.ts`):**
    * Create `middleware.ts` in the `app` directory.
    * Use `NextResponse.redirect()` to redirect unauthenticated users trying to access protected routes.
    * Define protected routes using `matcher`. Example: `/ideas/:path*`, `/liked`, `/profile`, `/users/:path*/edit`.

**Phase 3: Idea Posting Functionality**

11. **Create "New Idea" Button (`app/layout.tsx` or main feed - Client Component):** Implement a client component button (using `'use client'`) visible to logged-in users to trigger the modal.
12. **Implement Create Idea Modal (`components/CreateIdeaModal.tsx` - Client Component):**
    * Use `'use client'`.
    * Fields: headline (input), description (textarea), tags (input).
    * State management for modal visibility and form inputs using `useState`.
    * UI implementation with Tailwind CSS and potentially `@headlessui/react` for modal structure.
13. **Handle Idea Submission (`app/page.tsx` or a dedicated action - Server Action or Client Component):**
    * **Server Action (recommended for data mutation):** Create a Server Action within `app/page.tsx` or a separate file.
        * Use `'use server'`.
        * Function to handle form submission, receiving `FormData`.
        * Get current user ID using `auth.currentUser?.uid`.
        * Use Firestore SDK (`addDoc(collection(firestore, 'ideas'), { ... })`) to store:
            * `headline`
            * `description`
            * `tags` (store as an array)
            * `timestamp` (`serverTimestamp()`)
            * `authorId`
            * `authorProfilePictureUrl` (retrieve from user data).
        * In the modal, use `<form action={yourServerAction}>` to submit data.
    * **Client Component (alternative):** Implement submission logic within the modal using `'use client'` and Firebase SDK.

**Phase 4: Displaying Ideas (Idea Feed) (`app/page.tsx`)**

14. **Fetch Ideas from Firestore (`app/page.tsx` - Server Component with Server-Side Rendering):**
    * Use `async` function to fetch initial data on the server.
    * Use `getDocs(query(collection(firestore, 'ideas'), orderBy('timestamp', 'desc')))`.
    * Pass the initial data as props to the client component displaying the feed.
15. **Implement Idea Preview Component (`components/IdeaPreview.tsx` - Client Component):**
    * Use `'use client'` for interaction logic (like, expand).
    * Props: `idea` object.
    * Display: headline, truncated description, tags (map and display), like button/count, comment icon/count, share button (placeholder initially), author's profile picture.
    * UI implementation with Tailwind CSS.
16. **Display Idea Feed (`app/page.tsx` - Client Component):**
    * Receive initial `ideas` as props.
    * Use `useState` to manage local updates (e.g., after liking).
    * Map over the `ideas` state and render `IdeaPreview` components.
    * Consider using `useEffect` with `onSnapshot` in a client component to listen for real-time updates after the initial server-side render.

**Phase 5: Idea Interaction (Like) (`components/IdeaPreview.tsx` - Client Component and Server Action or Client Component)**

17. **Implement Like Button:** Display a like icon. Show the number of likes.
18. **Store Likes in Firestore:** `likes` collection with `userId` and `ideaId`.
19. **Handle Like/Unlike Logic:**
    * **Server Action (recommended):** Create a Server Action in `components/IdeaPreview.tsx` or a parent component to handle liking/unliking.
        * Use `'use server'`.
        * Function to receive `ideaId` and current `likeStatus`.
        * Perform Firestore operations (check if like exists, add or delete).
        * Call this action from the like button's `onClick` handler using `useTransition` for optimistic updates.
    * **Client Component (alternative):** Implement like/unlike logic directly in the client component using `'use client'` and Firebase SDK.

**Phase 6: Expanded Post View (`components/IdeaPreview.tsx` - Client Component and state management)**

20. **Implement Expanded Post State:** Use `useState` in the `IdeaPreview` or a parent client component to track the expanded idea ID.
21. **Modify `IdeaPreview`:** Make the component clickable to update the expanded state.
22. **Display Expanded Details:** Conditionally render more description and "View Details" button based on the expanded state.

**Phase 7: Post Details Page and Commenting (`app/ideas/[ideaId]/page.tsx` and `components/Comment.tsx` - Server and Client Components)**

23. **Create Post Details Page (`app/ideas/[ideaId]/page.tsx` - Server Component):**
    * Use dynamic route segment `[ideaId]`.
    * Fetch the specific idea data from Firestore using `getDoc(doc(firestore, 'ideas', params.ideaId))` in the server component.
    * Pass the idea data as props to client components.
24. **Display Idea Details:** Render the full details in a client component.
25. **Implement Comment Display (`app/ideas/[ideaId]/page.tsx` - Server Component fetching initial data, `components/Comment.tsx` - Client Component for display):**
    * Fetch initial comments related to `params.ideaId` using `getDocs(query(collection(firestore, 'comments'), where('ideaId', '==', params.ideaId), orderBy('timestamp', 'desc')))` in the server component.
    * Pass comments as props to a client component.
    * Create `components/Comment.tsx` to display individual comments (fetch user data for commenter in a server component or client-side).
    * Consider using `useEffect` with `onSnapshot` in a client component to listen for new comments.
26. **Implement Comment Submission Form (`app/ideas/[ideaId]/page.tsx` - Client Component and Server Action or Client Component):**
    * Text input and "Post Comment" button in a client component.
27. **Handle Comment Submission:**
    * **Server Action:** Create a Server Action to add comments to Firestore.
    * **Client Component:** Use Firebase SDK directly in a client component.

**Phase 8: Comment Navigation (`components/IdeaPreview.tsx` - Client Component)**

29. **Add Comment Icon to `IdeaPreview`:** Ensure icon and count are displayed.
30. **Link Comment Icon to Post Details Page:** Use `<Link href={`/ideas/${idea.id}`}>` from `next/link`.

**Phase 9: Liked Ideas Page (`app/liked/page.tsx` - Server Component fetching initial data, Client Component for display)**

31. **Create Liked Ideas Page (`app/liked/page.tsx` - Server Component):**
    * Get current user ID on the server using `auth.currentUser?.uid`.
    * Fetch liked `ideaId`s from the `likes` collection.
    * Fetch the actual idea data for these IDs.
    * Pass liked ideas as props to a client component.
32. **Display Liked Ideas:** Map over the props and render `IdeaPreview` components in a client component.

**Phase 10: Idea Search (`components/SearchBar.tsx` - Client Component and `app/page.tsx` - Client Component for filtering)**

34. **Add Search Bar (`components/SearchBar.tsx` - Client Component):** Input field and state management.
35. **Implement Search Functionality:**
    * Filter the `ideas` state in the main feed's client component based on the search term.

**Phase 11: User Profile Page (`app/users/[userId]/page.tsx` - Server Component fetching initial data, Client Component for display)**

36. **Create User Profile Page (`app/users/[userId]/page.tsx` - Server Component):** Use dynamic route segment `[userId]`.
37. **Fetch User Data:** Fetch user data from Firestore based on `params.userId` in the server component.
38. **Fetch User's Posts:** Fetch ideas where `authorId` matches `params.userId` in the server component.
39. **Display User Profile Information:** Render in client components.
40. **Link Profile Pictures:** Use `<Link href={`/users/${authorId}`}>`.

**Phase 12: Edit Profile Page (`app/profile/edit/page.tsx` - Client Component with Server Actions)**

41. **Create Edit Profile Page (`app/profile/edit/page.tsx` - Client Component):** Form with input fields.
42. **Fetch Current User Data:** Fetch in a `useEffect` hook in the client component.
43. **Implement Edit Form:** Input fields for name, username, profession, profile picture, password.
44. **Handle Profile Update (Server Actions):**
    * Create Server Actions to update user data in Firestore and authentication (password).
    * Handle profile picture upload to Firebase Storage within the Server Action.
    * Call these actions from the form's `onSubmit` handler.

**Phase 13: Styling and UI/UX Enhancements**

45. **Apply Tailwind CSS:** Consistent styling.
46. **Implement UI/UX Details:** Loading states, error messages, feedback.
47. **Responsiveness:** Tailwind's responsive utilities.

<!-- **Phase 14: Testing and Refinement** -->

<!-- 48. **Thorough Testing.**
49. **Code Review.**
50. **Refinement.** -->