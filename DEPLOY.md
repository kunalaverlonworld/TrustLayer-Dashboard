# Deploying TrustLayer to Render

This repository is configured to deploy both the frontend and backend services to [Render](https://render.com) using Render's Infrastructure-as-Code Blueprint spec (`render.yaml`).

Follow these step-by-step instructions to get your application live.

---

## Prerequisites

1. A **Render** account. Register/login at [dashboard.render.com](https://dashboard.render.com).
2. A **MongoDB Atlas** database URI. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) if you don't already have one.
3. A Git repository on **GitHub** or **GitLab** containing your copy of this project.

---

## Deployment Steps

### Step 1: Push Code to GitHub / GitLab
Make sure all your local changes (including `render.yaml`) are committed and pushed to your remote repository:
```bash
git add .
git commit -m "Configure deployment for Render"
git push origin main
```

### Step 2: Create a Blueprint Instance on Render
1. Go to the [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button in the top right and select **Blueprint**.
3. Connect your GitHub or GitLab account and select your repository containing this project.
4. Give your Blueprint group a name (e.g., `trustlayer-app`).
5. Render will automatically parse the `render.yaml` file and prepare two services:
   - `trustlayer-backend` (Web Service)
   - `trustlayer-frontend` (Static Site)

### Step 3: Configure Environment Variables
During setup on Render, you will be prompted to input key configuration values:

1. **`MONGO_URI`** (under backend service):
   - Enter your MongoDB Atlas connection string (e.g., `mongodb+srv://username:password@cluster...`).
2. **`JWT_SECRET`**:
   - Render will generate this automatically.
3. **`FRONTEND_URL`** (under backend service):
   - Enter the public URL that your frontend static site will run on. If you do not know it yet, you can leave it blank or put a placeholder (like `https://placeholder.onrender.com`) and update it in Step 4.
4. **`VITE_API_BASE_URL`** (under frontend service):
   - Enter the public URL that your backend service will run on (e.g., `https://trustlayer-backend.onrender.com`).
5. **`RESEND_API_KEY`** (optional):
   - If you want email alerts to work, paste your Resend API key here.

Click **Apply** to trigger the deployment.

---

### Step 4: Link Frontend and Backend URLs (Post-Deployment)
Since Render allocates URLs dynamically, you will need to link the services together once their URLs are created:

1. Once the backend deployment finishes, copy the backend service URL from the top of its page (e.g., `https://trustlayer-backend.onrender.com`).
2. Once the frontend deployment finishes, copy the frontend static site URL (e.g., `https://trustlayer-frontend.onrender.com`).
3. **Update Backend CORS**:
   - Go to your backend service -> **Environment**.
   - Set `FRONTEND_URL` to your frontend static site URL.
4. **Update Frontend API Client**:
   - Go to your frontend service -> **Environment**.
   - Set `VITE_API_BASE_URL` to your backend service URL.
5. Click **Save Changes** on both services. Render will automatically rebuild/redeploy them to apply the new URLs.

---

## Architecture Overview

- **Frontend**: A React/Vite Single Page Application (SPA). Render hosts this on a global CDN (`runtime: static`). The SPA rewrite rule redirects all traffic back to `index.html` so client-side routing works.
- **Backend**: A Node/Express API (`runtime: node`). It connects to MongoDB Atlas and listens on `PORT: 5000` (mapped dynamically by Render).
