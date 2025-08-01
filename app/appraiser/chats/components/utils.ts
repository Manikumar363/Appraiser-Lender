import { jwtDecode } from 'jwt-decode';
import { User, UIMessage, DateGroup } from './types';

export const getUserFromToken = (): User | null => {
  try {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken');
    
    if (!token) {
      console.warn('No token found in storage');
      return null;
    }

    const decoded: any = jwtDecode(token);
    
    const user: User = {
      id: decoded.userId || decoded.id || decoded.sub || decoded.user_id,
      name: decoded.name || decoded.username || decoded.full_name || 'Unknown User',
      role: decoded.role || decoded.userRole || 'user',
      email: decoded.email
    };

    return user;
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return null;
  }
};

export const getParticipantAvatars = (participants: any) => {
  const avatars = [];
  
  if (participants?.lender?.image) {
    avatars.push({
      id: 'lender',
      image: participants.lender.image,
      name: 'Lender'
    });
  }
  
  if (participants?.appraiser?.image) {
    avatars.push({
      id: 'appraiser',
      image: participants.appraiser.image,
      name: 'Appraiser'
    });
  }
  
  if (participants?.admin?.image) {
    avatars.push({
      id: 'admin',
      image: participants.admin.image,
      name: 'Admin'
    });
  }
  
  // If no participants found, return default placeholders
  if (avatars.length === 0) {
    return [
      { id: 'lender', image: '/placeholder.svg', name: 'Lender' },
      { id: 'appraiser', image: '/placeholder.svg', name: 'Appraiser' },
      { id: 'admin', image: '/placeholder.svg', name: 'Admin' },
    ];
  }
  
  return avatars;
};

// ADD THESE DATE FUNCTIONS:
export const formatMessageDate = (dateString: string): string => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (messageDateOnly.getTime() === todayOnly.getTime()) {
    return "Today";
  } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

export const groupMessagesByDate = (messages: UIMessage[]): DateGroup[] => {
  const groups: { [key: string]: UIMessage[] } = {};

  messages.forEach(message => {
    const dateKey = formatMessageDate(message.created_at);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages
  }));
};
