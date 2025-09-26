import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.09 8.26L19 7L13.09 8.26L12 2Z" fill="currentColor"/>
    <path d="M19 7L20.09 13.26L26 12L20.09 13.26L19 7Z" fill="currentColor"/>
    <path d="M12 2L13.09 8.26L19 7L13.09 8.26L12 2Z" fill="currentColor"/>
    <circle cx="12" cy="18" r="3" fill="currentColor"/>
    <path d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 18.1 8.9 19 10 19H14C15.1 19 16 18.1 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const NewsIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 22H20V2H4V22Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M8 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SlideshowIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M8 8L16 12L8 16V8Z" fill="currentColor"/>
  </svg>
);

export const VideoPlayerIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M8 8L16 12L8 16V8Z" fill="currentColor"/>
  </svg>
);

export const ImageGalleryIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

export const ChartIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 9L12 6L16 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const KPIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M9 9H15V15H9V9Z" fill="currentColor"/>
    <path d="M9 9L12 6L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CounterIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="bold">123</text>
  </svg>
);

export const WebViewerIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M8 21L12 17L16 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 8H22" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const QRCodeIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="5" height="5" fill="currentColor"/>
    <rect x="3" y="9" width="5" height="5" fill="currentColor"/>
    <rect x="9" y="3" width="5" height="5" fill="currentColor"/>
    <rect x="16" y="3" width="5" height="5" fill="currentColor"/>
    <rect x="16" y="9" width="5" height="5" fill="currentColor"/>
    <rect x="3" y="16" width="5" height="5" fill="currentColor"/>
    <rect x="9" y="16" width="5" height="5" fill="currentColor"/>
    <rect x="16" y="16" width="5" height="5" fill="currentColor"/>
  </svg>
);

export const SocialFeedIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9 16.1 17 15 17H5C3.9 17 3 17.9 3 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M23 21V19C23 17.1 21.9 15.4 20 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 3.1C17.8 3.4 19 5.1 19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const LiveChatIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/>
    <circle cx="15" cy="9" r="1" fill="currentColor"/>
  </svg>
);

export const TextDisplayIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const AnnouncementIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L2 8L10.5 12L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 8.5L10.5 12L6 15.5V8.5Z" fill="currentColor"/>
    <path d="M22 2L12 22L10.5 12L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const QuoteIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21C3 19.9 3.9 19 5 19H7C8.1 19 9 19.9 9 21V17C9 15.9 8.1 15 7 15H5C3.9 15 3 15.9 3 17V21Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M15 21C15 19.9 15.9 19 17 19H19C20.1 19 21 19.9 21 21V17C21 15.9 20.1 15 19 15H17C15.9 15 15 15.9 15 17V21Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M7 15V9C7 7.9 7.9 7 9 7H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 15V9C19 7.9 19.9 7 21 7H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const CustomIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M9 9H15V15H9V9Z" fill="currentColor"/>
    <path d="M9 3V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 3V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const HTMLIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3H20C20.5304 3 21.0391 3.21071 21.4142 3.58579C21.7893 3.96086 22 4.46957 22 5V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M6 7H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 11H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const APIIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PluginIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.09 8.26L19 7L13.09 8.26L12 2Z" fill="currentColor"/>
    <path d="M19 7L20.09 13.26L26 12L20.09 13.26L19 7Z" fill="currentColor"/>
    <path d="M12 2L13.09 8.26L19 7L13.09 8.26L12 2Z" fill="currentColor"/>
    <circle cx="12" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

// Icon mapping for easy access
export const widgetIcons = {
  'Weather': WeatherIcon,
  'Clock': ClockIcon,
  'News': NewsIcon,
  'Slideshow': SlideshowIcon,
  'Video Player': VideoPlayerIcon,
  'Image Gallery': ImageGalleryIcon,
  'PV Compact': ChartIcon,
  'PV Flow': ChartIcon,
  'Chart Widget': ChartIcon,
  'KPI Dashboard': KPIcon,
  'Counter Widget': CounterIcon,
  'Web Viewer': WebViewerIcon,
  'QR Code': QRCodeIcon,
  'Social Feed': SocialFeedIcon,
  'Live Chat': LiveChatIcon,
  'Text Display': TextDisplayIcon,
  'Announcement': AnnouncementIcon,
  'Calendar': CalendarIcon,
  'Quote Display': QuoteIcon,
  'Custom': CustomIcon,
  'HTML Widget': HTMLIcon,
  'API Data': APIIcon,
  'Plugin Widget': PluginIcon,
};
