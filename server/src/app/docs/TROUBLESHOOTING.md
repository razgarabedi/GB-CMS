# GB-CMS Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues with GB-CMS. It covers problems you might encounter during installation, configuration, and daily use.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Runtime Errors](#runtime-errors)
3. [Performance Problems](#performance-problems)
4. [Widget Issues](#widget-issues)
5. [Layout Problems](#layout-problems)
6. [Preview Issues](#preview-issues)
7. [Data Issues](#data-issues)
8. [Browser Compatibility](#browser-compatibility)
9. [Network Issues](#network-issues)
10. [Recovery Procedures](#recovery-procedures)

## Installation Issues

### Node.js Version Problems

#### Error: "Node.js version not supported"
**Symptoms:**
- Installation fails with version error
- Application won't start

**Solutions:**
1. **Check Node.js Version**
   ```bash
   node --version
   ```

2. **Update Node.js**
   - Download latest LTS version from [nodejs.org](https://nodejs.org)
   - Or use a version manager like nvm:
   ```bash
   nvm install 20
   nvm use 20
   ```

3. **Verify Installation**
   ```bash
   node --version
   npm --version
   ```

#### Error: "npm install fails"
**Symptoms:**
- Dependencies won't install
- Permission errors during installation

**Solutions:**
1. **Clear npm Cache**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **Check Permissions**
   ```bash
   # On Unix/Linux/macOS
   sudo chown -R $(whoami) ~/.npm
   
   # On Windows (run as Administrator)
   npm config set cache C:\temp\npm-cache --global
   ```

### Build Failures

#### Error: "Build failed with exit code 1"
**Symptoms:**
- `npm run build` fails
- TypeScript compilation errors

**Solutions:**
1. **Check TypeScript Errors**
   ```bash
   npm run type-check
   ```

2. **Fix Type Errors**
   - Review TypeScript errors in console
   - Fix type mismatches
   - Add missing type definitions

3. **Clear Build Cache**
   ```bash
   rm -rf .next
   npm run build
   ```

#### Error: "Out of memory during build"
**Symptoms:**
- Build process crashes
- "JavaScript heap out of memory" error

**Solutions:**
1. **Increase Node.js Memory**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

2. **Optimize Build Process**
   ```javascript
   // next.config.js
   module.exports = {
     webpack: (config, { isServer }) => {
       if (!isServer) {
         config.optimization.splitChunks.cacheGroups = {
           ...config.optimization.splitChunks.cacheGroups,
           vendor: {
             test: /[\\/]node_modules[\\/]/,
             name: 'vendors',
             chunks: 'all',
           },
         };
       }
       return config;
     },
   };
   ```

## Runtime Errors

### Application Won't Start

#### Error: "Port 3000 is already in use"
**Symptoms:**
- Application fails to start
- Port conflict error

**Solutions:**
1. **Find Process Using Port**
   ```bash
   # On Unix/Linux/macOS
   lsof -i :3000
   
   # On Windows
   netstat -ano | findstr :3000
   ```

2. **Kill Process**
   ```bash
   # On Unix/Linux/macOS
   kill -9 $(lsof -t -i:3000)
   
   # On Windows
   taskkill /PID <process_id> /F
   ```

3. **Use Different Port**
   ```bash
   PORT=3001 npm run dev
   ```

#### Error: "Module not found"
**Symptoms:**
- Import errors
- Missing module errors

**Solutions:**
1. **Check Import Paths**
   ```typescript
   // Correct
   import Component from './Component';
   
   // Incorrect
   import Component from './component'; // Case sensitivity
   ```

2. **Verify File Existence**
   ```bash
   ls -la src/components/Component.tsx
   ```

3. **Reinstall Dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Hydration Errors

#### Error: "Hydration failed because the server rendered HTML didn't match the client"
**Symptoms:**
- Console warnings about hydration
- Content flickering on load

**Solutions:**
1. **Use Client-Side Rendering**
   ```tsx
   'use client';
   
   import { useEffect, useState } from 'react';
   
   export default function MyComponent() {
     const [isClient, setIsClient] = useState(false);
     
     useEffect(() => {
       setIsClient(true);
     }, []);
     
     if (!isClient) {
       return <div>Loading...</div>;
     }
     
     return <div>Client-side content</div>;
   }
   ```

2. **Use Dynamic Imports**
   ```tsx
   import dynamic from 'next/dynamic';
   
   const ClientOnlyComponent = dynamic(
     () => import('./ClientOnlyComponent'),
     { ssr: false }
   );
   ```

3. **Fix Time-Based Content**
   ```tsx
   // Use custom hook for time-sensitive content
   import { useCurrentTime } from '../hooks/useHydration';
   
   export default function ClockWidget() {
     const { value: currentTime, isHydrated } = useCurrentTime(1000);
     
     if (!isHydrated) {
       return <div>Loading...</div>;
     }
     
     return <div>{currentTime?.toLocaleTimeString()}</div>;
   }
   ```

## Performance Problems

### Slow Loading

#### Symptoms:
- Application takes long to load
- Widgets load slowly
- Interface is unresponsive

**Solutions:**
1. **Enable Compression**
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
   };
   ```

2. **Optimize Images**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       formats: ['image/webp', 'image/avif'],
       minimumCacheTTL: 60,
     },
   };
   ```

3. **Use Code Splitting**
   ```tsx
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(
     () => import('./HeavyComponent'),
     { loading: () => <div>Loading...</div> }
   );
   ```

4. **Optimize Bundle Size**
   ```bash
   npm run analyze
   ```

### Memory Issues

#### Error: "JavaScript heap out of memory"
**Symptoms:**
- Application crashes
- Browser becomes unresponsive
- Memory usage keeps growing

**Solutions:**
1. **Increase Memory Limit**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

2. **Optimize Memory Usage**
   ```tsx
   // Use useMemo for expensive calculations
   const expensiveValue = useMemo(() => {
     return heavyCalculation(data);
   }, [data]);
   
   // Use useCallback for event handlers
   const handleClick = useCallback(() => {
     doSomething();
   }, [dependency]);
   ```

3. **Clean Up Resources**
   ```tsx
   useEffect(() => {
     const timer = setInterval(() => {
       updateData();
     }, 1000);
     
     return () => clearInterval(timer);
   }, []);
   ```

### Slow Rendering

#### Symptoms:
- UI updates slowly
- Animations are choppy
- Scrolling is laggy

**Solutions:**
1. **Use React.memo**
   ```tsx
   const MyComponent = React.memo(({ prop }) => {
     return <div>{prop}</div>;
   });
   ```

2. **Optimize Re-renders**
   ```tsx
   // Avoid creating objects in render
   const style = useMemo(() => ({
     color: props.color,
     fontSize: props.fontSize
   }), [props.color, props.fontSize]);
   ```

3. **Use Virtual Scrolling**
   ```tsx
   import { FixedSizeList as List } from 'react-window';
   
   const VirtualList = ({ items }) => (
     <List
       height={600}
       itemCount={items.length}
       itemSize={50}
       itemData={items}
     >
       {({ index, style, data }) => (
         <div style={style}>
           {data[index]}
         </div>
       )}
     </List>
   );
   ```

## Widget Issues

### Widget Not Displaying

#### Symptoms:
- Widget appears blank
- Widget shows loading state indefinitely
- Widget throws errors

**Solutions:**
1. **Check Widget Properties**
   ```tsx
   // Verify required props
   if (!props.title) {
     return <div>Error: Title is required</div>;
   }
   ```

2. **Check Data Source**
   ```tsx
   // Verify data connection
   useEffect(() => {
     if (props.dataSource) {
       fetchData(props.dataSource)
         .then(setData)
         .catch(setError);
     }
   }, [props.dataSource]);
   ```

3. **Add Error Boundaries**
   ```tsx
   class WidgetErrorBoundary extends React.Component {
     constructor(props) {
       super(props);
       this.state = { hasError: false };
     }
     
     static getDerivedStateFromError(error) {
       return { hasError: true };
     }
     
     render() {
       if (this.state.hasError) {
         return <div>Widget Error</div>;
       }
       return this.props.children;
     }
   }
   ```

### Widget Configuration Issues

#### Symptoms:
- Properties not saving
- Invalid property values
- Configuration not applying

**Solutions:**
1. **Validate Properties**
   ```tsx
   const validateProps = (props) => {
     const errors = [];
     
     if (props.fontSize && props.fontSize < 8) {
       errors.push('Font size must be at least 8');
     }
     
     if (props.color && !/^#[0-9A-F]{6}$/i.test(props.color)) {
       errors.push('Invalid color format');
     }
     
     return errors;
   };
   ```

2. **Handle Property Updates**
   ```tsx
   const handlePropertyChange = (key, value) => {
     const newProps = { ...props, [key]: value };
     const errors = validateProps(newProps);
     
     if (errors.length === 0) {
       onPropsChange(newProps);
     } else {
       setErrors(errors);
     }
   };
   ```

3. **Reset to Defaults**
   ```tsx
   const resetToDefaults = () => {
     onPropsChange(defaultProps);
   };
   ```

## Layout Problems

### Layout Not Saving

#### Symptoms:
- Changes not persisting
- Layout resets on refresh
- Save button not working

**Solutions:**
1. **Check Local Storage**
   ```javascript
   // Verify local storage is working
   localStorage.setItem('test', 'value');
   console.log(localStorage.getItem('test'));
   ```

2. **Handle Storage Errors**
   ```javascript
   try {
     localStorage.setItem('layout', JSON.stringify(layout));
   } catch (error) {
     console.error('Failed to save layout:', error);
     // Fallback to session storage
     sessionStorage.setItem('layout', JSON.stringify(layout));
   }
   ```

3. **Check Storage Quota**
   ```javascript
   // Check available storage
   if ('storage' in navigator && 'estimate' in navigator.storage) {
     navigator.storage.estimate().then(estimate => {
       console.log('Available storage:', estimate.quota - estimate.usage);
     });
   }
   ```

### Layout Not Loading

#### Symptoms:
- Layout appears empty
- Widgets not positioned correctly
- Layout data corrupted

**Solutions:**
1. **Validate Layout Data**
   ```javascript
   const validateLayout = (layout) => {
     if (!Array.isArray(layout)) {
       return false;
     }
     
     return layout.every(item => 
       item.i && 
       typeof item.x === 'number' && 
       typeof item.y === 'number' &&
       typeof item.w === 'number' &&
       typeof item.h === 'number'
     );
   };
   ```

2. **Handle Corrupted Data**
   ```javascript
   const loadLayout = () => {
     try {
       const stored = localStorage.getItem('layout');
       const layout = JSON.parse(stored);
       
       if (validateLayout(layout)) {
         setLayout(layout);
       } else {
         console.warn('Invalid layout data, using default');
         setLayout(defaultLayout);
       }
     } catch (error) {
       console.error('Failed to load layout:', error);
       setLayout(defaultLayout);
     }
   };
   ```

3. **Create Backup**
   ```javascript
   const backupLayout = () => {
     const layout = getLayout();
     const backup = {
       layout,
       timestamp: Date.now(),
       version: '1.0.0'
     };
     
     localStorage.setItem('layout-backup', JSON.stringify(backup));
   };
   ```

## Preview Issues

### Preview Not Updating

#### Symptoms:
- Preview shows old content
- Changes not reflected in preview
- Preview is blank

**Solutions:**
1. **Force Preview Update**
   ```tsx
   const [previewKey, setPreviewKey] = useState(0);
   
   const refreshPreview = () => {
     setPreviewKey(prev => prev + 1);
   };
   
   return (
     <PreviewSystem
       key={previewKey}
       layout={layout}
       onRefresh={refreshPreview}
     />
   );
   ```

2. **Check Preview Dependencies**
   ```tsx
   useEffect(() => {
     // Update preview when layout changes
     setPreviewLayout(layout);
   }, [layout]);
   ```

3. **Handle Preview Errors**
   ```tsx
   const [previewError, setPreviewError] = useState(null);
   
   const handlePreviewError = (error) => {
     setPreviewError(error.message);
   };
   
   return (
     <div>
       {previewError && (
         <div className="error">Preview Error: {previewError}</div>
       )}
       <PreviewSystem onError={handlePreviewError} />
     </div>
   );
   ```

### Device Simulation Issues

#### Symptoms:
- Device simulation not working
- Wrong screen sizes
- Responsive layout not adapting

**Solutions:**
1. **Check Viewport Configuration**
   ```javascript
   const viewportConfigs = {
     desktop: { width: 1920, height: 1080 },
     tablet: { width: 768, height: 1024 },
     mobile: { width: 375, height: 667 }
   };
   ```

2. **Update Responsive Logic**
   ```javascript
   const getResponsiveLayout = (layout, viewport) => {
     const config = viewportConfigs[viewport];
     const isMobile = config.width < 768;
     
     return layout.map(item => {
       if (isMobile) {
         return {
           ...item,
           w: 12, // Full width on mobile
           x: 0
         };
       }
       return item;
     });
   };
   ```

3. **Test Different Devices**
   ```tsx
   const testDevices = ['desktop', 'tablet', 'mobile'];
   
   return (
     <div>
       {testDevices.map(device => (
         <button
           key={device}
           onClick={() => setViewport(device)}
         >
           {device}
         </button>
       ))}
     </div>
   );
   ```

## Data Issues

### Data Not Loading

#### Symptoms:
- Widgets show "No data" message
- API calls failing
- Data not updating

**Solutions:**
1. **Check API Endpoints**
   ```javascript
   const fetchData = async (url) => {
     try {
       const response = await fetch(url);
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }
       return await response.json();
     } catch (error) {
       console.error('API Error:', error);
       throw error;
     }
   };
   ```

2. **Handle Network Errors**
   ```tsx
   const [data, setData] = useState(null);
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);
   
   useEffect(() => {
     const loadData = async () => {
       setLoading(true);
       setError(null);
       
       try {
         const result = await fetchData(props.dataSource);
         setData(result);
       } catch (err) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     };
     
     loadData();
   }, [props.dataSource]);
   ```

3. **Add Retry Logic**
   ```javascript
   const fetchWithRetry = async (url, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await fetch(url);
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   };
   ```

### Data Validation Issues

#### Symptoms:
- Invalid data causing errors
- Widgets crashing on bad data
- Data format mismatches

**Solutions:**
1. **Validate Data Structure**
   ```javascript
   const validateWeatherData = (data) => {
     const required = ['temperature', 'condition', 'humidity'];
     return required.every(field => field in data);
   };
   ```

2. **Handle Invalid Data**
   ```tsx
   const WeatherWidget = ({ data }) => {
     if (!validateWeatherData(data)) {
       return <div>Invalid weather data</div>;
     }
     
     return (
       <div>
         <div>Temperature: {data.temperature}°C</div>
         <div>Condition: {data.condition}</div>
         <div>Humidity: {data.humidity}%</div>
       </div>
     );
   };
   ```

3. **Provide Default Values**
   ```javascript
   const getDefaultData = () => ({
     temperature: 20,
     condition: 'Unknown',
     humidity: 50
   });
   
   const safeData = validateWeatherData(data) ? data : getDefaultData();
   ```

## Browser Compatibility

### Internet Explorer Issues

#### Symptoms:
- Application doesn't load
- Features not working
- JavaScript errors

**Solutions:**
1. **Check Browser Support**
   ```javascript
   const isSupported = () => {
     return 'fetch' in window && 'Promise' in window;
   };
   
   if (!isSupported()) {
     alert('Please use a modern browser');
   }
   ```

2. **Add Polyfills**
   ```javascript
   // Add polyfills for older browsers
   if (!window.fetch) {
     import('whatwg-fetch');
   }
   ```

3. **Graceful Degradation**
   ```tsx
   const ModernComponent = () => {
     if (!window.fetch) {
       return <div>Please upgrade your browser</div>;
     }
     
     return <div>Modern content</div>;
   };
   ```

### Mobile Browser Issues

#### Symptoms:
- Touch events not working
- Layout not responsive
- Performance issues

**Solutions:**
1. **Add Touch Support**
   ```tsx
   const handleTouch = (event) => {
     event.preventDefault();
     // Handle touch events
   };
   
   return (
     <div
       onTouchStart={handleTouch}
       onTouchMove={handleTouch}
       onTouchEnd={handleTouch}
     >
       Content
     </div>
   );
   ```

2. **Optimize for Mobile**
   ```css
   @media (max-width: 768px) {
     .widget {
       font-size: 14px;
       padding: 8px;
     }
   }
   ```

3. **Handle Viewport**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

## Network Issues

### CORS Errors

#### Symptoms:
- API calls failing
- "CORS policy" errors in console
- Data not loading from external sources

**Solutions:**
1. **Configure CORS Headers**
   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/api/:path*',
           headers: [
             {
               key: 'Access-Control-Allow-Origin',
               value: '*',
             },
             {
               key: 'Access-Control-Allow-Methods',
               value: 'GET, POST, PUT, DELETE, OPTIONS',
             },
             {
               key: 'Access-Control-Allow-Headers',
               value: 'Content-Type, Authorization',
             },
           ],
         },
       ];
     },
   };
   ```

2. **Use Proxy for API Calls**
   ```javascript
   const apiCall = async (endpoint) => {
     const response = await fetch(`/api/proxy?url=${encodeURIComponent(endpoint)}`);
     return response.json();
   };
   ```

3. **Handle CORS Errors**
   ```javascript
   const fetchWithCORS = async (url) => {
     try {
       return await fetch(url);
     } catch (error) {
       if (error.name === 'TypeError' && error.message.includes('CORS')) {
         console.warn('CORS error, using proxy');
         return fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
       }
       throw error;
     }
   };
   ```

### Network Timeout Issues

#### Symptoms:
- Requests timing out
- Slow data loading
- Network errors

**Solutions:**
1. **Set Timeout**
   ```javascript
   const fetchWithTimeout = (url, timeout = 5000) => {
     return Promise.race([
       fetch(url),
       new Promise((_, reject) =>
         setTimeout(() => reject(new Error('Timeout')), timeout)
       )
     ]);
   };
   ```

2. **Handle Timeouts**
   ```tsx
   const [timeout, setTimeout] = useState(5000);
   
   const handleTimeout = () => {
     setTimeout(prev => Math.min(prev * 2, 30000));
   };
   ```

3. **Add Retry Logic**
   ```javascript
   const fetchWithRetry = async (url, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await fetchWithTimeout(url);
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   };
   ```

## Recovery Procedures

### Data Recovery

#### Recover Lost Layout
1. **Check Local Storage**
   ```javascript
   // Open browser console
   console.log(localStorage.getItem('layout'));
   ```

2. **Restore from Backup**
   ```javascript
   const backup = localStorage.getItem('layout-backup');
   if (backup) {
     const data = JSON.parse(backup);
     setLayout(data.layout);
   }
   ```

3. **Export Current State**
   ```javascript
   const exportLayout = () => {
     const layout = getLayout();
     const dataStr = JSON.stringify(layout, null, 2);
     const dataBlob = new Blob([dataStr], { type: 'application/json' });
     const url = URL.createObjectURL(dataBlob);
     const link = document.createElement('a');
     link.href = url;
     link.download = 'layout-backup.json';
     link.click();
   };
   ```

### System Reset

#### Reset to Default State
1. **Clear All Data**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Reload Application**
   ```javascript
   window.location.reload();
   ```

3. **Restore Defaults**
   ```javascript
   const defaultLayout = [
     { i: 'w1', x: 0, y: 0, w: 3, h: 2, component: 'Clock' },
     { i: 'w2', x: 3, y: 0, w: 3, h: 2, component: 'Weather' }
   ];
   setLayout(defaultLayout);
   ```

### Emergency Procedures

#### Application Won't Start
1. **Check Console Errors**
   - Open browser developer tools
   - Look for JavaScript errors
   - Check network tab for failed requests

2. **Clear Browser Cache**
   - Hard refresh (Ctrl+F5)
   - Clear browser cache
   - Disable browser extensions

3. **Try Different Browser**
   - Test in different browser
   - Check if issue is browser-specific
   - Update browser to latest version

#### Data Corruption
1. **Identify Corrupted Data**
   ```javascript
   const validateData = (data) => {
     try {
       JSON.parse(JSON.stringify(data));
       return true;
     } catch (error) {
       return false;
     }
   };
   ```

2. **Restore from Backup**
   - Check for automatic backups
   - Restore from last known good state
   - Recreate corrupted data

3. **Prevent Future Corruption**
   - Add data validation
   - Implement error handling
   - Regular backups

---

*This troubleshooting guide covers the most common issues you might encounter with GB-CMS. For additional help, check the help system within the application or contact support.*
