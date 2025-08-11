module.exports = {
  apps: [
    {
      name: 'digital-signage-server',
      script: 'index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        API_KEY: process.env.API_KEY || '',
        OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
    },
  ],
}


