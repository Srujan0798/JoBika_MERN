# GitHub Push Instructions

## Authentication Issue

The push failed due to GitHub authentication. Here are your options:

---

## Option 1: Use GitHub Personal Access Token (Recommended)

### Step 1: Create Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `JoBika_PERN_Deploy`
4. Expiration: 90 days (or your preference)
5. Select scopes:
   - ✅ `repo` (all)
   - ✅ `workflow`
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push with Token
```bash
cd /Users/roshwinram/Downloads/JoBika_MERN

# Use token in URL (replace YOUR_TOKEN)
git remote set-url origin https://YOUR_TOKEN@github.com/Srujan0798/JoBika_PERN.git

# Push
git push origin main
```

---

## Option 2: Use SSH Key

### Step 1: Generate SSH Key (if you don't have one)
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter to accept default location
# Press Enter twice for no passphrase
```

### Step 2: Add SSH Key to GitHub
```bash
# Copy your public key
cat ~/.ssh/id_ed25519.pub
# Copy the output
```

1. Go to https://github.com/settings/keys
2. Click "New SSH key"
3. Paste your public key
4. Click "Add SSH key"

### Step 3: Change Remote to SSH
```bash
cd /Users/roshwinram/Downloads/JoBika_MERN
git remote set-url origin git@github.com:Srujan0798/JoBika_PERN.git
git push origin main
```

---

## Option 3: Use GitHub Desktop

1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. Add repository: `/Users/roshwinram/Downloads/JoBika_MERN`
4. Click "Push origin"

---

## Option 4: Manual Upload

If you need to deploy immediately:

1. Go to https://github.com/Srujan0798/JoBika_PERN
2. Click "Add file" → "Upload files"
3. Drag and drop all files from `/Users/roshwinram/Downloads/JoBika_MERN`
4. Commit changes

---

## After Successful Push

Once pushed, proceed with deployment:

1. **Create Supabase Project**
   - See `docs/SUPABASE_SETUP.md`

2. **Deploy to Render**
   - See `docs/DEPLOYMENT_GUIDE.md`

---

## Quick Commands Reference

```bash
# Check current remote
git remote -v

# Check git status
git status

# View commit history
git log --oneline -5
```

---

**Your code is ready!** Just need to authenticate with GitHub to push. 🚀
