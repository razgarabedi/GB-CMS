const root = document.getElementById('root');

let content = [];
let currentIndex = 0;

const renderContent = () => {
  if (content.length === 0) {
    root.innerHTML = '<h1>No content available</h1>';
    return;
  }

  const item = content[currentIndex];
  root.innerHTML = `
    <div>
      <h2>${item.type}</h2>
      <p>${item.data}</p>
    </div>
  `;

  setTimeout(() => {
    currentIndex = (currentIndex + 1) % content.length;
    renderContent();
  }, item.duration * 1000);
};

const fetchContent = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/content');
    content = await response.json();
    renderContent();
  } catch (error) {
    root.innerHTML = '<h1>Failed to fetch content</h1>';
  }
};

fetchContent();
