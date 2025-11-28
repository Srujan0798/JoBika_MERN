# 🚀 Final Manual Step: Create Render Service

Since the automation couldn't select "Node", please do this manually. It takes 2 minutes.

## 1. Go to Render
Open: https://dashboard.render.com/create?type=web

## 2. Connect Repository
- Select: `Srujan0798/JoBika_PERN`

## 3. Configure Service (Important!)

| Setting | Value |
|---------|-------|
| **Name** | `JoBika_PERN` |
| **Language** | **Node** (Change from Docker!) |
| **Branch** | `main` |
| **Build Command** | `cd server && npm install` |
| **Start Command** | `cd server && npm start` |

## 4. Add Environment Variables
Scroll down to "Environment Variables" and add these 4:

1. `NODE_ENV` = `production`
2. `PORT` = `5000`
3. `JWT_SECRET` = `JoBika_JWT_Secret_2025_Production_Key_Secure`
4. `DATABASE_URL` = `postgresql://postgres:23110081aaiiTgn@db.gvybvfbnqgzcisuchocz.supabase.co:5432/postgres`

## 5. Deploy
- Click **"Create Web Service"** at the bottom.

---

## ✅ Verification
After ~5 minutes, check:
- **URL**: https://jobika-pern.onrender.com
- **Health**: https://jobika-pern.onrender.com/api/health

**That's it! Your app will be live.**
