import React from 'react';
import InstagramCollage from './InstagramCollage';

const InstagramCollageTest: React.FC = () => {
  // Sample Instagram data for testing
  const sampleImages = [
    {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      postText: "Amazing sunset at the beach today! 🌅 Perfect way to end the week.",
      postDate: "2025-01-15T10:30:00Z",
      platform: "instagram",
      likes: 234,
      comments: 18
    },
    {
      url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
      postText: "Working on some new projects. Can't wait to share more details! 💻",
      postDate: "2025-01-14T15:45:00Z",
      platform: "instagram",
      likes: 156,
      comments: 12
    },
    {
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop",
      postText: "Coffee and coding - the perfect combination ☕️",
      postDate: "2025-01-13T09:15:00Z",
      platform: "instagram",
      likes: 89,
      comments: 7
    },
    {
      url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop",
      postText: "Late night coding session. Sometimes the best ideas come at 2 AM! 🌙",
      postDate: "2025-01-12T02:30:00Z",
      platform: "instagram",
      likes: 312,
      comments: 25
    },
    {
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop",
      postText: "New feature launch! 🚀 Excited to see how users respond.",
      postDate: "2025-01-11T14:20:00Z",
      platform: "instagram",
      likes: 445,
      comments: 31
    },
    {
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop",
      postText: "Team meeting today. Great discussions about future projects! 👥",
      postDate: "2025-01-10T11:00:00Z",
      platform: "instagram",
      likes: 178,
      comments: 14
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram Collage Test</h1>
          <p className="text-gray-600">Testing the beautiful Instagram collage component</p>
        </div>
        
        <InstagramCollage 
          images={sampleImages}
          title="Instagram Highlights"
          subtitle="A glimpse into my visual journey"
        />
      </div>
    </div>
  );
};

export default InstagramCollageTest; 