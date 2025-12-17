// import React, { useEffect, useState } from 'react';
// import { Navigate, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { TailChase } from 'ldrs/react';
// import { useLegacyUpload } from '../../context/LegacyUploadContext';
// import { StepProgress } from './StepProgress';
// import { UPLOAD_TOKEN, UPLOAD_URL } from '../../utils/config';
// import './VideoUploadStep3.scss';

// function VideoUploadStep3() {
//   const {
//     videoFile,
//     uploadId,
//     uploadStatus,
//     thumbnailFile,
//     videoDuration,
//     step,
//     setStep,
    
//     // Auto-submit state
//     onSaveClicked,
//     getSaveButtonText,
//     canSave,
//     isWaitingForUpload,
//     isReadyToSubmit,
//     isSubmitting,
//     setIsSubmitting,
//     userWantsToSubmit,
//     uploadVideoProgress,
//     videoId,
//     setVideoId,
//     setPermlink,
//     resetUploadState,
//   } = useLegacyUpload();

//   const navigate = useNavigate();
//   const user = localStorage.getItem('user_id');

//   // Form state
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [tags, setTags] = useState('');
//   const [community, setCommunity] = useState('');
//   const [isNsfw, setIsNsfw] = useState(false);
//   const [language, setLanguage] = useState('en');

//   useEffect(() => {
//     setStep(3);
//   }, []);

//   // Redirect if no video file
//   if (!videoFile) {
//     return <Navigate to="/studio" replace />;
//   }

//   // ============================================
//   // FINALIZE UPLOAD (Called automatically)
//   // ============================================

//   const uploadVideoTo3Speak = async (formData) => {
//     console.log('📤 Starting finalize upload...', formData);
    
//     setIsSubmitting(true);

//     try {
//       // 1️⃣ Finalize the video
//       const response = await fetch(`${UPLOAD_URL}/api/upload/finalize`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${UPLOAD_TOKEN}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           upload_id: uploadId,
//           owner: user,
//           title: formData.title,
//           description: formData.description,
//           tags: formData.tags,
//           community: formData.community || null,
//           language: formData.language || 'en',
//           isNsfw: formData.isNsfw || false,
//           duration: Math.round(videoDuration),
//           size: videoFile.size,
//           originalFilename: videoFile.name
//         })
//       });

//       const result = await response.json();
//       console.log('Finalize result:', result);

//       if (!result.success) {
//         throw new Error(result.error || 'Failed to finalize upload');
//       }

//       setVideoId(result.data.video_id);
//       setPermlink(result.data.permlink);

//       // 2️⃣ Upload thumbnail if exists
//       if (thumbnailFile) {
//         await uploadThumbnail(result.data.video_id);
//       }

//       // 3️⃣ Success!
//       toast.success('Video posted successfully! 🎉');
      
//       // Navigate to success page or video page
//       setTimeout(() => {
//         resetUploadState();
//         navigate(`/watch/${result.data.permlink}`);
//       }, 2000);

//     } catch (err) {
//       console.error('Finalize error:', err);
//       toast.error(err.message || 'Failed to post video');
//       setIsSubmitting(false);
//     }
//   };

//   // ============================================
//   // UPLOAD THUMBNAIL
//   // ============================================

//   const uploadThumbnail = async (videoId) => {
//     try {
//       const formData = new FormData();
//       formData.append('thumbnail', thumbnailFile);

//       const response = await fetch(
//         `${UPLOAD_URL}/api/upload/thumbnail/${videoId}`,
//         {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${UPLOAD_TOKEN}`,
//           },
//           body: formData
//         }
//       );

//       const result = await response.json();
      
//       if (!result.success) {
//         console.warn('Thumbnail upload failed:', result.error);
//       } else {
//         console.log('✅ Thumbnail uploaded');
//       }
//     } catch (err) {
//       console.warn('Thumbnail upload error:', err);
//     }
//   };

//   // ============================================
//   // HANDLE SAVE/POST CLICK
//   // ============================================

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Validate form
//     if (!title.trim()) {
//       toast.error('Please enter a title');
//       return;
//     }

//     if (title.length < 3) {
//       toast.error('Title must be at least 3 characters');
//       return;
//     }

//     if (title.length > 250) {
//       toast.error('Title must be less than 250 characters');
//       return;
//     }

//     const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
//     if (tagArray.length > 25) {
//       toast.error('Maximum 25 tags allowed');
//       return;
//     }

//     // Prepare form data
//     const formDataToSubmit = {
//       title: title.trim(),
//       description: description.trim(),
//       tags: tagArray,
//       community: community.trim(),
//       isNsfw,
//       language
//     };

