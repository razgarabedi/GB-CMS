# Debugging Guide for Admin Interface

## Overview

This guide helps you debug issues with the Advanced Admin Interface, specifically problems with loading and saving elements.

## Debugging Steps

### 1. Check Console Logs

Open your browser's Developer Tools (F12) and look at the Console tab. You should see detailed logging with emojis:

#### Frontend Logs (Browser Console)
```
🚀 AdminInterface component initializing...
🔗 Initializing API hooks...
📊 API Hook States: {...}
🧪 Testing API connection...
🔗 API Call: GET http://localhost:3000/api/admin/test
📋 Headers: {...}
📊 Response Status: 200 OK
✅ API test successful: {...}
🔄 Loading components...
📡 Calling AdminAPI.components.getAll()
🔗 API Call: GET http://localhost:3000/api/admin/components
✅ API Success: [...]
✅ Components loaded successfully: [...]
```

#### Backend Logs (Server Console)
```
🔗 Loading admin API routes...
✅ Admin routes loaded successfully
✅ Admin routes mounted on root path
🧪 GET /api/admin/test - Test endpoint called
🔗 GET /api/admin/components - Request received
📁 Reading components from file: /path/to/components.json
✅ Components loaded from file: 5 items
```

### 2. Test API Endpoints Directly

#### Test API Connection
```bash
curl http://localhost:3000/api/admin/test
```

Expected response:
```json
{
  "status": "ok",
  "message": "Admin API is working!",
  "timestamp": "2024-01-XX...",
  "dataFiles": {
    "components": "/path/to/components.json",
    "templates": "/path/to/templates.json",
    "plugins": "/path/to/plugins.json",
    "layouts": "/path/to/layouts.json",
    "configs": "/path/to/configs.json"
  }
}
```

#### Test Components Endpoint
```bash
curl http://localhost:3000/api/admin/components
```

Expected response: Array of component objects

#### Test Templates Endpoint
```bash
curl http://localhost:3000/api/admin/templates
```

Expected response: Array of template objects

### 3. Common Issues and Solutions

#### Issue: "Failed to load components" Error

**Check:**
1. Is the backend server running on port 3000?
2. Are the JSON data files present in `server/data/`?
3. Check browser console for CORS errors
4. Check server console for file reading errors

**Solutions:**
```bash
# Start backend server
cd digital-signage/server
npm start

# Check if data files exist
ls server/data/
# Should show: components.json, templates.json, plugins.json, layouts.json, configs.json
```

#### Issue: Components/Templates Show "No items found"

**Check:**
1. Are the JSON files properly formatted?
2. Are the files not empty?
3. Check server console for JSON parsing errors

**Solutions:**
```bash
# Check file contents
cat server/data/components.json
cat server/data/templates.json

# Validate JSON format
node -e "console.log(JSON.parse(require('fs').readFileSync('server/data/components.json', 'utf8')))"
```

#### Issue: API Calls Return 404

**Check:**
1. Are the admin routes properly loaded?
2. Check server console for route loading messages
3. Verify the route paths in the frontend

**Solutions:**
- Check server console for "✅ Admin routes loaded successfully"
- Verify the API base URL in `AdminAPI.ts`
- Test the test endpoint: `curl http://localhost:3000/api/admin/test`

#### Issue: CORS Errors

**Check:**
1. Is the backend server running?
2. Are the frontend and backend on different ports?
3. Check CORS configuration in server

**Solutions:**
- Ensure backend is running on port 3000
- Ensure frontend is running on port 5173
- Check that CORS is enabled in server configuration

### 4. Debugging Checklist

#### Backend Server
- [ ] Server is running on port 3000
- [ ] Console shows "Admin routes loaded successfully"
- [ ] Data files exist in `server/data/`
- [ ] Data files contain valid JSON
- [ ] Test endpoint returns success: `curl http://localhost:3000/api/admin/test`

#### Frontend Player
- [ ] Player is running on port 5173
- [ ] Browser console shows API test success
- [ ] Browser console shows component loading logs
- [ ] No CORS errors in browser console
- [ ] Network tab shows successful API calls

#### Data Files
- [ ] `components.json` exists and has 5 components
- [ ] `templates.json` exists and has 3 templates
- [ ] `plugins.json` exists and has 3 plugins
- [ ] `layouts.json` exists and has 1 layout
- [ ] `configs.json` exists and has 2 configurations

### 5. Advanced Debugging

#### Enable Verbose Logging

Add this to your browser console to see all network requests:
```javascript
// Enable fetch logging
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Fetch request:', args);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('🌐 Fetch response:', response);
      return response;
    });
};
```

#### Check Network Tab

1. Open Developer Tools
2. Go to Network tab
3. Refresh the admin interface
4. Look for:
   - `api/admin/test` - Should return 200
   - `api/admin/components` - Should return 200 with component data
   - `api/admin/templates` - Should return 200 with template data
   - Any failed requests (red status codes)

#### Server Debug Mode

Start the server with debug logging:
```bash
cd digital-signage/server
DEBUG=* npm start
```

### 6. Expected Behavior

#### Successful Load
1. Browser console shows API test success
2. Components tab shows 5 components with emoji icons
3. Templates tab shows 3 templates with thumbnails
4. No error messages in console
5. Loading spinners disappear after data loads

#### Failed Load
1. Browser console shows error messages
2. Components/Templates tabs show "No items found"
3. Error messages appear in UI
4. Loading spinners may stay visible

### 7. Quick Fixes

#### Restart Everything
```bash
# Terminal 1 - Backend
cd digital-signage/server
npm start

# Terminal 2 - Frontend  
cd digital-signage/player
npm run dev
```

#### Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache and cookies
- Open in incognito/private mode

#### Check File Permissions
```bash
# Ensure data files are readable
chmod 644 server/data/*.json
```

### 8. Getting Help

If you're still having issues:

1. **Copy the console logs** from both browser and server
2. **Check the Network tab** for failed requests
3. **Verify the data files** contain valid JSON
4. **Test the API endpoints** directly with curl
5. **Check the file paths** in the server logs

The detailed logging should now show you exactly where the problem is occurring!
