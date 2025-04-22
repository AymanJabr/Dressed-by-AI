'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeyConfig from './components/ApiKeyConfig';
import { ApiKeyConfig as ApiKeyConfigType } from './types';

// Default models with descriptions
const DEFAULT_PEOPLE = [
  { id: 'person1', path: '/people/person1.jpg', label: 'Person 1', description: 'Young woman with brown hair, hands on hips' },
  { id: 'person2', path: '/people/person2.jpg', label: 'Person 2', description: 'Asian woman, waevy black hair' },
  { id: 'person3', path: '/people/person3.jpg', label: 'Person 3', description: 'Stylish man, short black hair' },
  { id: 'person4', path: '/people/person4.jpg', label: 'Person 4', description: 'Asian fat business man, bending slightly' },
  { id: 'person5', path: '/people/person5.jpg', label: 'Person 5', description: 'Thin Asian woman, black straight hair' },
  { id: 'person6', path: '/people/person6.jpg', label: 'Person 6', description: 'Small caucasian woman, blonde short hair, hands on hips' },
];

const DEFAULT_CLOTHING = [
  { id: 'clothing1', path: '/clothing/item1.jpg', label: 'Clothing 1', description: 'Black NASA logo t-shirt' },
  { id: 'clothing2', path: '/clothing/item2.jpg', label: 'Clothing 2', description: 'Orange/Yellowish cotton sweater' },
  { id: 'clothing3', path: '/clothing/item3.jpg', label: 'Clothing 3', description: 'Red Christmas sweater' },
  { id: 'clothing4', path: '/clothing/item4.jpg', label: 'Clothing 4', description: 'Green long dress' },
  { id: 'clothing5', path: '/clothing/item5.jpg', label: 'Clothing 5', description: 'Floral black, pink, and red dress' },
  { id: 'clothing6', path: '/clothing/item6.jpg', label: 'Clothing 6', description: '3-piece suit, grey and black' },
  { id: 'clothing7', path: '/clothing/item7.jpg', label: 'Clothing 7', description: 'Blue and green striped skirt' },
  { id: 'clothing8', path: '/clothing/item8.jpg', label: 'Clothing 8', description: 'Black leather skirt' },
  { id: 'clothing9', path: '/clothing/item9.jpg', label: 'Clothing 9', description: 'Cargo shorts' },
];

