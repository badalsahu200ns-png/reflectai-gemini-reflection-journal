# ReflectAI – Gemini Reflection Journal & Threat-Aware Cognitive Space

 **ReflectAI** is an AI-powered personal reflection journal and cognitive growth workspace built with **Google AI Studio, Gemini, Firebase Firestore, Google Maps Platform, and Google Cloud Run**. It combines personalized AI reflection, long-term journal memory, multimodal journaling, sentiment analytics, and security-first cloud architecture to help users understand their experiences and discover meaningful patterns over time.

---

## 🌐 Live Application

**Production / Public Application**

https://reflection-journal-by-badal-200ns.ai.studio

**Application Identifier**

`63a3194c-c56e-4f29-bd42-92c02a3f09cb`

**Target Deployment Platform**

Google Cloud Run with a containerized Node.js + Express + React application.

> **Note:** The public AI Studio URL above is the application's accessible web endpoint. A separate `run.app` URL can be added here after the application is deployed directly as a Cloud Run service.

---

# 📑 Table of Contents

1. [Project Overview](#-1-project-overview)
2. [Key Product Capabilities](#-2-key-product-capabilities)
3. [Full-Stack Architecture](#-3-full-stack-architecture)
4. [Google SSO & Authentication](#-4-google-sso--authentication)
5. [Gemini AI & User-Scoped RAG](#-5-gemini-ai--user-scoped-rag)
6. [AI Reflection Personas](#-6-ai-reflection-personas)
7. [Multimodal Journaling](#-7-multimodal-journaling)
8. [Firestore Database Structure](#-8-firestore-database-structure)
9. [Firestore Security Rules](#-9-firestore-security-rules)
10. [Google Maps & Location-Aware Journaling](#-10-google-maps--location-aware-journaling)
11. [External Notifications](#-11-external-notifications)
12. [Environment & Secret Management](#-12-environment--secret-management)
13. [Deployment](#-13-deployment)
14. [Security & Threat Modeling](#-14-security--threat-modeling)
15. [Feature Matrix](#-15-feature-matrix)
16. [Evaluation Criteria](#-16-evaluation-criteria)
17. [UI Walkthrough](#-17-ui-walkthrough)
18. [Project Structure](#-18-project-structure)
19. [Local Development](#-19-local-development)
20. [Testing & Verification](#-20-testing--verification)
21. [Privacy & Data Ownership](#-21-privacy--data-ownership)
22. [Author & Acknowledgments](#-22-author--acknowledgments)
23. [License](#-23-license)

---

# 📖 1. Project Overview

ReflectAI transforms traditional journaling into an interactive, memory-aware reflection experience.

Instead of treating each journal entry as an isolated piece of text, ReflectAI uses **Google Gemini** and user-scoped retrieval to connect current reflections with relevant historical entries.

The result is a system that can:

* generate personalized reflections
* ask context-aware follow-up questions
* identify recurring themes
* analyze mood and sentiment trends
* retrieve relevant past experiences
* support text, voice, image, OCR, and location-based entries
* provide weekly and monthly reflections
* allow users to ask questions about their own journal
* give users control over memory, export, deletion, and integrations

ReflectAI is designed around three principles:

### Reflect

Write naturally and receive thoughtful AI-assisted reflection.

### Remember

Relevant historical context can be retrieved to make responses more personal.

### Discover

Long-term analytics surface recurring themes, mood patterns, and changes over time.

---

# ✨ 2. Key Product Capabilities

### Personal AI Reflection

Gemini analyzes the current journal entry and generates structured reflection based on the user's selected reflection style.

### Long-Term Personal Memory

Relevant information from previous entries can be retrieved to provide historical context.

### Ask My Journal

Users can ask natural-language questions about their own journal and receive answers grounded in retrieved journal evidence.

### Pattern Recognition

Weekly and monthly analyses identify recurring themes, mood trends, and meaningful changes over time.

### Multimodal Journaling

Users can journal using:

* Text
* Voice transcription
* Photo attachments
* Handwritten-page scanning
* Optional location context

### AI Reflection Personas

Users can choose different reflection approaches, including:

* Socratic
* Stoic
* CBT-style
* Mindful
* Strategic
* Creative

### Privacy Controls

Users can manage:

* AI memory
* notifications
* exports
* integrations
* journal deletion
* memory deletion

### External Notifications

Optional notifications can be delivered through:

* In-app notifications
* Email
* Slack
* Discord

Notifications are opt-in and designed to minimize exposure of private journal content.

---

# 🏗️ 3. Full-Stack Architecture

ReflectAI uses a React + Express + Google Cloud architecture.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER                                  │
│ React 18 • TypeScript • Vite • Tailwind CSS • Recharts • Lucide Icons │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    │ Google Sign-In                  │ REST / API
                    ▼                                 ▼
┌───────────────────────────────┐      ┌─────────────────────────────────┐
│ Firebase Authentication      │      │ Express / Node.js Backend       │
│ Google Identity / OAuth      │      │ Cloud Run Service               │
└───────────────┬───────────────┘      └───────────────┬─────────────────┘
                │                                      │
                │ Verified Identity                    │
                ▼                                      ▼
┌───────────────────────────────┐      ┌─────────────────────────────────┐
│ Firebase / Cloud Firestore   │      │ Google Gemini AI                │
│ User-scoped journal data     │      │ Reflection • RAG • OCR • AI    │
└───────────────┬───────────────┘      └───────────────┬─────────────────┘
                │                                      │
                └──────────────────┬───────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       GOOGLE CLOUD INFRASTRUCTURE                       │
│ Cloud Run • Secret Manager • Cloud Build • Artifact Registry            │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Technologies

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* Recharts
* Lucide React
* Motion / animation components

### Backend

* Node.js
* Express.js
* TypeScript
* Google Gemini API
* Server-side API integrations

### Data

* Firebase Authentication
* Cloud Firestore
* Firebase Storage, where required for media

### Google Cloud

* Cloud Run
* Secret Manager
* Cloud Build
* Artifact Registry
* Google Maps Platform

---

# 🔐 4. Google SSO, Gmail OTP 2FA & 7-Day Reflection Experience

ReflectAI implements a **two-tier authentication system** pairing Firebase Google OAuth with a secondary server-verified **Gmail OTP (Two-Factor Authentication)** security gate, ensuring complete protection of private reflections.

## Authentication Flow

```text
User opens application
        ↓
Secure Login Page (with 7-Day Dynamic Reflection Quote)
        ↓
Continue with Google (Firebase OAuth)
        ↓
Google Authentication Successful
        ↓
Send single-use 6-digit OTP to user's verified Gmail address
        ↓
OTP Verification Screen (Auto-focus, paste, 5-min TTL, rate-limiting)
        ↓
OTP Verified Successfully via HMAC-SHA256 Signed Session Token
        ↓
Create / Load User Profile in Firestore
        ↓
Grant Application Access & Open ReflectAI Dashboard
```

## Dynamic 7-Day Reflection Quote Experience

The login interface features a deterministic, calendar-based **7-Day Reflection Quote Experience** that cycles seamlessly across seven foundational reflection mindsets:
- **Day 1 · PAUSE**: *“Before you change your life, take a moment to notice the life you are already living.”*
- **Day 2 · REMEMBER**: *“Your past is not just where you have been; it is evidence of how far you have come.”*
- **Day 3 · NOTICE**: *“Patterns often whisper before they become impossible to ignore.”*
- **Day 4 · UNDERSTAND**: *“Sometimes clarity begins with asking yourself a better question.”*
- **Day 5 · LEARN**: *“Every experience leaves something behind. Reflection helps you discover what it taught you.”*
- **Day 6 · GROW**: *“Growth is not always becoming someone new; sometimes it is finally understanding who you already are.”*
- **Day 7 · BEGIN**: *“You do not need to have your whole future figured out. You only need to understand your next step.”*

## Secure Logout & Temporary Data Wipe Utility

The `AuthContext` provides a comprehensive `secureLogout` / `signOut` utility that:
1. Revokes the active Firebase Authentication session via `signOut(auth)`.
2. Clears all session tokens and temporary draft memory across `sessionStorage` and `localStorage` (including `reflectai_session_token_*`, `draft_*`, etc.).
3. Resets all React authentication states (`user`, `pendingUser`, `firebaseUser`, `otpState`).
4. Re-locks the application and immediately redirects the user to the Login page.

## Security Architecture Guarantees

* **Zero Password Exposure**: Relies strictly on Google Federated Identity and one-time ephemeral codes.
* **Brute-Force & Rate-Limiting Defense**: Maximum 5 attempts allowed per challenge with automated IP/UID rate limiting.
* **Cryptographic Token Verification**: Session tokens are signed using HMAC-SHA256 with 24-hour expiration.
* **Isolated User Scope**: Application and Firestore remains completely inaccessible until both Google OAuth and OTP verification succeed.

---

# 🧠 5. Gemini AI & User-Scoped RAG

ReflectAI uses Gemini for personalized journal analysis and reflection.

## User-Scoped Retrieval

When the user requests a reflection or asks a question about previous entries, the application can retrieve relevant historical context from the authenticated user's own journal.

Conceptually:

```text
Current Entry / User Question
            ↓
Retrieve Relevant Historical Context
            ↓
Retrieve Relevant AI Memories
            ↓
Build Limited Context
            ↓
Gemini
            ↓
Personalized Response
```

The system should retrieve only information the current user is authorized to access.

## RAG Use Cases

### Current Reflection

The model can reference relevant historical entries when generating a new reflection.

### Ask My Journal

The system retrieves relevant journal entries before generating the response.

### Pattern Detection

Historical entries can be analyzed to identify recurring themes and changes.

### Weekly / Monthly Summaries

Relevant entries are aggregated into structured summaries.

## Evidence-Based Responses

When historical evidence is available, ReflectAI can display source entries or dates used to support an insight.

If insufficient information exists, the application should avoid fabricating historical context.

---

# 🎭 6. AI Reflection Personas

ReflectAI supports multiple reflection styles.

### Socratic Coach

Focuses on questions, assumptions, reasoning, and self-discovery.

### Stoic Philosopher

Emphasizes control, perspective, values, and practical reflection.

### CBT-Style Reflector

Can help identify patterns in thoughts and assumptions without presenting itself as a medical or mental-health professional.

### Mindful Guide

Focuses on present-moment awareness, acceptance, and observation.

### Executive Strategist

Connects reflection to decisions, goals, priorities, and practical next steps.

### Creative Muse

Encourages metaphorical thinking, creativity, alternative perspectives, and exploration.

> These modes are reflection styles and are not substitutes for professional medical, psychological, or mental-health services.

---

# 📷 7. Multimodal Journaling

ReflectAI supports multiple ways to capture reflections.

## Text Journaling

Users can:

* create entries
* edit entries
* add titles
* add moods
* add tags
* save drafts
* favorite entries

## Voice Journaling

Users can speak instead of typing.

Flow:

```text
Record Voice
     ↓
Speech-to-Text
     ↓
Editable Transcript
     ↓
User Confirmation
     ↓
Journal Entry
```

Voice input should gracefully handle:

* microphone denial
* unsupported browsers
* empty recordings
* transcription failure

## Photo Attachments

Users can attach photos to journal entries.

Examples:

* personal moments
* travel experiences
* notes
* screenshots
* visual memories

Media files should be protected by authenticated access controls.

## Handwritten Journal OCR

Users can upload or capture handwritten pages.

Flow:

```text
Handwritten Image
       ↓
OCR / Gemini Vision
       ↓
Extracted Text
       ↓
User Review
       ↓
Create / Append Entry
```

OCR output must remain editable before saving.

---

# 🗄️ 8. Firestore Database Structure

User-specific data is organized under authenticated user IDs.

```text
/databases/(default)/documents

├── users/{userId}
│   ├── entries/{entryId}
│   ├── memories/{memoryId}
│   ├── weeklySummaries/{summaryId}
│   ├── monthlySummaries/{summaryId}
│   ├── preferences/{preferenceId}
│   ├── integrations/{integrationId}
│   ├── notifications/{notificationId}
│   ├── notificationLogs/{logId}
│   └── insights/{insightId}
│
└── auditLogs/{logId}
```

## Journal Entry Example

```json
{
  "id": "entry-uuid-1234",
  "userId": "firebase-auth-uid",
  "title": "Reflection on Architecture Decisions",
  "category": "Career & Growth",
  "mood": "Focused",
  "tags": [
    "cloud-run",
    "gemini",
    "architecture"
  ],
  "content": "Worked through the service fallback design today...",
  "summary": {
    "keyTakeaways": [
      "Improved backend structure",
      "Validated fallback behavior"
    ],
    "actionItems": [
      "Complete security verification"
    ]
  },
  "moodAnalysis": {
    "primaryMood": "Focused",
    "sentimentScore": 0.85,
    "energyLevel": 0.75
  },
  "location": {
    "name": "Example Location",
    "lat": 0,
    "lng": 0,
    "address": "Example Address"
  },
  "createdAt": "2026-08-27T01:00:00Z",
  "updatedAt": "2026-08-27T01:10:00Z",
  "isPinned": false,
  "wordCount": 342
}
```

> Location data is optional and should only exist when the user intentionally attaches it.

---

# 🛡️ 9. Firestore Security Rules

ReflectAI follows a **default-deny, user-scoped security model**. All interactions, reflections, and sensitive journal collections are strictly isolated by the user's authenticated UID (`request.auth.uid == userId`).

### Core Campaign Security Rule Block
The exact rules block supporting user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Full Production Rules (`firestore.rules`)
ReflectAI's complete deployed security policy enforcing user data isolation, subcollection protection, immutable audit trails, and default-deny:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Owner-bound user journal entries and reflection documents
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 2. Owner-bound personal AI memories & extracted knowledge
    match /users/{userId}/memories/{memoryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 3. Owner-bound personal weekly summaries and analytics
    match /users/{userId}/weeklySummaries/{summaryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 4. Owner-bound personal monthly summaries
    match /users/{userId}/monthlySummaries/{summaryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 5. Owner-bound notification & theme settings & preferences & integrations
    match /users/{userId}/settings/{settingId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/preferences/{prefId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/integrations/{integrationId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/notificationLogs/{logId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/notifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 6. Owner-bound cached insights
    match /users/{userId}/insights/{insightId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 7. Owner-bound personal interactions and chat history (Campaign Verification)
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 8. User profile documents
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 9. Audit logs: Authenticated users can create audit events, read requires authenticated access
    match /auditLogs/{logId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update, delete: if false; // Immutable audit trail
    }

    // 10. Default Deny: All other unspecified paths are strictly locked
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

> Keep the actual production rules in the repository and test them against unauthorized access attempts. Avoid replacing more restrictive production rules with a simplified example without reviewing your application's exact schema.

## Security Objectives

* Authenticated users can access only their own user-scoped data.
* Unauthenticated users cannot read private journal data.
* Users cannot arbitrarily change their authorization identity.
* Unmatched Firestore paths remain denied by default.
* Audit records can be protected against modification or deletion as required by the application.

---

# 🗺️ 10. Google Maps & Location-Aware Journaling

ReflectAI supports optional location context using the **Google Maps Platform** and browser geolocation capabilities.

## Location Features

Users can:

* search for a location
* select a place
* use current location where permitted
* attach location metadata to an entry
* remove location information later
* view location context for an entry

## Privacy Design

Location is:

* optional
* user-controlled
* private
* removable

Do not request location permission automatically.

Do not implement background location tracking.

Do not send precise coordinates to Gemini unless the user explicitly requests a feature that requires them.

Use the minimum required Maps APIs and secure configuration appropriate to the deployment environment.

---

# 🔔 11. External Notifications

ReflectAI supports optional notifications through:

* In-app notifications
* Email
* Slack
* Discord

## Supported Events

Examples include:

* weekly reflection ready
* monthly reflection ready
* journal goal completed
* selected tag detected
* AI insight generated

## Privacy-First Notification Model

The default notification payload should contain minimal information.

Example:

> **ReflectAI**
> Your weekly reflection is ready.
> **View Reflection →**

Do not automatically send:

* full journal entries
* private AI memories
* precise locations
* uploaded images
* sensitive journal excerpts

Users should explicitly enable external integrations.

## Notification Architecture

```text
Journal / AI Event
       ↓
Notification Service
       ↓
Selected Provider
       ↓
Email / Slack / Discord / In-App
```

Credentials should be managed securely on the backend rather than exposed to the client.

---

# ⚙️ 12. Environment & Secret Management

ReflectAI follows a **server-side secret management model**.

Sensitive credentials must never be committed to source control.

Do not store secrets in:

* GitHub
* README files
* frontend JavaScript bundles
* browser local storage
* client-readable Firestore documents
* committed `.env` files

## Production Secret Management

Production credentials should be managed through **Google Cloud Secret Manager** or an equivalent secure secret-management mechanism.

### Secret Manager Bindings
Execute the following commands to provision and bind your secrets securely for Cloud Run:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Examples of sensitive configuration include:

* Gemini credentials (`GEMINI_API_KEY`)
* external service credentials
* OAuth client secrets where applicable
* notification provider credentials
* service-account credentials

### Public Repository Rule

Never commit actual API keys, access tokens, private keys, webhook URLs, or service-account JSON files to this repository.

Use a local untracked environment configuration for development and secure runtime injection for production.

---

# 🚀 13. Deployment

## Google Cloud Run

Authenticate:

```bash
gcloud auth login
```

Set the project:

```bash
gcloud config set project YOUR_GCP_PROJECT_ID
```

Enable required services:

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

Deploy:

```bash
gcloud run deploy reflect-ai-journal \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port=3000
```

### Required Campaign Verification Labeling
Apply the mandatory challenge resource label to register the Cloud Run service for automated verification:

```bash
gcloud run services update reflect-ai-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

The exact deployment command may vary depending on your project configuration, build system, runtime, and secret bindings.

## Production Verification

After deployment:

1. Open the Cloud Run URL.
2. Test Google Sign-In.
3. Create a journal entry.
4. Verify Firestore persistence.
5. Test AI reflection.
6. Test RAG retrieval.
7. Test Ask My Journal.
8. Test media/location functionality.
9. Verify security rules.
10. Confirm no runtime or client-side secret exposure.

---

# 🔒 14. Security & Threat Modeling

ReflectAI is designed around a threat-aware architecture.

| Threat                 | Risk                                                | Mitigation                                          |
| ---------------------- | --------------------------------------------------- | --------------------------------------------------- |
| Cross-user data access | Unauthorized journal access                         | UID-based user isolation and Firestore rules        |
| API key exposure       | Credentials leaked in browser                       | Server-side secret management                       |
| Prompt injection       | Journal text attempts to manipulate AI instructions | Input boundaries, prompt separation, validation     |
| Webhook leakage        | Private content sent externally                     | Minimal payloads and explicit notification controls |
| Admin escalation       | User attempts to become administrator               | Server-side RBAC / trusted role claims              |
| Storage exposure       | Unauthorized media access                           | Authenticated storage rules and user-scoped paths   |
| Location privacy       | Unwanted location disclosure                        | Optional location, user consent, removal            |
| Notification abuse     | Repeated external messages                          | Event validation, rate limits, controlled retries   |
| Audit tampering        | Operational record modification                     | Restricted write/update/delete permissions          |

## Security Principles

### Least Privilege

Grant services only the permissions they need.

### Defense in Depth

Use authentication, authorization, validation, secure storage, logging, and safe defaults together.

### Privacy by Default

Do not expose personal content to third-party systems unless explicitly required and authorized.

### Fail Safely

An AI or external integration failure should not destroy the user's original journal content.

---

# ✨ 15. Feature Matrix

| Feature              | Status / Capability                    |
| -------------------- | -------------------------------------- |
| Google SSO           | Google Firebase Authentication         |
| Private Journal      | User-scoped Firestore                  |
| AI Reflection        | Gemini                                 |
| Long-Term Memory     | User-scoped retrieval                  |
| Ask My Journal       | Historical journal Q&A                 |
| AI Personas          | Six reflection styles                  |
| Voice Journaling     | Speech-to-text                         |
| Photo Journaling     | Secure media attachments               |
| Handwriting OCR      | Gemini Vision / OCR workflow           |
| Mood Tracking        | Mood and sentiment analysis            |
| Weekly Insights      | AI-generated summaries                 |
| Monthly Insights     | Longitudinal analysis                  |
| Semantic Search      | Journal retrieval                      |
| Google Maps          | Optional location tagging              |
| World Reflection Map | Location visualization                 |
| Notifications        | In-app / Email / Slack / Discord       |
| Privacy Controls     | Memory, export, deletion, integrations |
| Export               | JSON / CSV / PDF                       |
| Admin                | Operational dashboard with RBAC        |
| Security             | Firestore rules + server-side controls |

---

# 🏆 16. Evaluation Criteria

ReflectAI is designed to address four major evaluation areas.

## 1. Authenticity

Unique capabilities include:

* user-scoped RAG
* Ask My Journal
* long-term AI memory
* longitudinal mood and theme analysis
* selectable reflection personas
* multimodal journaling
* privacy-focused external notifications
* location-aware reflection

The application is intended to demonstrate functionality beyond a basic starter journal.

## 2. Usability

The primary workflow is:

```text
Google Sign-In
      ↓
Create Reflection
      ↓
AI Reflection
      ↓
Personal Context
      ↓
Insights
```

The UI should provide clear states for:

* loading
* success
* retry
* permission denial
* external service failure
* empty states

## 3. Stability

The architecture aims to ensure that optional services do not break the core journal.

For example:

* Gemini failure should not prevent saving the journal entry.
* Maps failure should not prevent text journaling.
* Notification failure should not prevent journal creation.
* OCR failure should provide a retry/manual-entry path.
* Voice failure should fall back to typing.

## 4. Security

Security is implemented through:

* Google Authentication
* UID-based data isolation
* Firestore rules
* secure Storage configuration
* server-side API access
* Secret Manager
* validation
* least privilege
* controlled integrations
* role-based admin access

---

# 🖼️ 17. UI Walkthrough

## Landing / Sign-In

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ReflectAI                                      [Continue with Google]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│        Your thoughts. Your memory. Your patterns.                   │
│                                                                     │
│    Write freely, reflect deeply, and discover patterns over time.  │
│                                                                     │
│              ┌────────────────────────────────────────┐             │
│              │ 🔐 Secure by Google Cloud              │             │
│              │                                        │             │
│              │       [ Continue with Google ]          │             │
│              │                                        │             │
│              │ Your journal belongs to your account.   │             │
│              └────────────────────────────────────────┘             │
│                                                                     │
│   Long-Term Memory     Ask My Journal     Pattern Recognition       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Journal Workspace

```text
┌──────────────┬───────────────────────────────────┬──────────────────┐
│ JOURNAL      │ NEW REFLECTION                    │ AI REFLECTION    │
├──────────────┼───────────────────────────────────┼──────────────────┤
│ Today        │ Title                             │ Persona          │
│ Aug 26       │                                   │ [Socratic ▼]     │
│ Aug 25       │ What's on your mind?              │                  │
│ Aug 24       │                                   │ What I Hear      │
│              │                                   │                  │
│              │                                   │ Connected to     │
│              │                                   │ Your History     │
│              │                                   │                  │
│              │ [Voice] [Photo] [Scan] [Location] │ A Question       │
│              │                                   │                  │
│              │             [Save Reflection]     │ Small Next Step  │
└──────────────┴───────────────────────────────────┴──────────────────┘
```

## Ask My Journal

```text
┌──────────────────────────────────────────────────────────────────┐
│ ASK MY JOURNAL                                                    │
│ Search your experiences, memories, and reflections.               │
│                                                                  │
│ [ What would you like to understand about your past?      ] [→] │
│                                                                  │
│ What has been stressing me lately?                               │
│ What goals keep coming up?                                       │
│ What changed this month?                                         │
│                                                                  │
│ REFLECTAI RESPONSE                                                │
│                                                                  │
│ Your journal contains several recent references to...            │
│                                                                  │
│ JOURNAL EVIDENCE                                                  │
│ Aug 21 — Work & Career                                            │
│ Aug 14 — Career Direction                                         │
└──────────────────────────────────────────────────────────────────┘
```

---

# 📁 18. Project Structure

A recommended project structure is:

```text
reflect-ai/
├── src/
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   ├── hooks/
│   ├── services/
│   │   ├── auth/
│   │   ├── firestore/
│   │   ├── gemini/
│   │   ├── rag/
│   │   ├── notifications/
│   │   ├── maps/
│   │   └── media/
│   ├── utils/
│   ├── types/
│   └── App.tsx
│
├── server/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── server.ts
│
├── public/
├── firestore.rules
├── storage.rules
├── package.json
├── tsconfig.json
├── vite.config.ts
├── Dockerfile
├── .gitignore
└── README.md
```

Adjust this structure to match the actual source code rather than creating unnecessary files.

---

# 💻 19. Local Development

## Requirements

Recommended tools:

* Node.js
* npm
* Google Cloud CLI
* Firebase project
* Firestore
* Gemini access
* Google Maps Platform configuration where location features are enabled

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Then open the local development URL shown by the application.

## Production Build

```bash
npm run build
```

## Production Start

```bash
npm run start
```

Do not commit real secrets while configuring local development.

---

# 🧪 20. Testing & Verification

Before submitting or deploying, verify:

## Authentication

* Google login works
* logout works
* protected pages require authentication

## Journal

* create
* read
* update
* delete
* favorite
* autosave/draft behavior where implemented

## AI

* reflection generation
* fallback/error behavior
* persona selection
* RAG retrieval
* Ask My Journal

## Multimodal

* voice transcription
* photo uploads
* OCR
* location selection

## Privacy

* memory controls
* export
* data deletion
* integration disconnect

## Security

Test that:

* User A cannot read User B's entries
* User A cannot read User B's memories
* User A cannot access User B's media
* unauthorized admin access is denied
* unmatched Firestore paths are denied
* private secrets are absent from source control
* client bundles do not contain server-only credentials

## Resilience

Simulate:

* Gemini failure
* Firestore error
* Maps error
* Storage failure
* notification failure
* permission denial
* network interruption

The core journal workflow should remain usable wherever possible.

---

# 🔐 21. Privacy & Data Ownership

ReflectAI is designed around user control.

Users should be able to:

* access their journal
* manage AI memories
* export their information
* remove location information
* disconnect third-party integrations
* delete journal data
* delete AI memories
* disable optional notification channels

## External Processing

Selected journal content may be processed by Gemini when AI-powered features are used.

Third-party services such as Slack, Discord, email, or Google Maps should be used only for features the user intentionally enables or requests.

## Data Minimization

ReflectAI should send only the information required for a specific feature.

External notifications default to minimal payloads rather than full journal content.

---

# 👨‍💻 22. Author & Acknowledgments

**Author:** Badal Kumar Sahu

**Focus:** Business Analytics | AI Strategy | Product & Technology
**Email:** badalsahu200ns@gmail.com
**Built With:**

* Google AI Studio
* Google Gemini
* Firebase Authentication
* Cloud Firestore
* Google Maps Platform
* Google Cloud Run

---

# 📄 23. License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.

---

## ⭐ Project Summary

ReflectAI is designed to demonstrate how generative AI can be combined with secure user-scoped cloud data to create a more personalized journaling experience.

The core product loop is:

```text
WRITE
  ↓
REFLECT
  ↓
REMEMBER
  ↓
DISCOVER
  ↓
ASK
  ↓
UNDERSTAND
```

The application's differentiating principle is simple:

> **Your journal should not forget what you have already written.**

ReflectAI combines personal memory, contextual AI reflection, multimodal capture, longitudinal insights, and privacy-focused cloud architecture into a single reflection workspace.
