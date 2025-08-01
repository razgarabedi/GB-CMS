# GB-CMS: Full-Stack Digital Signage Application

GB-CMS is a full-stack digital signage application designed to manage and display content on remote screens. The system is comprised of three main components:

1.  **Node.js/Express Backend**: A robust server application responsible for managing data, serving content, and handling API requests. It uses a PostgreSQL database for data persistence.

2.  **React Admin Panel**: A user-friendly web interface for administrators to manage content, design screen layouts, and oversee connected displays.

3.  **Vanilla JS TV Client**: A lightweight client application designed to run on low-power devices like a Raspberry Pi. It fetches layout and content information from the backend and renders it in real-time.

## Project Structure

The project is organized as a monorepo with the following structure:

```
/
├── client/         # React Admin Panel
├── server/         # Node.js/Express Backend
└── tv-client/      # Vanilla JS TV Client
```

This README will be updated as the project progresses.
