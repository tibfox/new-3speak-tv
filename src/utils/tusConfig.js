/**
 * TUS Upload Configuration
 * 
 * Optimized for high-bandwidth servers (1.4 Gbps+)
 * These settings maximize upload speed by:
 * - Using larger chunks to reduce HTTP overhead
 * - Sending data with the creation request
 * 
 * NOTE: parallelUploads is disabled because it requires the TUS
 * concatenation extension and the server needs to allow the
 * 'upload-concat' header in CORS. Enable it once server CORS is updated.
 */

// Chunk size in bytes (50MB = optimal for large video files)
// Larger chunks = fewer HTTP requests = faster uploads
export const TUS_CHUNK_SIZE = 50 * 1024 * 1024; // 50MB

// Number of parallel chunk uploads
// DISABLED: Server CORS doesn't allow 'upload-concat' header yet
// TODO: Enable once server CORS is updated to allow 'upload-concat'
export const TUS_PARALLEL_UPLOADS = 1; // Was: 3

// Retry delays in milliseconds
// Shorter initial retries for quick recovery from transient errors
export const TUS_RETRY_DELAYS = [0, 1000, 3000, 5000, 10000];

// Whether to send first chunk with creation request
// Saves one round-trip, slightly faster start
export const TUS_UPLOAD_DATA_DURING_CREATION = true;

/**
 * Get optimized TUS upload options
 * @param {Object} customOptions - Custom options to merge
 * @returns {Object} TUS upload configuration
 */
export function getTusUploadOptions(customOptions = {}) {
  return {
    chunkSize: TUS_CHUNK_SIZE,
    parallelUploads: TUS_PARALLEL_UPLOADS,
    retryDelays: TUS_RETRY_DELAYS,
    uploadDataDuringCreation: TUS_UPLOAD_DATA_DURING_CREATION,
    ...customOptions,
  };
}

/**
 * Configuration for thumbnail uploads (smaller files)
 * Uses smaller chunks since thumbnails are typically < 5MB
 */
export const TUS_THUMBNAIL_CONFIG = {
  chunkSize: 5 * 1024 * 1024, // 5MB (thumbnails are small)
  parallelUploads: 1,
  retryDelays: TUS_RETRY_DELAYS,
  uploadDataDuringCreation: true,
};
