# Agentic Threat Modeling & Security Studio

> **Enterprise-Grade Agentic Threat Modeling, OWASP LLM Security Auditor, Resilient Gemini Fallback Ladder, and Cloud Run Compliance Deployment Suite.**

---

## 1. Prerequisites & GCP API Enablement

Ensure you have the Google Cloud SDK (`gcloud` CLI) installed and authenticated:

```bash
# 1. Authenticate with Google Cloud
gcloud auth login

# 2. Select target GCP project
gcloud config set project YOUR_GCP_PROJECT_ID

# 3. Enable necessary Google Cloud services
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Secret Manager Provisioning & IAM Bindings

Zero hardcoded credentials in codebase or git repositories:

```bash
# Create the secret in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# Populate the secret value securely from stdin
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Retrieve your GCP Project Number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant the Cloud Run default runtime service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Secure Firestore Database & Owner-Bound Security Rules

Provision Firestore in Native Mode:

```bash
gcloud firestore databases create --location=us-central1 --type=firestore-native
```

Deploy the owner-bound security rules (`firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Owner-bound personal interactions and user data isolation
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User profile documents
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Default deny for all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Google Cloud Run Deployment

Deploy the containerized full-stack application to Cloud Run with Secret Manager mounting:

```bash
gcloud run deploy agentic-threat-modeling-studio \
  --source . \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production"
```

---

## 5. Mandatory Campaign Verification Labeling

Apply the mandatory challenge verification label to register your Cloud Run service:

```bash
gcloud run services update agentic-threat-modeling-studio \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

Verify the label is actively bound:
```bash
gcloud run services describe agentic-threat-modeling-studio \
  --region=us-central1 \
  --format="value(metadata.labels)"
```

---

## 6. Architecture & Resilient Gemini Fallback Ladder

The backend service enforces an automated 4-tier model fallback ladder across all LLM interactions:
1. **Primary**: `gemini-3.6-flash` (Balanced latency and intelligence)
2. **High-Availability Fallback**: `gemini-3.1-flash-lite` (Ultra-low latency instant failover)
3. **Dynamic Stable Alias**: `gemini-flash-latest` (Continuous platform-managed alias)
4. **Deep Reasoning Fallback**: `gemini-3.7-flash` (Deep analytical reasoning)

### Server Payload Robustness
- **Top-Level Middleware**: `express.json({ limit: '10mb' })` mounted upstream of all routes.
- **Defensive Deserialization**: Null-safe destructuring with fallback defaults on every endpoint.
- **Strict Undefined-Stripping**: Zero-crash object sanitization preventing database driver errors.
- **Guaranteed Transaction Verification**: Preserves form buffers and displays retry banners on interrupted writes.

---

## 7. Security Standards Compliance

- **OWASP Top 10 for LLM Applications**: Mitigates Prompt Injection (LLM01), Sensitive Info Disclosure (LLM02), Insecure Output Handling (LLM05), and Excessive Agency (LLM06).
- **OWASP Web Top 10**: Mitigates Broken Access Control (A01), Injection (A03), and Security Misconfigurations (A05).
- **Zero Insecure Defaults**: Prohibits open wildcards (`allow read, write: if true;`).
