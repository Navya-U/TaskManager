# Task Manager

## Overview
Task Manager is a responsive web application built using **React, TypeScript, and Firebase**. It helps users efficiently manage tasks using **List View** and **Board View** (Kanban-style). Users can create, edit, delete, and organize tasks into different categories and statuses.

## Features
- **User Authentication:** Secure login and sign-up using Firebase Authentication.
- **Task Management:** Create, edit, delete, and update task status.
- **Board/List View Toggle:** Switch between Kanban-style board and list view.
- **Batch Actions:** Delete multiple tasks or mark them as completed.
- **Task Categories:** Categorize tasks as Work or Personal.
- **Activity Log:** Track task modifications.
- **File Attachments:** Upload and store files using Firebase Storage.
- **Responsive Design:** Fully optimized for desktop and mobile devices.

## Tech Stack
- **Frontend:** React, TypeScript, ReactStrap
- **Backend:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **Hosting:** Netlify

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/Navya-U/TaskManager.git
   cd task-manager
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```sh
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

4. Start the development server:
   ```sh
   npm start
   ```

## Deployment
- **Netlify:**
  1. Push your code to GitHub.
  2. Connect GitHub repository to Netlify.
  3. Add environment variables in Netlify settings.
  4. Deploy!

## Contributing
If you would like to contribute, feel free to submit a pull request. Open issues for bugs and feature requests.
