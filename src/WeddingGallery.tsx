import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { supabase } from './supabase'
import './App.css'

type WeddingGalleryProps = {
  onBack: () => void
}

type GalleryPhoto = {
  name: string
  url: string
}

type FacingMode = 'user' | 'environment'

const BUCKET_NAME = 'wedding-photos'
const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function WeddingGallery({ onBack }: WeddingGalleryProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraFacing, setCameraFacing] =
    useState<FacingMode>('environment')
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const loadPhotos = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      setMessage(`Unable to load photos: ${error.message}`)
      setLoading(false)
      return
    }

    const imageFiles = (data ?? []).filter(
      (file) =>
        file.name &&
        /\.(jpe?g|png|webp)$/i.test(file.name)
    )

    const galleryPhotos = imageFiles.map((file) => {
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.name)

      return {
        name: file.name,
        url: publicData.publicUrl,
      }
    })

    setPhotos(galleryPhotos)
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadPhotos()
  }, [loadPhotos])

  // Start the live camera when the camera panel opens,
  // or restart it when the guest switches cameras.
  useEffect(() => {
    if (!cameraOpen || capturedPhoto) return

    let cancelled = false

    async function startCamera() {
      setCameraLoading(true)
      setCameraError('')
      stopCamera()

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            'Live camera access is unavailable. Open this website using HTTPS or localhost in a supported browser.'
          )
        }

        let stream: MediaStream

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: { exact: cameraFacing },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          })
        } catch (error) {
          // Some devices do not expose the requested camera mode.
          // Retry with a preference instead of an exact requirement.
          if (
            error instanceof DOMException &&
            [
              'OverconstrainedError',
              'NotFoundError',
              'ConstraintNotSatisfiedError',
            ].includes(error.name)
          ) {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                facingMode: cameraFacing,
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
            })
          } else {
            throw error
          }
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (error) {
        if (cancelled) return

        const cameraMessage =
          error instanceof Error ? error.message : ''

        if (
          error instanceof DOMException &&
          error.name === 'NotAllowedError'
        ) {
          setCameraError(
            'Camera permission was denied. Allow camera access in your browser settings and try again.'
          )
        } else if (
          error instanceof DOMException &&
          error.name === 'NotFoundError'
        ) {
          setCameraError(
            'No available camera was found on this device.'
          )
        } else if (
          error instanceof DOMException &&
          error.name === 'NotReadableError'
        ) {
          setCameraError(
            'The camera may be in use by another app. Close that app and try again.'
          )
        } else {
          setCameraError(
            cameraMessage || 'Unable to start the camera. Please try again.'
          )
        }
      } finally {
        if (!cancelled) setCameraLoading(false)
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [cameraOpen, cameraFacing, capturedPhoto, stopCamera])

  function openCamera() {
    setMessage('')
    setCameraError('')
    setCapturedPhoto(null)
    setCameraFacing('environment')
    setCameraOpen(true)
  }

  function closeCamera() {
    stopCamera()
    setCameraOpen(false)
    setCapturedPhoto(null)
    setCameraError('')
  }

  function switchCamera() {
    setCapturedPhoto(null)
    setCameraFacing((current) =>
      current === 'environment' ? 'user' : 'environment'
    )
  }

  function takePhoto() {
    const video = videoRef.current

    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      setCameraError('The camera is not ready yet. Please wait a moment.')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    if (!context) {
      setCameraError('Unable to capture this photo. Please try again.')
      return
    }

    // Mirror the preview for the front-facing camera.
    if (cameraFacing === 'user') {
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Photo capture failed. Please try again.')
          return
        }

        setCapturedPhoto(URL.createObjectURL(blob))
        stopCamera()
      },
      'image/jpeg',
      0.92
    )
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return

    setMessage('')

    const invalidFile = files.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type) ||
        file.size > MAX_FILE_SIZE
    )

    if (invalidFile) {
      setMessage(
        'Please use JPG, PNG, or WebP photos. Each photo must be 8 MB or smaller.'
      )
      return
    }

    setUploading(true)

    let uploadedCount = 0
    let uploadError = ''

    try {
      for (const file of files) {
        const safeName = file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          '-'
        )

        const filePath =
          `${Date.now()}-${crypto.randomUUID()}-${safeName}`

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          })

        if (error) {
          uploadError = error.message
          break
        }

        uploadedCount++
      }

      if (uploadedCount > 0) {
        await loadPhotos()
      }

      if (uploadError) {
        setMessage(
          `${uploadedCount} photo(s) uploaded. An upload failed: ${uploadError}`
        )
      } else {
        setMessage(
          `${uploadedCount} photo(s) uploaded successfully. Thank you for sharing your memories!`
        )
      }
    } catch {
      setMessage('An unexpected error occurred during upload. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function uploadCapturedPhoto() {
    if (!capturedPhoto) return

    try {
      const response = await fetch(capturedPhoto)
      const blob = await response.blob()

      const photo = new File(
        [blob],
        `mary-prince-${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      )

      closeCamera()
      await uploadFiles([photo])
    } catch {
      setMessage('Unable to prepare your photo. Please take it again.')
    }
  }

  async function handleGallerySelection(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const input = event.currentTarget
    const files = Array.from(input.files ?? [])

    await uploadFiles(files)
    input.value = ''
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <section className="gallery-page">
      <div className="gallery-content">
        <p className="eyebrow">MARY &amp; PRINCE</p>

        <h1 className="gallery-title">Our Wedding Gallery</h1>

        <div className="gallery-divider" />

        <p className="gallery-description">
          A celebration of love, faith, and the beginning of our forever.
        </p>

        <div className="gallery-upload">
          <p className="gallery-kicker">SHARE THE JOY</p>

          <h2 className="gallery-upload-title">
            Be part of our memories
          </h2>

          <p className="gallery-upload-description">
            Capture a beautiful moment or share a photo from your phone.
            Every memory makes our celebration more special.
          </p>

          <div className="gallery-upload-actions">
            <button
              type="button"
              className="camera-button"
              onClick={openCamera}
              disabled={uploading}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>OPEN CAMERA</span>
            </button>

            <button
              type="button"
              className="gallery-picker-button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading}
            >
              <span aria-hidden="true">▧</span>
              <span>CHOOSE FROM GALLERY</span>
            </button>
          </div>

          <input
            ref={galleryInputRef}
            className="gallery-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={handleGallerySelection}
            aria-label="Choose photos from your phone"
          />

          {uploading && (
            <p className="gallery-progress" role="status">
              Uploading your photo...
            </p>
          )}
        </div>

        {message && (
          <p className="gallery-status" role="status" aria-live="polite">
            {message}
          </p>
        )}

        <div className="gallery-results">
          {loading ? (
            <p>Loading wedding memories...</p>
          ) : photos.length === 0 ? (
            <p>No wedding photos have been uploaded yet.</p>
          ) : (
            <div className="gallery-grid">
              {photos.map((photo) => (
                <button
                  type="button"
                  className="gallery-item"
                  key={photo.name}
                  onClick={() => setSelectedPhoto(photo.url)}
                  aria-label={`View ${photo.name}`}
                >
                  <img
                    src={photo.url}
                    alt="Mary and Prince's wedding memory"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← BACK TO HOME
        </button>
      </div>

      {cameraOpen && (
        <div
          className="camera-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-title"
        >
          <div className="camera-panel">
            <div className="camera-panel-header">
              <div>
                <p className="gallery-kicker">MARY &amp; PRINCE</p>
                <h2 id="camera-title">Capture the moment</h2>
              </div>

              <button
                type="button"
                className="camera-close"
                onClick={closeCamera}
                aria-label="Close camera"
              >
                ×
              </button>
            </div>

            <div className="camera-viewfinder">
              {capturedPhoto ? (
                <img
                  className="camera-captured-image"
                  src={capturedPhoto}
                  alt="Preview of your captured wedding photo"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="camera-video"
                    autoPlay
                    playsInline
                    muted
                  />

                  {cameraLoading && (
                    <p className="camera-message">
                      Starting camera...
                    </p>
                  )}

                  {cameraError && (
                    <div className="camera-error">
                      <p>{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setCameraError('')
                          setCameraFacing((current) => current)
                        }}
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <p className="camera-hint">
              {capturedPhoto
                ? 'Review your photo before sharing it.'
                : cameraFacing === 'environment'
                  ? 'Rear camera'
                  : 'Front camera'}
            </p>

            <div className="camera-controls">
              {capturedPhoto ? (
                <>
                  <button
                    type="button"
                    className="camera-secondary-action"
                    disabled={uploading}
                    onClick={() => {
                      URL.revokeObjectURL(capturedPhoto)
                      setCapturedPhoto(null)
                    }}
                  >
                    RETAKE
                  </button>

                  <button
                    type="button"
                    className="camera-primary-action"
                    disabled={uploading}
                    onClick={uploadCapturedPhoto}
                  >
                    {uploading ? 'UPLOADING...' : 'USE THIS PHOTO'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="camera-secondary-action"
                    disabled={cameraLoading || Boolean(cameraError)}
                    onClick={switchCamera}
                  >
                    <span aria-hidden="true">↻</span>
                    SWITCH CAMERA
                  </button>

                  <button
                    type="button"
                    className="camera-shutter"
                    disabled={cameraLoading || Boolean(cameraError)}
                    onClick={takePhoto}
                    aria-label="Take photo"
                  >
                    <span />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div
          className="gallery-lightbox"
          onClick={() => setSelectedPhoto(null)}
          role="presentation"
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close photo"
          >
            ×
          </button>

          <img
            src={selectedPhoto}
            alt="Wedding photo enlarged"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}

export default WeddingGallery
