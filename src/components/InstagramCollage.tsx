import React from 'react';
import { Camera, Heart, MessageCircle } from 'lucide-react';

interface InstagramImage {
  url: string;
  postText?: string;
  postDate?: string;
  platform?: string;
  likes?: number;
  comments?: number;
}

interface InstagramCollageProps {
  images: InstagramImage[];
  title?: string;
  subtitle?: string;
}

const InstagramCollage: React.FC<InstagramCollageProps> = ({ 
  images, 
  title = "Instagram Highlights", 
  subtitle = "A glimpse into my visual journey" 
}) => {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No Instagram images available</p>
      </div>
    );
  }

  // Create a masonry-style layout with different heights
  const getImageHeight = (index: number) => {
    const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-60'];
    return heights[index % heights.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Collage Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`relative group break-inside-avoid ${getImageHeight(index)} overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1`}
          >
            {/* Image */}
            <img
              src={image.url}
              alt={image.postText || `Instagram post ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            
            {/* Fallback for failed images */}
            <div className="hidden w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>

            {/* Overlay with post info */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
              <div className="w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {/* Post text */}
                {image.postText && (
                  <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                    {image.postText}
                  </p>
                )}
                
                {/* Engagement metrics */}
                <div className="flex items-center justify-between text-white/90 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{image.likes || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{image.comments || 0}</span>
                    </div>
                  </div>
                  
                  {/* Date */}
                  {image.postDate && (
                    <span className="text-white/70">
                      {new Date(image.postDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Platform badge */}
            <div className="absolute top-2 right-2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                Instagram
              </span>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center space-x-6 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>{images.length} posts</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>{images.reduce((sum, img) => sum + (img.likes || 0), 0)} total likes</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>{images.reduce((sum, img) => sum + (img.comments || 0), 0)} total comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramCollage; 