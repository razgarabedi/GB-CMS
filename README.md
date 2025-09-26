# Signage Solution

## Overview
This project is a complete signage solution consisting of two main parts:

1. **Player**: The front-end application that displays the final signage layouts on screens.
2. **Server**: The Next.js-based back-end and front-end management dashboard for creating, managing, and distributing signage content.

## Features
- Core set of widgets
- Drag-and-drop canvas for layout creation
- Robust template and plugin management system
- Dark-themed design system
- Responsive grid system
- Drag-and-drop interactions
- Internationalization with German/English support

## Rendering Engine
The player application uses Three.js to provide a lightweight and performant rendering engine for displaying signage layouts. This ensures smooth and efficient rendering of complex layouts.

## Real-time Updates
Real-time updates are facilitated using Socket.IO, allowing the player to receive content and layout updates from the server efficiently. This ensures that the displayed content is always up-to-date.

## Performance Optimization
The player is optimized for continuous playback on various hardware using react-performance. This includes optimizations for rendering efficiency and resource management to ensure smooth operation across different devices.

## Setup Instructions

### Prerequisites
- Node.js
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd GB-CMS
   ```

3. Install dependencies for the server:
   ```bash
   cd server
   npm install
   ```

4. Install dependencies for the player:
   ```bash
   cd ../player
   npm install
   ```

### Running the Application

#### Server
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Start the server:
   ```bash
   npm run dev
   ```

#### Player
1. Navigate to the player directory:
   ```bash
   cd player
   ```
2. Start the player application:
   ```bash
   npm start
   ```

## Usage
- Access the server dashboard to create and manage signage content.
- Use the player application to display signage layouts on screens.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
