# Volunteer Management Application

This is a Next.js application designed to help organizations manage volunteers, track their hours, and engage with them effectively. It uses Firebase for the backend database (Firestore) and Genkit for AI-powered features.

## Architecture Overview

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (using the App Router) with [React](https://react.dev/).
- **UI Components**: Built with [ShadCN UI](https://ui.shadcn.com/), a collection of reusable components.
- **Styling**: Styled with [Tailwind CSS](https://tailwindcss.com/), a utility-first CSS framework.
- **Authentication**: Client-side authentication state is managed through the `useAuth` hook (`src/hooks/use-auth.tsx`).

### Backend
- **Database**: [Firestore](https://firebase.google.com/docs/firestore) is used as the primary NoSQL database for storing all application data.
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) handles user sign-up and sign-in (Email/Password and Google).
- **AI Features**: [Genkit](https://firebase.google.com/docs/genkit) is used to create AI-powered "flows" that connect to Google's Gemini models for features like report summarization.
- **Hosting**: The entire application is configured for deployment on [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).


## Project Structure

- `src/app/`: Contains all the pages and routes for the Next.js application. Each folder corresponds to a URL path (e.g., `src/app/dashboard/page.tsx` is the `/dashboard` route).
- `src/components/`: Contains shared React components.
  - `ui/`: Core UI components from ShadCN (e.g., Button, Card, Input).
  - `app-layout.tsx`: The main layout component that includes the sidebar and navigation.
- `src/hooks/`: Custom React hooks for managing application state.
  - `use-auth.tsx`: Manages all user authentication logic, including login, logout, and user session state.
  - `use-toast.ts`: A hook for displaying notification popups (toasts).
- `src/lib/`: Core application logic and utilities.
  - `firebase.ts`: Firebase SDK initialization and configuration.
  - `firestore.ts`: All interaction logic with the Firestore database (e.g., getting volunteers, adding transactions).
  - `data.ts`: Defines the data structures (types) and provides initial mock data for seeding.
- `src/ai/`: Contains all the Genkit AI flows.
  - `flows/`: Each file defines a specific AI capability, such as generating a motivational summary.
- `public/`: Static assets like images or fonts.
- `.env.local`: **(Not in Git)** Your local file for storing secret API keys.
- `apphosting.yaml`: Configuration for Firebase App Hosting.

---

## Local Development

Follow these steps to set up and run the application on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Firebase CLI](https://firebase.google.com/docs/cli) (for running the local emulators)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repository-url>
cd <your-repository-name>
npm install
```

### 3. Environment Variables & Security

**CRITICAL: NEVER COMMIT API KEYS OR SECRETS TO GITHUB.** This project uses a `.env.local` file to store your secret keys locally. The `.gitignore` file is configured to prevent this file from ever being tracked by Git.

#### How to Set Up Your Local Keys

1.  **Create the file**: In the root of your project, find the file named `.env`. Make a copy of this file and rename the copy to `.env.local`.

    ```bash
    cp .env .env.local
    ```

2.  **Edit the file**: Open your new `.env.local` file in a text editor. You will see placeholders for your API keys.

3.  **Fill in the values**:
    *   **`GEMINI_API_KEY`**: This is required for the AI features. Go to [Google AI Studio](https://aistudio.google.com/app/apikey), sign in, and click **"Create API key"** to generate a new key.
    *   **Firebase Keys**: These are required to connect to your Firebase backend. You can find these in your **Firebase Console**. Go to **Project Settings** > **General** > **Your apps**. Select your web app, find the `firebaseConfig` object, and copy the corresponding values. All Firebase keys meant for the browser **must** be prefixed with `NEXT_PUBLIC_`.

### 4. Running with Firebase Emulators (Recommended)

For most development, it's best to use the Firebase Emulator Suite. This runs a local version of Firebase on your machine, so you don't have to touch your live production data.

To start the app and connect to the local emulators, run:
```bash
npm run dev:emulators
```
This command starts the Firestore and Auth emulators and then starts the Next.js development server. The app will automatically connect to the emulators. You can see the Emulator UI at [http://localhost:4000](http://localhost:4000).

### 5. Running Against Production (Live) Data

If you need to test against your live Firebase data, you can run the standard development command:
```bash
npm run dev
```
**Warning:** Be careful when working directly with production data.

---

## Production Configuration

### 1. Firebase Project Setup

This application is configured to use Firebase.

#### Firestore Database Setup
You must first create the Firestore database in your project.
1.  Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.
2.  Navigate to **Build > Firestore Database**.
3.  Click **Create database**.
4.  Select **Start in production mode**.
5.  Choose a location for your database (e.g., `us-west1`).
6.  Click **Enable**.

#### Authentication Providers
You must enable the sign-in providers you want to use.
  1. Go to the [Firebase Console](https://console.firebase.google.com) and select your project.
  2. Navigate to **Build > Authentication**.
  3. Select the **Sign-in method** tab.
  4. Enable **Email/Password**.
  5. Enable **Google**, provide a project support email, and click Save.


#### Security Rules
**This is a critical step.** You must configure Firestore Security Rules to secure your data. Go to your Firebase project -> Firestore Database -> Rules and paste the following:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Allow public read for store items
    match /storeItems/{itemId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.isAdmin == true; // Only admins can write
    }

    // Any authenticated user can read the list of volunteers.
    // A user can create their own profile, or update their own profile.
    // An admin can write to any profile.
    match /volunteers/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.isAdmin == true;
    }

    // Transactions can only be created by authenticated users who are admins.
    // Transactions can be read by any authenticated user.
    match /transactions/{transactionId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null && get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.isAdmin == true;
        allow update, delete: if false; // Transactions are immutable
    }

    // Clock-in events can be created by authenticated users.
    // They can be read or updated only by the user who created them or an admin.
    match /clockEvents/{eventId} {
        allow read, update: if request.auth != null && (request.auth.uid == resource.data.volunteerId || get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.isAdmin == true);
        allow create: if request.auth != null;
    }

    // Hour entries can be created by authenticated users.
    // They can be read only by the user they belong to or an admin.
    match /hourEntries/{entryId} {
        allow read: if request.auth != null && (request.auth.uid == resource.data.volunteerId || get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.isAdmin == true);
        allow create: if request.auth != null;
    }

    match /settings/{docId} {
        allow read: if true;
        allow write: if request.auth != null && get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.isAdmin == true; // Only admins can write
    }
  }
}
```

### 2. Deploying the Application

This application is set up for easy deployment with **Firebase App Hosting**.

- **Manual Deploys**: From your local machine, run the following command after logging into the Firebase CLI (`firebase login`):
  ```bash
  firebase deploy --only hosting
  ```

- **Continuous Deployment (Recommended)**: For a production workflow, it's best to connect your Git repository (e.g., on GitHub) to Firebase App Hosting for automated deployments on every push to your main branch. You can set this up in the Firebase console under App Hosting.

---

## Backup and Maintenance

### 1. Backing Up the Codebase

Your code should be stored in a Git repository (e.g., GitHub, GitLab, Bitbucket). This serves as your primary code backup.

- **Commit Regularly**:
  ```bash
  git add .
  git commit -m "Your descriptive commit message"
  ```

- **Push to Remote**:
  ```bash
  git push origin main
  ```

### 2. Backing Up the Firestore Database

Firebase offers managed export and import services, which are the recommended way to back up your Firestore data. This protects you against accidental data loss.

- **Enable Billing**: The export/import feature requires a Firebase project on the "Blaze" (pay-as-you-go) plan.
- **Create a Cloud Storage Bucket**: Exports are saved to a Google Cloud Storage bucket.
- **Set Permissions**: Grant Firestore the necessary permissions to write to the bucket.
- **Run the Export**: You can run exports manually or schedule them using the `gcloud` command-line tool.

**Example command to export your database:**

```bash
gcloud firestore export gs://<your-bucket-name> --project=<your-firebase-project-id>
```

For detailed, step-by-step instructions, follow the official Firebase documentation on **[Exporting and Importing Data](https://firebase.google.com/docs/firestore/manage-data/export-import)**. Scheduling regular backups (e.g., daily or weekly) is highly recommended for production applications.

---

### **IMPORTANT: Security Note on API Keys**

It is **critical** that you never commit API keys directly into your git repository. If you have ever accidentally committed a file with a key (even if you removed it in a later commit), you **must** revoke that key immediately and generate a new one. The old key is still present in your git history and can be found by malicious actors.

Follow GitHub's official guide on [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) to scrub the key from your history permanently.
