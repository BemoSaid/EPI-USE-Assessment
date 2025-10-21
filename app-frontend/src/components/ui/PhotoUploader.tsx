import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { useToast } from '../../context/ToastContext';
import { photoService } from '../../services/photoService';

interface PhotoUploaderProps {
  currentPhotoUrl?: string;
  userId: string;
  onPhotoUpdate: (photoUrl: string | null) => void;
  className?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  currentPhotoUrl,
  userId,
  onPhotoUpdate,
  className = ''
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);

    try {
      console.log('Starting photo upload process...');
      
      // Upload to Supabase
      console.log('Step 1: Uploading to Supabase...');
      const { url } = await photoService.uploadPhoto(file, userId);
      console.log('Step 1 SUCCESS: Supabase upload completed, URL:', url);
      
      // Update profile in backend
      console.log('Step 2: Updating profile in backend...');
      await photoService.updateProfilePhoto(url);
      console.log('Step 2 SUCCESS: Backend update completed');
      
      onPhotoUpdate(url);
      setPreviewUrl(null);
      showToast('Profile photo updated successfully!', 'success');
    } catch (error: any) {
      console.error('Photo upload failed at step:', error);
      console.error('Full error details:', error.response || error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload photo';
      showToast(errorMessage, 'error');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    setIsUploading(true);

    try {
      await photoService.removeProfilePhoto();
      onPhotoUpdate(null);
      showToast('Profile photo removed', 'success');
    } catch (error: any) {
      console.error('Photo removal failed:', error);
      showToast(error.message || 'Failed to remove photo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraCapture = async () => {
    try {
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      setStream(mediaStream);
      setShowCameraModal(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Camera access error:', error);
      showToast('Unable to access camera. Please check permissions or use file upload instead.', 'error');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          closeCamera();
          await handleFileSelect(file);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCameraModal(false);
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />

        {/* Upload overlay */}
        {(isUploading || previewUrl) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center z-10">
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Check className="h-6 w-6 text-green-500" />
            )}
          </div>
        )}

        {/* Upload buttons */}
        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={triggerFileUpload}
            disabled={isUploading}
            className="rounded-full p-2 bg-white shadow-lg border-2 border-[#B2D8D8] hover:bg-[#F0F9F9]"
            title="Upload from device"
          >
            <Upload className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={triggerCameraCapture}
            disabled={isUploading}
            className="rounded-full p-2 bg-white shadow-lg border-2 border-[#B2D8D8] hover:bg-[#F0F9F9]"
            title="Take photo"
          >
            <Camera className="h-3 w-3" />
          </Button>

          {currentPhotoUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="rounded-full p-2 bg-white shadow-lg border-2 border-red-200 hover:bg-red-50 text-red-600"
              title="Remove photo"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Take a Photo</h3>
              <button
                onClick={closeCamera}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-4 flex justify-center gap-3">
              <Button
                onClick={capturePhoto}
                className="flex items-center gap-2 bg-[#5F9EA0] hover:bg-[#6FB7B7] text-white"
              >
                <Camera className="h-4 w-4" />
                Capture Photo
              </Button>
              <Button
                variant="outline"
                onClick={closeCamera}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
