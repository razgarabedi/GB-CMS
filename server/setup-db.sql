-- Create the Contents table manually
CREATE TABLE IF NOT EXISTS "Contents" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "body" TEXT NOT NULL,
  "imageUrl" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Insert some sample data
INSERT INTO "Contents" ("title", "body", "imageUrl", "createdAt", "updatedAt") VALUES
('Welcome to GB-CMS', 'This is a sample content item to get you started with the content management system.', 'https://via.placeholder.com/400x300', NOW(), NOW()),
('Getting Started', 'Learn how to create, edit, and manage your content using the admin dashboard.', 'https://via.placeholder.com/400x300', NOW(), NOW()),
('Features Overview', 'Explore the powerful features of our content management system including real-time updates and responsive design.', 'https://via.placeholder.com/400x300', NOW(), NOW()); 