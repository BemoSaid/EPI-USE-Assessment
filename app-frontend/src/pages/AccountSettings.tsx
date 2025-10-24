import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, User, Mail, Shield, Building2, Calendar, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PhotoUploader } from '../components/ui/PhotoUploader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { gravatarService, GravatarProfile } from '../services/gravatarService';
import { useAuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import ShinyText from '../components/ui/ShinyText';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdateData {
  name: string;
  email: string;
}

export const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  // Add setUser from AuthContext
  const { setUser } = useAuthContext();
  
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileData, setProfileData] = useState<ProfileUpdateData>({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  const [gravatarProfile, setGravatarProfile] = useState<GravatarProfile | null>(null);
  const [hasGravatar, setHasGravatar] = useState(false);
  const [isLoadingGravatar, setIsLoadingGravatar] = useState(false);
  
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState<string | null>(
    user?.employee?.profileUrl || null
  );

  useEffect(() => {
    if (user?.email) {
      loadGravatarData(user.email);
    }
  }, [user?.email]);

  const formatDate = (dateString: string | undefined | null): string => {
    try {
      if (!dateString) return 'Unknown';
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return 'Unknown';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return 'Unknown';
    }
  };

  // Load Gravatar profile data
  const loadGravatarData = async (email: string) => {
    if (!email) return;
    
    setIsLoadingGravatar(true);
    try {
      console.log('🔍 Checking Gravatar for email:', email);
      
      const exists = await gravatarService.checkGravatarExists(email);
      console.log('✅ Gravatar exists:', exists);
      setHasGravatar(exists);
      
      if (exists) {
        const hash = gravatarService.getEmailHash(email);
        const profileUrl = `https://www.gravatar.com/${hash}.json`;
        console.log('📊 Fetching profile from:', profileUrl);
        
        const profile = await gravatarService.getGravatarProfile(email);
        console.log('📋 Profile data received:', profile);
        setGravatarProfile(profile);
        
        // Also try to fetch raw response for debugging
        try {
          const rawResponse = await fetch(profileUrl);
          console.log('🔧 Raw response status:', rawResponse.status);
          if (rawResponse.ok) {
            const rawData = await rawResponse.json();
            console.log('🔧 Raw response data:', rawData);
          } else {
            console.log('🔧 Raw response not OK, status text:', rawResponse.statusText);
          }
        } catch (debugError) {
          console.log('🔧 Debug fetch failed:', debugError);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load Gravatar data:', error);
    } finally {
      setIsLoadingGravatar(false);
    }
  };

  const getAvatarUrl = (size: number = 120): string => {
    if (currentProfilePhoto) {
      return currentProfilePhoto;
    }
    return user ? gravatarService.getGravatarUrl(user.email, size) : '';
  };

  // Handle profile photo updates
  const handlePhotoUpdate = async (photoUrl: string | null) => {
    setCurrentProfilePhoto(photoUrl);
    try {
      const latestUser = await authAPI.getCurrentUser();
      setUser(latestUser);
      localStorage.setItem('user_data', JSON.stringify(latestUser));
    } catch (err) {
      console.error('Failed to refresh user after photo update:', err);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Valid email is required';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      showToast('Please fix the errors in the form', 'warning');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      showToast('Password updated successfully!', 'success');
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: any) {
      console.error('Password change failed:', error);
      showToast(
        error.response?.data?.error || 'Failed to update password. Please try again.',
        'error'
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      showToast('Please fix the errors in the form', 'warning');
      return;
    }

    setIsUpdatingProfile(true);

    try {
      await userService.updateProfile(profileData);
      showToast('Profile updated successfully!', 'success');
      
      // If email changed, refresh Gravatar data
      if (profileData.email !== user?.email) {
        loadGravatarData(profileData.email);
      }
      
      // Note: In a real app, you'd want to refresh the user context here
      showToast('Please log out and log back in to see profile changes reflected everywhere', 'info');
      
    } catch (error: any) {
      console.error('Profile update failed:', error);
      showToast(
        error.response?.data?.error || 'Failed to update profile. Please try again.',
        'error'
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Debug: Log user data to understand the date issue
  console.log('User data in AccountSettings:', user);
  console.log('CreatedAt value:', user?.createdAt, 'Type:', typeof user?.createdAt);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button><br></br>
          <ShinyText text="Account Settings" speed={3} className="text-3xl font-bold mb-2" />
          <p className="text-[#5F9EA0]">
            Manage your account information and security settings
          </p>
        </div>

        {/* Profile Overview Card - Full Width at Top */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Avatar and Basic Info */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="mb-4 relative inline-block">
                  <img
                    src={getAvatarUrl(180)}
                    alt="Profile Avatar"
                    className="w-40 h-40 rounded-full mx-auto border-4 border-[#B2D8D8] shadow-lg"
                    onError={(e) => {
                      if (currentProfilePhoto) {
                        setCurrentProfilePhoto(null);
                        e.currentTarget.src = gravatarService.getGravatarUrl(user.email, 180);
                      } else {
                        e.currentTarget.src = `https://www.gravatar.com/avatar/00000000000000000000000000000000?s=180&d=mp&r=g`;
                      }
                    }}
                  />
                  
                  {/* Photo uploader overlay */}
                  <PhotoUploader
                    currentPhotoUrl={currentProfilePhoto || undefined}
                    userId={user.id}
                    onPhotoUpdate={handlePhotoUpdate}
                    className="absolute inset-0"
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-[#3A6F6F] mb-1">
                  {user.name}
                </h3>
                <p className="text-sm text-[#5F9EA0] mb-2">
                  {user.email}
                </p>
                
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#E8F4F8] border border-[#B2D8D8] rounded-full text-xs font-medium text-[#3A6F6F]">
                  <Shield className="h-3 w-3" />
                  {user.role}
                </div>

                {user.employee && (
                  <div className="mt-4 space-y-2 text-xs text-[#5F9EA0]">
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="h-3 w-3" />
                      <span>{user.employee.role.replace(/_/g, ' ')}</span>
                    </div>
                    {user.employee.department && (
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{user.employee.department}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 p-3 bg-[#F0F9F9] border border-[#B2D8D8] rounded-lg text-xs text-[#3A6F6F]">
                  <div className="flex items-center justify-between mb-2">
                    <p><strong>Profile Photo:</strong></p>
                    <button
                      onClick={() => user?.email && loadGravatarData(user.email)}
                      disabled={isLoadingGravatar}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Refresh Gravatar data - Use this if you've just updated your Gravatar profile"
                    >
                      <svg 
                        className={`w-3 h-3 ${isLoadingGravatar ? 'animate-spin' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                  <p className="mb-2 text-left">
                    Upload your own photo using the buttons above, or it will default to your Gravatar.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Gravatar Profile Details and Account Info - takes 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Account Information */}
              <div>
                <h2 className="text-xl font-semibold text-[#3A6F6F] mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-[#5F9EA0] font-medium">Account Created:</span>
                    <p className="text-[#3A6F6F]">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-[#5F9EA0] font-medium">System Role:</span>
                    <p className="text-[#3A6F6F]">{user.role}</p>
                  </div>

                  {user.employee && (
                    <>
                      <div>
                        <span className="text-[#5F9EA0] font-medium">Organization Role:</span>
                        <p className="text-[#3A6F6F]">{user.employee.role.replace(/_/g, ' ')}</p>
                      </div>
                      
                      {user.employee.department && (
                        <div>
                          <span className="text-[#5F9EA0] font-medium">Department:</span>
                          <p className="text-[#3A6F6F]">{user.employee.department}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Gravatar Status */}
              <div>
                <h2 className="text-xl font-semibold text-[#3A6F6F] mb-3">
                  Gravatar Profile
                </h2>
                
                {isLoadingGravatar ? (
                  <div className="flex items-center space-x-2 text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Checking Gravatar...</span>
                  </div>
                ) : hasGravatar ? (
                  <div className="bg-[#E8F4F8] border border-[#B2D8D8] rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-[#5F9EA0] rounded-full mr-2"></div>
                      <p className="text-[#3A6F6F] font-medium">Gravatar Profile Found!</p>
                    </div>
                    
                    {gravatarProfile ? (
                      <div className="bg-white rounded-lg p-4 border border-[#B2D8D8] space-y-4">
                        {/* Profile Name Section */}
                        {(gravatarProfile.displayName || gravatarProfile.name?.formatted) && (
                          <div className="border-b border-[#B2D8D8] pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-[#3A6F6F] font-semibold text-base">Profile Name</h4>
                            </div>
                            <div className="ml-7 space-y-1">
                              {gravatarProfile.displayName && (
                                <p className="text-gray-700 text-sm">
                                  <span className="text-[#5F9EA0] font-medium">Display Name:</span> {gravatarProfile.displayName}
                                </p>
                              )}
                              {gravatarProfile.name?.formatted && gravatarProfile.name.formatted !== gravatarProfile.displayName && (
                                <p className="text-gray-700 text-sm">
                                  <span className="text-[#5F9EA0] font-medium">Full Name:</span> {gravatarProfile.name.formatted}
                                </p>
                              )}
                              {gravatarProfile.preferredUsername && (
                                <p className="text-gray-600 text-sm">
                                  <span className="text-[#5F9EA0] font-medium">Username:</span> @{gravatarProfile.preferredUsername}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* About Me / Bio */}
                        {gravatarProfile.aboutMe && (
                          <div className="border-b border-[#B2D8D8] pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-[#3A6F6F] font-semibold text-base">About</h4>
                            </div>
                            <p className="ml-7 text-gray-700 text-sm leading-relaxed">
                              {gravatarProfile.aboutMe}
                            </p>
                          </div>
                        )}
                        
                        {/* Location */}
                        {gravatarProfile.currentLocation && (
                          <div className="border-b border-[#B2D8D8] pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-[#3A6F6F] font-semibold text-base">Location</h4>
                            </div>
                            <p className="ml-7 text-gray-700 text-sm">{gravatarProfile.currentLocation}</p>
                          </div>
                        )}
                        
                        {/* Social Links / URLs */}
                        {gravatarProfile.urls && gravatarProfile.urls.length > 0 && (
                          <div className="border-b border-[#B2D8D8] pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">🔗</span>
                              <h4 className="text-[#3A6F6F] font-semibold text-base">Links</h4>
                            </div>
                            <div className="ml-7 space-y-1.5">
                              {gravatarProfile.urls.slice(0, 6).map((url, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <svg className="w-3 h-3 text-[#5F9EA0] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                  </svg>
                                  <a 
                                    href={url.value} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#5F9EA0] hover:text-[#3A6F6F] hover:underline text-sm transition-colors truncate"
                                    title={url.value}
                                  >
                                    {url.title || url.value.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                                  </a>
                                </div>
                              ))}
                              {gravatarProfile.urls.length > 6 && (
                                <p className="text-gray-500 text-xs italic">
                                  +{gravatarProfile.urls.length - 6} more link{gravatarProfile.urls.length - 6 > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Additional Photos */}
                        {gravatarProfile.photos && gravatarProfile.photos.length > 1 && (
                          <div className="border-b border-[#B2D8D8] pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">📷</span>
                              <h4 className="text-[#3A6F6F] font-semibold text-base">Additional Photos</h4>
                            </div>
                            <div className="ml-7 flex gap-2">
                              {gravatarProfile.photos.slice(0, 4).map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo.value}
                                  alt={`Profile photo ${index + 1}`}
                                  className="w-16 h-16 rounded-md object-cover border border-[#B2D8D8] hover:border-[#5F9EA0] transition-colors"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Gravatar Profile Link */}
                        {gravatarProfile.profileUrl && (
                          <div className="pt-1">
                            <a
                              href={gravatarProfile.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[#5F9EA0] hover:text-[#3A6F6F] text-sm font-medium transition-colors group"
                            >
                              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span>View Full Gravatar Profile</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-md p-3 border border-[#B2D8D8]">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-[#5F9EA0] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-[#3A6F6F] text-sm font-medium">Your Gravatar image is available!</p>
                            <div className="mt-2 space-y-2">
                              <div className="bg-[#E8F4F8] border border-[#B2D8D8] rounded-md p-2">
                                <p className="text-[#3A6F6F] text-xs font-medium">ℹ️ Profile Privacy Setting</p>
                                <p className="text-[#5F9EA0] text-xs mt-1">
                                  This could mean: (1) Your profile is set to private, or (2) There's an API issue.
                                  Check the browser console for detailed debugging information.
                                </p>
                              </div>
                              <div className="text-xs text-gray-600">
                                <p className="mb-1">To make your profile details public:</p>
                                <ol className="list-decimal list-inside space-y-1 ml-2">
                                  <li>Visit <a href="https://gravatar.com" target="_blank" rel="noopener noreferrer" className="text-[#5F9EA0] hover:text-[#3A6F6F] hover:underline">gravatar.com</a></li>
                                  <li>Sign in to your account</li>
                                  <li>Go to "My Profile" settings</li>
                                  <li>Change your profile visibility to "Public"</li>
                                  <li>Add details like name, bio, and social links</li>
                                </ol>
                                <p className="mt-2 text-gray-500">
                                  <strong>Note:</strong> Making your profile public will allow any website to display your Gravatar information.
                                </p>
                                <div className="mt-3 pt-2 border-t border-gray-200">
                                  <button
                                    onClick={() => {
                                      if (user?.email) {
                                        const hash = gravatarService.getEmailHash(user.email);
                                        const testUrl = `https://www.gravatar.com/${hash}.json`;
                                        console.log('🧪 Manual test - Hash:', hash);
                                        console.log('🧪 Manual test - URL:', testUrl);
                                        window.open(testUrl, '_blank');
                                      }
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[#E8F4F8] text-[#3A6F6F] border border-[#B2D8D8] rounded hover:bg-[#F0F9F9] transition-colors"
                                  >
                                    🔧 Test Gravatar API
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#E8F4F8] border border-[#B2D8D8] rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-[#5F9EA0] rounded-full mr-2"></div>
                      <p className="text-[#3A6F6F] font-medium">No Gravatar Found</p>
                    </div>
                    
                    <div className="bg-white rounded-md p-3 border border-[#B2D8D8]">
                      <h4 className="text-[#3A6F6F] font-semibold text-sm mb-2">How to set your gravatar account:</h4>
      
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start space-x-2">
                          <span className="text-[#5F9EA0] font-bold">1.</span>
                          <span>Visit <a 
                            href="https://gravatar.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#5F9EA0] hover:text-[#3A6F6F] hover:underline font-medium transition-colors"
                          >
                            gravatar.com
                          </a></span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-[#5F9EA0] font-bold">2.</span>
                          <span>Sign up with this email: <code className="bg-gray-100 px-1 rounded text-xs font-mono">{user?.email}</code></span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-[#5F9EA0] font-bold">3.</span>
                          <span>Upload your photo and add your bio, name, and any social links.</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-[#5F9EA0] font-bold">4.</span>
                          <span>Refresh this page to see your Gravatar profile!</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-[#B2D8D8]">
                        <p className="text-xs text-gray-500">
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Forms - Full Width Below */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[#3A6F6F] mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                type="text"
                value={profileData.name}
                onChange={handleProfileChange}
                error={profileErrors.name}
                disabled={isUpdatingProfile}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                error={profileErrors.email}
                disabled={isUpdatingProfile}
                required
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isUpdatingProfile}
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[#3A6F6F] mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Change Password
            </h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.currentPassword}
                  disabled={isUpdatingPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-8 text-[#5F9EA0] hover:text-[#3A6F6F]"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.newPassword}
                  disabled={isUpdatingPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-8 text-[#5F9EA0] hover:text-[#3A6F6F]"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.confirmPassword}
                  disabled={isUpdatingPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-8 text-[#5F9EA0] hover:text-[#3A6F6F]"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="bg-[#E8F4F8] border border-[#B2D8D8] rounded-lg p-3 text-sm text-[#3A6F6F]">
                <ul className="space-y-1">
                  <li>• Password must be at least 6 characters long</li>
                  <li>• Use a combination of letters, numbers, and symbols</li>
                  <li>• Avoid using personal information</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isUpdatingPassword}
                  disabled={isUpdatingPassword}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isUpdatingPassword ? 'Updating...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
