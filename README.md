# One-Stop Personalized Career & Education Advisor

This project is a web and mobile-responsive application designed to help students discover personalized career and education paths based on their aptitude, interests, and profile. It caters to SIH Problem Statement 25094 (Govt of J&K, Smart Education theme).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Development Plan](#development-plan)
- [Setup Instructions](#setup-instructions)
- [Firebase Configuration](#firebase-configuration)
- [Project Structure](#project-structure)
- [Future Extensions](#future-extensions)

## Features

### Core Requirements (MVP)

1.  **User Authentication & Profiles**
    *   Student registration with name, age, gender, class (10/12), location, preferences.
    *   Firebase Authentication for secure login.
    *   Firestore for storing user profiles with personalization fields (encrypted at rest by Firestore).

2.  **Multilingual Support**
    *   English and Hindi language options (extendable).
    *   Implemented using `i18next` in React for seamless localization.

3.  **Aptitude & Interest Quiz**
    *   10-15 static multiple-choice questions.
    *   Rule-based scoring mechanism to recommend streams (Science, Arts, Commerce).
    *   Results visualized using `Chart.js` bar charts.

4.  **Personalized Recommendations Engine**
    *   Generates suggestions for courses, degrees, and colleges based on quiz results and user profile.
    *   Simple rule-based logic (e.g., if Science score > 70% → recommend B.Sc.).
    *   Uses a mock JSON dataset for courses, degrees, and colleges.

5.  **Course-to-Career Mapping**
    *   Displays potential higher studies, job roles, relevant exams, and career trajectories for selected degrees.
    *   Utilizes a mock JSON dataset of 3-5 degrees.
    *   Presented using an accordion UI for better readability.

6.  **Nearby Government Colleges Directory**
    *   Browse a mock JSON dataset of 15-20 government colleges (name, location, courses, eligibility, facilities).
    *   Search and filter functionalities (e.g., by course or region).
    *   Integrated `Leaflet.js` map for visualizing college locations.

7.  **Parent/Guardian Portal**
    *   Students can generate a unique invite code.
    *   Parents/Guardians can log in using the invite code to access a simplified, view-only dashboard.
    *   Dashboard shows quiz results, recommendations, and resources for their child.

8.  **Basic UI/Navigation**
    *   Mobile-first responsive UI built with React and Tailwind CSS.
    *   Dashboard-based navigation: Profile | Quiz | Recommendations | Colleges | Careers | Parent Portal | Logout.

## Tech Stack

*   **Frontend**: React.js, Tailwind CSS, i18next, Chart.js, Leaflet.js, React-Router-Dom, Firebase SDK (client-side)
*   **Backend/Database**: Firebase Authentication (for user auth), Firestore (for user profiles, invites), Mock JSON (for quiz questions, colleges, degrees)
*   **Deployment**: Firebase Hosting (recommended)
*   **Security**: Firestore Rules for data access control (student/guardian separation).

## Development Plan

*   **Week 1**: Set up Firebase, Auth, and multilingual UI. (Completed)
*   **Week 2**: Implement quiz + scoring logic with results visualization. (Completed)
*   **Week 3**: Add recommendations engine, course-to-career mapping, colleges directory. (Completed)
*   **Week 4**: Parent portal, basic navigation, polish UI, deploy to Firebase Hosting. (Parent Portal completed, remaining: polish UI, deploy)

## Setup Instructions

Follow these steps to set up and run the project locally:

### 1. Clone the repository

```bash
git clone <repository-url>
cd career-advisor-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Configuration

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Authentication**: In your Firebase project, navigate to "Authentication" and enable "Email/Password" sign-in method.
3.  **Enable Firestore**: Navigate to "Firestore Database" and create a new database. Start in production mode and set up the `firestore.rules` as provided in this repository.
4.  **Get Firebase Config**: In your Firebase project settings, find your web app's configuration object. It will look something like this:

    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```
5.  **Update `src/firebase.js`**: Open `src/firebase.js` and replace the placeholder values with your actual Firebase configuration.

    ```javascript
    // src/firebase.js
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY", // <--- Replace this
      authDomain: "YOUR_AUTH_DOMAIN", // <--- Replace this
      projectId: "YOUR_PROJECT_ID", // <--- Replace this
      storageBucket: "YOUR_STORAGE_BUCKET", // <--- Replace this
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- Replace this
      appId: "YOUR_APP_ID" // <--- Replace this
    };
    ```

### 4. Run the Application

```bash
npm start
# or
yarn start
```

This will start the development server, and you can view the application in your browser at `http://localhost:3000`.

## Project Structure

```
.github/
public/
├── locales/
│   ├── en/        # English translations
│   │   └── translation.json
│   └── hi/        # Hindi translations
│       └── translation.json
├── index.html   # Main HTML file
├── favicon.ico
└── manifest.json
src/
├── components/
│   ├── Auth/      # Authentication components (Login, Register)
│   │   ├── Login.js
│   │   └── Register.js
│   ├── Careers/   # Course-to-Career Mapping
│   │   └── Careers.js
│   ├── Colleges/  # Nearby Government Colleges Directory
│   │   └── Colleges.js
│   ├── Parent/    # Parent/Guardian Portal components
│   │   ├── InviteGenerator.js
│   │   └── ParentDashboard.js
│   ├── Quiz/      # Aptitude & Interest Quiz components
│   │   ├── Quiz.js
│   │   └── QuizResults.js
│   ├── Recommendations/ # Personalized Recommendations Engine
│   │   └── Recommendations.js
│   ├── User/      # User Profile components
│   │   └── Profile.js
│   └── Navbar.js  # Global Navigation Bar
├── data/          # Mock JSON datasets
│   ├── colleges.json
│   ├── degrees.json
│   └── quizQuestions.json
├── App.js         # Main application component with routing
├── index.js       # React entry point
├── firebase.js    # Firebase initialization and exports
├── i18n.js        # i18next configuration
├── index.css      # Tailwind CSS imports and global styles
├── App.css        # Application-specific styles (can be integrated into Tailwind)
├── reportWebVitals.js # Web Vitals reporting
└── setupTests.js    # Jest setup for testing
firestore.rules    # Firestore security rules
package.json       # Project dependencies and scripts
postcss.config.js  # PostCSS configuration for Tailwind CSS
tailwind.config.js # Tailwind CSS configuration
.gitignore         # Files and directories to ignore in Git
```

## Future Extensions (post MVP)

*   **Timeline Tracker**: Integrate scholarship and admission alerts.
*   **Conversational FAQ Chatbot**: Develop a chatbot, upgradeable to an AI mentor using OpenAI API.
*   **Hyperlocal Opportunity Mapping**: Enhance college directory with GeoJSON and Leaflet for detailed local opportunities.
*   **Alumni Career Outcome Visualization**: Implement data analytics with FastAPI for alumni career insights.

---

**Note**: This project uses placeholder data for quizzes, recommendations, colleges, and degrees. In a production environment, this data would typically be managed through a more robust backend or content management system. Data security for user profiles is handled by Firebase Firestore's built-in encryption and access rules.

