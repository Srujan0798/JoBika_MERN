# 🚀 Deploy Frontend to Vercel

Since you want to deploy the frontend separately to Vercel, follow these steps:

## 1. Install Vercel CLI (Optional)
If you have Node.js installed, run:
```bash
npm i -g vercel
```

## 2. Deploy
Run this command in your terminal (root directory):
```bash
vercel
```

## 3. Configuration
- **Set up and deploy?** [Y/n]: `y`
- **Which scope?** [Select your account]
- **Link to existing project?** [N]: `n`
- **Project Name**: `jobika-frontend`
- **In which directory is your code located?**: `./` (Keep default)
- **Want to modify these settings?** [y/N]: `n`

## 4. Environment Variables (On Vercel Dashboard)
After deployment, go to the Vercel Dashboard for your project -> Settings -> Environment Variables.
Add:
- `API_URL`: `https://jobika-pern.onrender.com/api`

## 5. Update Backend CORS
I have already configured the backend to allow requests from Vercel.
If you get CORS errors, add your Vercel URL to the `CLIENT_URL` environment variable on Render.

---

**Note**: I added a `vercel.json` file to automatically configure Vercel to serve the `app/` directory correctly.
