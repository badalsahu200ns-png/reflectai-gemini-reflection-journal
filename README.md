# ReflectAI – Gemini Reflection Journal

ReflectAI is an AI-powered personal reflection journal built with **Google AI Studio, Gemini, and Google Cloud Run**.

It allows authenticated users to create journal entries and receive AI-powered reflection insights.

## Live Application

**ReflectAI – Gemini Reflection Journal**

https://ai.studio/apps/63a3194c-c56e-4f29-bd42-92c02a3f09cb

## Features

* Google single sign-on authentication
* Personal journal entries
* Create, view, edit, and delete entries
* Gemini-powered AI reflection
* Mood and theme analysis
* Personalized reflection insights
* Reflection analytics
* Location-aware journal entries
* Google Maps integration
* Role-based access control
* Admin functionality
* Secure user-specific data access
* Error handling and input validation

> Remove any feature above that is not actually implemented in the deployed application.

## Technology Stack

* **Google AI Studio** – Application development
* **Gemini** – AI-powered reflection and analysis
* **Google Cloud Run** – Cloud deployment
* **Google Maps Platform** – Location functionality
* **GitHub** – Source-code management
* **Google Authentication** – User authentication

## Architecture

```text
User
 │
 ▼
Google Authentication
 │
 ▼
ReflectAI
 │
 ├── Journal
 │
 ├── Gemini AI
 │     ├── Reflection
 │     ├── Mood Analysis
 │     └── Theme Analysis
 │
 ├── Analytics
 │
 ├── Google Maps
 │
 └── Admin / RBAC
 │
 ▼
Google Cloud Run
```

## AI Capabilities

ReflectAI uses Gemini to analyze journal entries and generate:

* Reflection summaries
* Mood insights
* Common themes
* Key observations
* Follow-up reflection questions
* Personalized insights

Custom instructions in Google AI Studio are used to guide the AI's behavior and application-specific responses.

## Security

Security was considered as part of the application design.

Key practices include:

* Authenticated access to protected features
* User-specific data access
* Server-side authorization
* Role-based access control
* Protected administrative functionality
* Environment-based secret management
* No production API keys committed to GitHub
* Input validation
* Error handling

Sensitive files and credentials should not be committed to the repository.

## Deployment

ReflectAI is deployed using **Google Cloud Run**.

```text
Google AI Studio
       │
       ▼
   Source Code
       │
       ▼
     GitHub
       │
       ▼
   Cloud Run
       │
       ▼
   ReflectAI
```

## Repository

**GitHub:**

https://github.com/YOUR_USERNAME/reflectai-gemini-reflection-journal

Replace `YOUR_USERNAME` with your GitHub username.

## Challenge

Built as part of the **Build a User-Authenticated AI Application with Custom Instructions on Google AI Studio & Cloud Run** challenge.

**#AccelerateAIwithCloudRun**

## Author

**Badal Kumar Sahu**

Business Analytics | AI Strategy | Product & Technology

Email: **[badalsahu200ns@gmail.com](mailto:badalsahu200ns@gmail.com)**

## License

This project is created for educational, portfolio, and challenge showcase purposes.
