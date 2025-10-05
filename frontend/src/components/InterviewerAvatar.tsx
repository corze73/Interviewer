import { useState, useEffect } from 'react';

interface InterviewerAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  className?: string;
}

interface InterviewerPersona {
  name: string;
  title: string;
  company: string;
  image: string;
  bio: string;
  personality: string[];
}

// Generate different interviewer personas
const interviewerPersonas: InterviewerPersona[] = [
  {
    name: "Sarah Chen",
    title: "Senior Technical Recruiter",
    company: "TechFlow Solutions",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
    bio: "10+ years experience in technical recruiting with expertise in software engineering roles.",
    personality: ["Professional", "Analytical", "Encouraging", "Detail-oriented"]
  },
  {
    name: "Marcus Johnson",
    title: "Engineering Manager",
    company: "InnovateTech",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    bio: "Former software engineer turned manager, passionate about building great teams.",
    personality: ["Technical", "Mentorship-focused", "Collaborative", "Strategic"]
  },
  {
    name: "Elena Rodriguez",
    title: "Head of People Operations",
    company: "StartupHub",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    bio: "Specialized in scaling teams and creating inclusive hiring processes.",
    personality: ["Empathetic", "Organized", "Growth-minded", "Inclusive"]
  },
  {
    name: "David Kim",
    title: "VP of Engineering",
    company: "CloudSystems Inc",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "20+ years in tech leadership, from startup to enterprise scale.",
    personality: ["Visionary", "Experienced", "Problem-solver", "Leadership-focused"]
  }
];

export function InterviewerAvatar({ isSpeaking, isListening, className = '' }: InterviewerAvatarProps) {
  const [currentPersona, setCurrentPersona] = useState<InterviewerPersona>(interviewerPersonas[0]);
  
  // Select a random persona when component mounts (could be based on job role later)
  useEffect(() => {
    const randomPersona = interviewerPersonas[Math.floor(Math.random() * interviewerPersonas.length)];
    setCurrentPersona(randomPersona);
  }, []);

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Avatar Image */}
      <div className="relative">
        <div 
          className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
            isSpeaking 
              ? 'border-blue-400 shadow-lg shadow-blue-400/30 scale-105' 
              : isListening 
                ? 'border-green-400 shadow-lg shadow-green-400/30' 
                : 'border-gray-300 shadow-lg'
          }`}
        >
          <img 
            src={currentPersona.image} 
            alt={currentPersona.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a gradient if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  ${currentPersona.name.split(' ').map(n => n[0]).join('')}
                </div>
              `;
            }}
          />
        </div>
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Interviewer Info */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">{currentPersona.name}</h3>
        <p className="text-sm text-blue-300">{currentPersona.title}</p>
        <p className="text-xs text-gray-400">{currentPersona.company}</p>
        
        {/* Status */}
        <div className="text-xs text-gray-300 mt-2">
          {isSpeaking ? (
            <span className="text-blue-400">🗣️ Speaking...</span>
          ) : isListening ? (
            <span className="text-green-400">👂 Listening...</span>
          ) : (
            <span className="text-gray-400">Ready</span>
          )}
        </div>
      </div>
      
      {/* Personality traits */}
      <div className="flex flex-wrap gap-1 justify-center max-w-xs">
        {currentPersona.personality.map((trait, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
          >
            {trait}
          </span>
        ))}
      </div>
      
      {/* Bio */}
      <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
        {currentPersona.bio}
      </p>
    </div>
  );
}