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
- `.env.local`: For local environment variables.
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

Create a `.env.local` file in the root of your project to store your environment variables. This file is for local development and should not be committed to version control.

```
# .env.local
GEMINI_API_KEY=your_google_ai_studio_api_key
```

- **`GEMINI_API_KEY`**: This is required for the AI features to work. You can obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

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

- **Firestore Database**: The application uses Firestore to store all data. Make sure your Firebase project has Firestore enabled.
- **Security Rules**: **This is a critical step.** You must configure Firestore Security Rules to secure your data. Go to your Firebase project -> Firestore Database -> Rules and paste the following:

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
