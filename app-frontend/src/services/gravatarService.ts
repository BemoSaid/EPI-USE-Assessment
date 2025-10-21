import CryptoJS from 'crypto-js';

export interface GravatarProfile {
  id: string;
  hash: string;
  requestHash: string;
  profileUrl: string;
  preferredUsername: string;
  thumbnailUrl: string;
  photos: Array<{
    value: string;
    type: string;
  }>;
  name?: {
    givenName?: string;
    familyName?: string;
    formatted?: string;
  };
  displayName?: string;
  aboutMe?: string;
  currentLocation?: string;
  urls?: Array<{
    value: string;
    title: string;
  }>;
}

export interface GravatarResponse {
  entry: GravatarProfile[];
}

export const gravatarService = {
  /**
   * Generate Gravatar URL with proper MD5 hash
   */
  getGravatarUrl: (email: string, size: number = 200, defaultImage: string = 'identicon'): string => {
    if (!email) return '';
    
    const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}&r=g`;
  },

  /**
   * Get MD5 hash of email for Gravatar
   */
  getEmailHash: (email: string): string => {
    if (!email) return '';
    return CryptoJS.MD5(email.toLowerCase().trim()).toString();
  },

  /**
   * Check if a Gravatar exists for the given email
   */
  checkGravatarExists: async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
    const testUrl = `https://www.gravatar.com/avatar/${hash}?d=404`;
    
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      return response.status === 200;
    } catch {
      return false;
    }
  },

  /**
   * Fetch full Gravatar profile data (if available)
   * This includes name, bio, location, social links, etc.
   */
  getGravatarProfile: async (email: string): Promise<GravatarProfile | null> => {
    if (!email) return null;
    
    const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
    
    // Try multiple endpoints that Gravatar might use
    const endpoints = [
      `https://www.gravatar.com/${hash}.json`,
      `https://en.gravatar.com/${hash}.json`,
      `https://secure.gravatar.com/${hash}.json`
    ];
    
    for (const profileUrl of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${profileUrl}`);
        const response = await fetch(profileUrl);
        
        console.log(`📡 Response status: ${response.status} for ${profileUrl}`);
        
        if (response.ok) {
          const data: GravatarResponse = await response.json();
          console.log(`📦 Raw data from ${profileUrl}:`, data);
          
          if (data.entry && data.entry.length > 0) {
            console.log(`✅ Found profile data:`, data.entry[0]);
            return data.entry[0];
          } else {
            console.log(`❌ No entry data in response from ${profileUrl}`);
          }
        } else if (response.status === 404) {
          console.log(`🚫 Profile not found (404) at ${profileUrl}`);
        } else {
          console.log(`⚠️ Unexpected status ${response.status} from ${profileUrl}`);
        }
      } catch (error) {
        console.warn(`❌ Failed to fetch from ${profileUrl}:`, error);
      }
    }
    
    console.log('❌ All Gravatar profile endpoints failed');
    return null;
  },

  /**
   * Get multiple photo sizes from Gravatar
   */
  getGravatarPhotos: (email: string): { [key: string]: string } => {
    if (!email) return {};
    
    const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
    const baseUrl = `https://www.gravatar.com/avatar/${hash}`;
    
    return {
      small: `${baseUrl}?s=80&d=identicon&r=g`,
      medium: `${baseUrl}?s=200&d=identicon&r=g`,
      large: `${baseUrl}?s=512&d=identicon&r=g`,
    };
  },
};
