# Volunteer Management Application

This is a Next.js application designed to help organizations manage volunteers, track their hours, and engage with them effectively. It uses Firebase for the backend database (Firestore) and Genkit for AI-powered features.

## Project Structure

- `src/app/`: Contains all the pages and routes for the Next.js application.
- `src/components/`: Shared React components used across the application.
- `src/lib/`: Core application logic and utilities.
  - `firebase.ts`: Firebase SDK initialization and configuration.
  - `firestore.ts`: All interaction logic with the Firestore database.
- `src/ai/`: Contains all the Genkit AI flows for features like motivational summaries.
- `public/`: Static assets.
- `.env.local`: For local environment variables. **This file is not in Git.**
- `apphosting.yaml`: Configuration for Firebase App Hosting.

---

## Local Development

Follow these steps to set up and run the application on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repository-url>
cd <your-repository-name>
npm install
```

### 3. Environment Variables

For security, API keys and other secrets are not stored in the main codebase. You must create a local environment file to run the application.

1.  **Create the file**: In the root of the project, find the file named `.env`. Make a copy of this file and rename the copy to `.env.local`.

    ```bash
    cp .env .env.local
    ```

2.  **Edit the file**: Open your new `.env.local` file in a text editor. You will see the following content:

    ```
    # .env.local

    # Get this from the Google AI Studio
    GEMINI_API_KEY="your_google_ai_studio_api_key"

    # Get these from your Firebase project settings
    # (Firebase Console > Project Settings > General > Your apps > SDK setup and configuration)
    NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your_firebase_app_id"
    ```

3.  **Fill in the values**:
    *   **`GEMINI_API_KEY`**: This is required for the AI features. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **Firebase Keys**: These are required to connect to your Firebase backend. You can find these in your **Firebase Console** under **Project Settings** > **General** > **Your apps**. Select your web app, and you'll see the configuration values. All Firebase keys meant for the browser **must** be prefixed with `NEXT_PUBLIC_`.

### 4. Running the Development Server

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the Next.js development server, typically on `http://localhost:9002`.

---

## Production Configuration

### 1. Firebase Project Setup

This application is configured to use Firebase. The configuration is located in `src/lib/firebase.ts`.

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
      allow write: if request.auth != null; // Only authenticated users can write
    }

    // Volunteers can read their own data and public-facing profiles
    match /volunteers/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || resource.data.privacySettings.showProfile == true);
      allow update: if request.auth != null && request.auth.uid == userId;
      allow create, delete: if request.auth != null && get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.isAdmin == true; // Only admins can create/delete
    }

    // Admins can read all volunteer data
    match /volunteers/{userId} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.isAdmin == true;
    }

    // Transactions can only be created by authenticated users
    // and can be read by the involved volunteer or an admin
    match /transactions/{transactionId} {
        allow read: if request.auth != null && (request.auth.uid == resource.data.volunteerId || get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.isAdmin == true);
        allow create: if request.auth != null;
        allow update, delete: if false; // Transactions are immutable
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
