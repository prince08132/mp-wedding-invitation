
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import { supabase } from './supabase';

const BUCKET_NAME = 'wedding-videos';
const MAX_FILE_SIZE = 50 * 1024 * 1024;

type WeddingVideo = {
  id: string;
  title: string;
  file_path: string;
  created_at: string;
};

type VideosProps = {
  onBack: () => void;
};

function Videos({ onBack }: VideosProps) {
  const [videos, setVideos] = useState<WeddingVideo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [loadError, setLoadError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // LOAD WEDDING VIDEOS
  const loadVideos = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const { data, error } = await supabase
        .from('wedding_videos')
        .select('id, title, file_path, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVideos(data || []);
    } catch (error) {
      console.error('Error loading wedding videos:', error);

      setLoadError(
        'We could not load the wedding videos. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  // HANDLE MULTIPLE VIDEO SELECTION
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    setSelectedFiles(files);
    setUploadError('');
    setSuccess('');
  }

  // GENERATE VIDEO TITLE FROM FILENAME
  function generateVideoTitle(filename: string) {
    return (
      filename
        .replace(/\.mp4$/i, '')
        .replace(/[._-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100) || 'Wedding video'
    );
  }

  // FORMAT VIDEO DATE
  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Recently shared';
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // UPLOAD MULTIPLE WEDDING VIDEOS
  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setUploadError('');
    setSuccess('');

    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one video.');
      return;
    }

    // CHECK FILE FORMATS
    const invalidFile = selectedFiles.find(
      (file) =>
        !file.name.toLowerCase().endsWith('.mp4') ||
        (file.type !== '' && file.type !== 'video/mp4')
    );

    if (invalidFile) {
      setUploadError(
        `${invalidFile.name} is not a valid MP4 video.`
      );
      return;
    }

    // CHECK INDIVIDUAL FILE SIZES
    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (oversizedFile) {
      setUploadError(
        `${oversizedFile.name} exceeds the 50 MB limit.`
      );
      return;
    }

    setUploading(true);

    let uploadedCount = 0;
    const failedFiles: File[] = [];

    try {
      // UPLOAD VIDEOS ONE AFTER ANOTHER
      for (const file of selectedFiles) {
        const generatedTitle = generateVideoTitle(file.name);

        const safeName = file.name
          .normalize('NFKD')
          .replace(/[^a-zA-Z0-9.-]/g, '-')
          .replace(/-+/g, '-')
          .slice(-120);

        const filePath = `${Date.now()}-${crypto.randomUUID()}-${safeName || 'wedding-video.mp4'}`;

        try {
          // UPLOAD VIDEO TO SUPABASE STORAGE
          const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
              contentType: 'video/mp4',
              upsert: false,
            });

          if (storageError) {
            throw storageError;
          }

          // SAVE VIDEO INFORMATION TO DATABASE
          const { error: recordError } = await supabase
            .from('wedding_videos')
            .insert({
              title: generatedTitle,
              file_path: filePath,
            });

          if (recordError) {
            throw recordError;
          }

          uploadedCount++;

        } catch (error) {
          console.error(
            `Upload failed for ${file.name}:`,
            error
          );

          failedFiles.push(file);
        }
      }

      // KEEP FAILED VIDEOS SELECTED FOR RETRY
      setSelectedFiles(failedFiles);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // DISPLAY SUCCESS MESSAGE
      if (uploadedCount > 0) {
        setSuccess(
          `${uploadedCount} video(s) uploaded successfully. Thank you for sharing!`
        );

        await loadVideos();
      }

      // DISPLAY FAILED FILES
      if (failedFiles.length > 0) {
        setUploadError(
          `${failedFiles.length} video(s) could not be uploaded: ${failedFiles
            .map((file) => file.name)
            .join(', ')}. You can retry the unsuccessful videos.`
        );
      }

      if (uploadedCount === 0 && failedFiles.length === 0) {
        setUploadError(
          'No videos were uploaded. Please select your videos and try again.'
        );
      }

    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="videos-page">
      <section className="videos-content">

        {/* BACK BUTTON */}
        <button
          type="button"
          className="videos-back-button"
          onClick={onBack}
        >
          <span aria-hidden="true">←</span>
          Back to Home
        </button>

        {/* PAGE HEADING */}
        <header className="videos-heading">
          <p className="videos-eyebrow">
            MARY &amp; PRINCE
          </p>

          <h1>Wedding Videos</h1>

          <div className="videos-divider" />

          <p>
            Share your beautiful moments and relive
            the joy of our special day.
          </p>
        </header>

        {/* VIDEO UPLOAD */}
        <form
          className="videos-upload"
          onSubmit={handleUpload}
        >
          <div
            className="videos-upload-icon"
            aria-hidden="true"
          >
            ▶
          </div>

          <p className="videos-upload-kicker">
            SHARE THE JOY
          </p>

          <h2>Be Part of Our Memories</h2>

          <p className="videos-upload-description">
            Everyone is welcome to share a special moment
            from our wedding celebration. Your memories
            mean so much to us.
          </p>

          {/* MULTIPLE VIDEO INPUT */}
          <input
            ref={fileInputRef}
            id="video-file"
            className="videos-file-input"
            type="file"
            accept="video/mp4,.mp4"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
          />

          {/* FILE PICKER */}
          <label
            htmlFor="video-file"
            className={`videos-file-picker ${
              uploading ? 'disabled' : ''
            }`}
          >
            <span
              className="videos-picker-icon"
              aria-hidden="true"
            >
              ＋
            </span>

            <span className="videos-picker-text">
              <strong>Choose your videos</strong>
              <small>
                Select one or multiple MP4 videos from your device
              </small>
            </span>

            <span
              className="videos-picker-arrow"
              aria-hidden="true"
            >
              →
            </span>
          </label>

          {/* SELECTED VIDEOS */}
          <div className="videos-selected-file">
            {selectedFiles.length > 0 ? (
              <div className="videos-selected-list">
                <strong>
                  {selectedFiles.length} video(s) selected
                </strong>

                {selectedFiles.map((file, index) => (
                  <span key={`${file.name}-${index}`}>
                    ✓ {file.name}
                  </span>
                ))}
              </div>
            ) : (
              <span>No videos selected yet</span>
            )}
          </div>

          {/* FILE INFORMATION */}
          <p className="videos-file-info">
            MP4 format only
            <span>•</span>
            Maximum size 50 MB per video
          </p>

          {/* ERROR MESSAGE */}
          {uploadError && (
            <p
              className="videos-message videos-error"
              role="alert"
            >
              {uploadError}
            </p>
          )}

          {/* SUCCESS MESSAGE */}
          {success && (
            <p
              className="videos-message videos-success"
              role="status"
            >
              {success}
            </p>
          )}

          {/* UPLOAD BUTTON */}
          <button
            type="submit"
            className="videos-upload-button"
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? (
              <>
                <span className="videos-spinner" />
                Uploading {selectedFiles.length} Video(s)...
              </>
            ) : (
              <>
                Upload {selectedFiles.length}{' '}
                {selectedFiles.length === 1 ? 'Video' : 'Videos'}
                <span aria-hidden="true"> →</span>
              </>
            )}
          </button>

          <p className="videos-privacy-note">
            Thank you for helping us preserve these beautiful memories.
          </p>
        </form>

        {/* VIDEO GALLERY */}
        <section
          className="videos-gallery"
          aria-labelledby="videos-gallery-title"
        >
          <div className="videos-gallery-heading">
            <div>
              <p className="videos-gallery-kicker">
                OUR MEMORIES
              </p>

              <h2 id="videos-gallery-title">
                Our Wedding Moments
              </h2>
            </div>

            <span className="videos-count">
              {videos.length}{' '}
              {videos.length === 1 ? 'Video' : 'Videos'}
            </span>
          </div>

          {/* LOADING */}
          {loading && (
            <p className="videos-empty">
              Loading our beautiful memories...
            </p>
          )}

          {/* LOADING ERROR */}
          {!loading && loadError && (
            <div className="videos-empty">
              <p>{loadError}</p>

              <button
                type="button"
                className="videos-retry-button"
                onClick={() => void loadVideos()}
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY GALLERY */}
          {!loading && !loadError && videos.length === 0 && (
            <div className="videos-empty">
              <span
                className="videos-empty-icon"
                aria-hidden="true"
              >
                ♡
              </span>

              <h3>Our memories begin here</h3>

              <p>
                No videos have been shared yet.
                Be the first to contribute a special moment!
              </p>
            </div>
          )}

          {/* VIDEO CARDS */}
          {!loading && !loadError && videos.length > 0 && (
            <div className="videos-grid">
              {videos.map((video) => {
                const { data } = supabase.storage
                  .from(BUCKET_NAME)
                  .getPublicUrl(video.file_path);

                return (
                  <article
                    className="video-card"
                    key={video.id}
                  >
                    <div className="video-card-media">
                      <video
                        controls
                        preload="metadata"
                        playsInline
                        src={data.publicUrl}
                        aria-label={video.title}
                      >
                        Your browser does not support video playback.
                      </video>
                    </div>

                    <div className="video-card-info">
                      <h3>{video.title}</h3>

                      <p>
                        <span aria-hidden="true">♡</span>
                        Shared on {formatDate(video.created_at)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* CLOSING MESSAGE */}
        <footer className="videos-footer">
          <span aria-hidden="true">✦</span>

          <p>With love, Mary &amp; Prince</p>

          <span aria-hidden="true">✦</span>
        </footer>

      </section>
    </main>
  );
}

export default Videos;