//     // Call onSaveClicked which handles the auto-submit logic
//     onSaveClicked(formDataToSubmit);
//   };

//   // ============================================
//   // AUTO-SUBMIT WHEN READY
//   // ============================================

//   useEffect(() => {
//     if (isReadyToSubmit && !isSubmitting) {
//       console.log('🚀 Auto-submitting now!');
      
//       // Get the saved form data from context
//       const { formData } = useLegacyUpload();
//       if (formData) {
//         uploadVideoTo3Speak(formData);
//       }
//     }
//   }, [isReadyToSubmit, isSubmitting]);

//   return (
//     <div className="studio-main-container">
//       <div className="studio-page-header">
//         <h1>Upload Video</h1>
//         <p>Follow the steps below to upload and publish your video</p>
//       </div>

//       <StepProgress step={step} />

//       <div className="studio-page-content">
//         <div className="upload-step">
//           <div className="upload-step__header">
//             <h2 className="upload-step__title">Video Details</h2>
//             <p className="upload-step__subtitle">
//               Add information about your video
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="upload-step__content">
            
//             {/* Title */}
//             <div className="form-group">
//               <label className="label">Title *</label>
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Enter video title"
//                 className="input"
//                 maxLength={250}
//                 disabled={isSubmitting}
//                 required
//               />
//               <span className="char-count">{title.length}/250</span>
//             </div>

//             {/* Description */}
//             <div className="form-group">
//               <label className="label">Description</label>
//               <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 placeholder="Describe your video..."
//                 className="textarea"
//                 rows={6}
//                 maxLength={50000}
//                 disabled={isSubmitting}
//               />
//               <span className="char-count">{description.length}/50000</span>
//             </div>

//             {/* Tags */}
//             <div className="form-group">
//               <label className="label">Tags (comma-separated)</label>
//               <input
//                 type="text"
//                 value={tags}
//                 onChange={(e) => setTags(e.target.value)}
//                 placeholder="gaming, tutorial, vlog"
//                 className="input"
//                 disabled={isSubmitting}
//               />
//               <span className="hint">Up to 25 tags</span>
//             </div>

//             {/* Community */}
//             <div className="form-group">
//               <label className="label">Community (optional)</label>
//               <input
//                 type="text"
//                 value={community}
//                 onChange={(e) => setCommunity(e.target.value)}
//                 placeholder="hive-123456"
//                 className="input"
//                 disabled={isSubmitting}
//               />
//             </div>

//             {/* Language */}
//             <div className="form-group">
//               <label className="label">Language</label>
//               <select
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//                 className="select"
//                 disabled={isSubmitting}
//               >
//                 <option value="en">English</option>
//                 <option value="es">Spanish</option>
//                 <option value="fr">French</option>
//                 <option value="de">German</option>
//                 <option value="pt">Portuguese</option>
//                 {/* Add more languages */}
//               </select>
//             </div>

//             {/* NSFW */}
//             <div className="form-group">
//               <label className="checkbox-label">
//                 <input
//                   type="checkbox"
//                   checked={isNsfw}
//                   onChange={(e) => setIsNsfw(e.target.checked)}
//                   disabled={isSubmitting}
//                 />
//                 <span>Mark as NSFW (18+)</span>
//               </label>
//             </div>

//             {/* Waiting Overlay */}
//             {isWaitingForUpload && (
//               <div className="waiting-overlay">
//                 <h3>✅ Your post is saved!</h3>
//                 <p>Waiting for upload to complete...</p>
//                 <div className="progress-bar">
//                   <div
//                     className="progress-fill"
//                     style={{ width: `${uploadVideoProgress}%` }}
//                   />
//                 </div>
//                 <p className="progress-text">
//                   {Math.round(uploadVideoProgress)}% uploaded
//                 </p>
//               </div>
//             )}

//             {/* Submit Button */}
//             <div className="upload-step__actions">
//               <button
//                 type="submit"
//                 className="button button-primary"
//                 disabled={!canSave || !title.trim()}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <TailChase size="20" speed="1.75" color="white" />
//                     <span style={{ marginLeft: '8px' }}>Posting...</span>
//                   </>
//                 ) : (
//                   getSaveButtonText()
//                 )}
//               </button>

//               {userWantsToSubmit && !uploadStatus && (
//                 <p className="status-text">
//                   Upload progress: {Math.round(uploadVideoProgress)}%
//                 </p>
//               )}
//             </div>

//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default VideoUploadStep3;