export default function Home() {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiKeyConfigType | null>(null);
  const [modelDescription, setModelDescription] = useState<string>('');
  const [clothDescription, setClothDescription] = useState<string>('');
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // States for default images
  const [selectedDefaultPerson, setSelectedDefaultPerson] = useState<string | null>(null);
  const [selectedDefaultClothing, setSelectedDefaultClothing] = useState<string | null>(null);
  const [useDefaultPerson, setUseDefaultPerson] = useState(false);
  const [useDefaultClothing, setUseDefaultClothing] = useState(false);

  // Refs to store URLs that need to be revoked when component unmounts
  const objectUrlsRef = useRef<string[]>([]);

  // Cleanup function to release object URLs
  useEffect(() => {
    return () => {
      // Clean up any ObjectURLs to prevent memory leaks
      objectUrlsRef.current.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const handleModelDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelDescription(e.target.value);
  };

  const handleClothDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClothDescription(e.target.value);
  };

  const handleSelectDefaultPerson = (path: string, index: number) => {
    setSelectedDefaultPerson(path);
    setPersonImage(null);
    setUseDefaultPerson(true);
    setModelDescription(DEFAULT_PEOPLE[index].description);
  };

  const handleSelectDefaultClothing = (path: string, index: number) => {
    setSelectedDefaultClothing(path);
    setClothingImage(null);
    setUseDefaultClothing(true);
    setClothDescription(DEFAULT_CLOTHING[index].description);
  };

  const handleUploadPerson = (file: File | null) => {
    // Clean up previous ObjectURL if exists
    if (personImage && !selectedDefaultPerson) {
      const oldUrl = URL.createObjectURL(personImage);
      if (objectUrlsRef.current.includes(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        objectUrlsRef.current = objectUrlsRef.current.filter(url => url !== oldUrl);
      }
    }

    if (file) {
      setPersonImage(file);
      setSelectedDefaultPerson(null);
      setUseDefaultPerson(false);
      // Clear the model description when uploading own image
      setModelDescription('');
    } else {
      setPersonImage(null);
    }
  };

  const handleUploadClothing = (file: File | null) => {
    // Clean up previous ObjectURL if exists
    if (clothingImage && !selectedDefaultClothing) {
      const oldUrl = URL.createObjectURL(clothingImage);
      if (objectUrlsRef.current.includes(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        objectUrlsRef.current = objectUrlsRef.current.filter(url => url !== oldUrl);
      }
    }

    if (file) {
      setClothingImage(file);
      setSelectedDefaultClothing(null);
      setUseDefaultClothing(false);
      // Clear the cloth description when uploading own image
      setClothDescription('');
    } else {
      setClothingImage(null);
    }
  };

  // Create a safe URL for an image file, tracking it for cleanup
  const createSafeObjectUrl = (file: File | null): string | null => {
    if (!file) return null;

    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  };

  const fetchImageAsFile = async (url: string, fileName: string): Promise<File> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  };

  const reset = () => {
    // Allow user to try again after an error or if they want to generate a new image
    setIsLoading(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!useDefaultClothing && !clothingImage) {
      setError('Please select or upload a clothing item image');
      return;
    }

    if (!apiConfig) {
      setError('Please configure your API key first');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Don't clear resultImage until we receive a new one to avoid UI flicker
    // setResultImage(null);

    try {
      const formData = new FormData();

      // Handle person image (default or uploaded) - optional in Segfit v1.1
      if (useDefaultPerson && selectedDefaultPerson) {
        const personFile = await fetchImageAsFile(selectedDefaultPerson, 'default-person.jpg');
        formData.append('personImage', personFile);
      } else if (personImage) {
        formData.append('personImage', personImage);
      }

      // Handle clothing image (default or uploaded) - required
      if (useDefaultClothing && selectedDefaultClothing) {
        const clothingFile = await fetchImageAsFile(selectedDefaultClothing, 'default-clothing.jpg');
        formData.append('clothingImage', clothingFile);
      } else if (clothingImage) {
        formData.append('clothingImage', clothingImage);
      }

      formData.append('apiKey', apiConfig.apiKey);

      // Add descriptions if they exist
      if (modelDescription) {
        formData.append('modelDescription', modelDescription);
      }

      if (clothDescription) {
        formData.append('clothDescription', clothDescription);
      }

      console.log('🔄 Sending request to API endpoint');
      const startTime = Date.now();

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      });

      const requestDuration = Date.now() - startTime;
      console.log(`✅ Received API response in ${requestDuration}ms`);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      console.log('🔄 Processing API response data');
      const parseStartTime = Date.now();

      const data = await response.json();

      const parseEndTime = Date.now();
      console.log(`✅ Parsed JSON response in ${parseEndTime - parseStartTime}ms`);

      if (!data.imageUrl) {
        throw new Error('Response did not contain an image URL');
      }

      // Log the size of the received data
      if (data.imageUrl) {
        const imageSize = data.imageUrl.length;
        console.log(`📊 Received image URL of size: ${(imageSize / 1024 / 1024).toFixed(2)} MB`);
      }

      // Try to optimize the image storage by converting to a Blob URL instead of keeping the base64
      try {
        console.log('🔄 Converting base64 to Blob URL to save memory');
        const optimizeStartTime = Date.now();

        if (data.imageUrl && data.imageUrl.startsWith('data:')) {
          const base64Response = await fetch(data.imageUrl);
          const blob = await base64Response.blob();

          // Revoke any previous object URL to prevent memory leaks
          if (resultImage && resultImage.startsWith('blob:')) {
            URL.revokeObjectURL(resultImage);
          }

          // Create a blob URL which is more memory efficient
          const blobUrl = URL.createObjectURL(blob);
          objectUrlsRef.current.push(blobUrl);

          const optimizeEndTime = Date.now();
          console.log(`✅ Converted to Blob URL in ${optimizeEndTime - optimizeStartTime}ms`);
          console.log(`Blob size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

          // Set the blob URL instead of the base64 string
          setResultImage(blobUrl);
        } else {
          // Fall back to using the original imageUrl if it's not a data URL
          setResultImage(data.imageUrl);
        }
      } catch (optimizeError) {
        console.error('Error optimizing image:', optimizeError);
        // Fall back to using the original imageUrl
        setResultImage(data.imageUrl);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResultImage(null);
    setError(null);
    // Clear URLs from memory
    if (resultImage && resultImage.startsWith('blob:')) {
      URL.revokeObjectURL(resultImage);
    }
  };

  const handleDownloadImage = () => {
    if (resultImage) {
      // Create an anchor element
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = 'dressed-by-ai-outfit.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleOpenFullView = () => {
    setIsFullViewOpen(true);
    // Reset zoom and position when opening the modal
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCloseFullView = () => {
    setIsFullViewOpen(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));  // Max zoom of 3x
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 1));  // Min zoom of 1x
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApiConfigured = (config: ApiKeyConfigType) => {
    setApiConfig(config);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <div className="flex justify-center items-center mb-4">
            <Image
              src="/logo.svg"
              alt="Dressed by AI Logo"
              width={80}
              height={80}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-slate-800 dark:text-white">Dressed by AI</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Try on clothes virtually using AI image generation
          </p>
        </header>

        {!apiConfig ? (
          <div className="mb-8">
            <ApiKeyConfig onApiKeyConfigured={handleApiConfigured} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                {/* Person Selection */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Choose Person (Optional)</h2>

                  {/* Default People Models */}
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2 text-slate-700 dark:text-slate-300">Default Models</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {DEFAULT_PEOPLE.map((person, index) => (
                        <div
                          key={person.id}
                          className={`relative border-2 rounded cursor-pointer ${selectedDefaultPerson === person.path ? 'border-blue-500' : 'border-transparent'}`}
                          onClick={() => handleSelectDefaultPerson(person.path, index)}
                        >
                          <Image
                            src={person.path}
                            alt={person.label}
                            width={100}
                            height={150}
                            className="w-full h-40 object-cover rounded"
                          />
                          <p className="text-xs text-center mt-1">{person.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Or upload your own */}
                  <div>
                    <div className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Or upload your own</div>
                    <ImageUploader
                      onImageSelected={handleUploadPerson}
                      label="Upload a photo of yourself"
                      imagePreview={personImage ? createSafeObjectUrl(personImage) : null}
                    />
                  </div>

                  {/* Model Description */}
                  <div className="mt-4">
                    <label htmlFor="modelDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model Description (Optional)
                    </label>
                    <input
                      type="text"
                      id="modelDescription"
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={modelDescription}
                      onChange={handleModelDescriptionChange}
                      placeholder="Describe the person (e.g., gender, ethnicity, style)"
                    />
                  </div>
                </div>

                {/* Clothing Selection */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Choose Clothing</h2>

                  {/* Default Clothing Items */}
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2 text-slate-700 dark:text-slate-300">Default Items</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {DEFAULT_CLOTHING.map((item, index) => (
                        <div
                          key={item.id}
                          className={`relative border-2 rounded cursor-pointer ${selectedDefaultClothing === item.path ? 'border-blue-500' : 'border-transparent'}`}
                          onClick={() => handleSelectDefaultClothing(item.path, index)}
                        >
                          <Image
                            src={item.path}
                            alt={item.label}
                            width={100}
                            height={150}
                            className="w-full h-40 object-cover rounded"
                          />
                          <p className="text-xs text-center mt-1">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Or upload your own */}
                  <div>
                    <div className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Or upload your own</div>
                    <ImageUploader
                      onImageSelected={handleUploadClothing}
                      label="Upload a clothing item"
                      imagePreview={clothingImage ? createSafeObjectUrl(clothingImage) : null}
                    />
                  </div>

                  {/* Cloth Description */}
                  <div className="mt-4">
                    <label htmlFor="clothDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Clothing Description (Optional)
                    </label>
                    <input
                      type="text"
                      id="clothDescription"
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={clothDescription}
                      onChange={handleClothDescriptionChange}
                      placeholder="Describe the clothing item (e.g., color, style, fabric)"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Result Preview */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 h-full flex flex-col">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Result Preview</h2>

                  <div className="flex-grow flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                    {isLoading ? (
                      <div className="mt-8 flex flex-col items-center">
                        <LoadingSpinner />
                        <p className="mt-3 text-slate-600 dark:text-slate-300">
                          Generating your image... This can take up to 5 minutes.
                        </p>
                      </div>
                    ) : resultImage ? (
                      <div className="mt-8 flex flex-col items-center">
                        <div className="relative max-w-md overflow-hidden rounded-lg shadow-lg">
                          <Image
                            src={resultImage}
                            alt="Generated outfit"
                            width={512}
                            height={768}
                            className="w-full h-auto"
                            unoptimized={true}
                            onLoad={() => console.log('✅ Image loaded successfully')}
                            onError={(e) => console.error('❌ Error loading image:', e)}
                          />
                          <button
                            className="absolute bottom-4 right-4 rounded-full bg-slate-700/70 p-2 text-white hover:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            onClick={() => window.open(resultImage, '_blank')}
                            aria-label="Open full size image"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={handleDownloadImage}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Download
                          </button>
                          <button
                            onClick={handleOpenFullView}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Full View
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <p>Your result will appear here</p>
                      </div>
                    )}

                    {error && (
                      <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || (!clothingImage && !useDefaultClothing)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                    >
                      {isLoading ? 'Generating...' : 'Generate Try-On'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
              <p>Powered by Segmind's Segfit v1.1 API</p>
            </div>
          </>
        )}
      </div>

      {/* Full View Modal */}
      {isFullViewOpen && resultImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div
            className="relative max-w-4xl max-h-[90vh] overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
          >
            <div style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out',
              position: 'relative',
              left: `${position.x}px`,
              top: `${position.y}px`
            }}>
              <Image
                src={resultImage}
                alt="Generated outfit full view"
                width={1024}
                height={1536}
                className="max-w-full max-h-[85vh] object-contain"
                unoptimized={true}
                style={{ pointerEvents: 'none' }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={handleCloseFullView}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              aria-label="Close full view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-lg flex items-center p-2 space-x-3">
              <button
                onClick={handleZoomOut}
                className="text-white p-1 hover:bg-gray-700 rounded"
                disabled={zoomLevel <= 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>

              <button
                onClick={handleZoomReset}
                className="text-white px-2 py-1 hover:bg-gray-700 rounded text-sm"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                onClick={handleZoomIn}
                className="text-white p-1 hover:bg-gray-700 rounded"
                disabled={zoomLevel >= 3}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
