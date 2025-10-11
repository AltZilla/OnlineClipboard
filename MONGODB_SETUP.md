# MongoDB Atlas Setup Instructions

## Quick Setup for Your Online Clipboard App

### Step 1: Update Your Connection String

1. **Open your `.env.local` file** in your project root
2. **Comment out the local MongoDB line**:
   ```
   # MONGODB_URI=mongodb://localhost:27017/online-clipboard
   ```
3. **Uncomment and update the Atlas line** with your actual connection string:
   ```
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/online-clipboard
   ```

### Step 2: Get Your Atlas Connection String

If you don't have your connection string yet:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on your cluster
3. Click **"Connect"**
4. Choose **"Connect your application"**
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Add `/online-clipboard` at the end

### Step 3: Restart Your Development Server

```bash
npm run dev
```

### Step 4: Test the Application

1. Go to `http://localhost:3000`
2. Create a new clipboard with text
3. Verify it redirects to the correct clipboard page (not "clipboard/undefined")

## Troubleshooting

### If you still get "clipboard/undefined":
- Check that your `.env.local` file has the correct connection string
- Make sure you've restarted the development server
- Check the browser console for any MongoDB connection errors

### If you get MongoDB connection errors:
- Verify your Atlas cluster is running
- Check that your IP address is whitelisted in Atlas
- Ensure your username and password are correct
- Make sure you added `/online-clipboard` to the end of your connection string

### Example Working Connection String:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/online-clipboard
```

## Security Note
- Never commit your `.env.local` file to git
- Keep your MongoDB credentials secure
- Use environment variables in production

Your app should work perfectly once the connection string is set up correctly! 🚀
