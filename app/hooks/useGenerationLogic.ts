import { useState, useEffect, useRef } from 'react';
import { ApiKeyConfig as ApiKeyConfigType } from '../types';

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
    { id: 'clothing3', path: '/clothing/item3.jpg', label: 'Clothing 3', description: 'Red Christmas sweater' },
    { id: 'clothing4', path: '/clothing/item4.jpg', label: 'Clothing 4', description: 'Green long dress' },
    { id: 'clothing6', path: '/clothing/item6.jpg', label: 'Clothing 6', description: '3-piece suit, grey and black' },
    { id: 'clothing7', path: '/clothing/item7.jpg', label: 'Clothing 7', description: 'Blue and green striped skirt' },
    { id: 'clothing9', path: '/clothing/item9.jpg', label: 'Clothing 9', description: 'Cargo shorts' },
];

interface JobResult {
    status: 'completed' | 'failed' | 'pending';
    imageUrl?: string;
    error?: string;
}

export default function useGenerationLogic() {
    const [personImage, setPersonImage] = useState<File | null>(null);
    const [clothingImage, setClothingImage] = useState<File | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [apiConfig, setApiConfig] = useState<ApiKeyConfigType | null>(null);

    // States for default images
    const [selectedDefaultPerson, setSelectedDefaultPerson] = useState<string | null>(null);
    const [selectedDefaultClothing, setSelectedDefaultClothing] = useState<string | null>(null);
    const [useDefaultPerson, setUseDefaultPerson] = useState(false);
    const [useDefaultClothing, setUseDefaultClothing] = useState(false);

    // States for fullscreen modal
    const [isFullViewOpen, setIsFullViewOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

    const handleSelectDefaultPerson = (path: string) => {
        setSelectedDefaultPerson(path);
        setPersonImage(null);
        setUseDefaultPerson(true);
    };

    const handleSelectDefaultClothing = (path: string) => {
        setSelectedDefaultClothing(path);
        setClothingImage(null);
        setUseDefaultClothing(true);
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

    const pollJobStatus = async (jobId: string, timeout = 180000, interval = 3000) => {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                if (Date.now() - startTime > timeout) {
                    clearInterval(intervalId);
                    reject(new Error("Image generation timed out. Please try again."));
                    return;
                }

                try {
                    setLoadingStatus('Checking job status...');
                    const response = await fetch(`/api/status/${jobId}`);
                    const data = await response.json();

                    if (data.status === 'completed') {
                        setLoadingStatus('Almost there! Your image is ready.');
                        clearInterval(intervalId);
                        resolve(data);
                    } else if (data.status === 'failed') {
                        clearInterval(intervalId);
                        reject(new Error(data.error || 'Image generation failed.'));
                    } else if (data.status === 'pending') {
                        setLoadingStatus('Job is queued...');
                    } else {
                        setLoadingStatus('Processing image...');
                    }
                } catch (err) {
                    clearInterval(intervalId);
                    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                    reject(new Error(`Failed to check job status: ${errorMessage}`));
                }
            }, interval);
        });
    };

    const handleSubmit = async () => {
        if ((!useDefaultClothing && !clothingImage) || (!useDefaultPerson && !personImage)) {
            setError('Please select or upload both a clothing item and a person image.');
            return;
        }

        if (!apiConfig) {
            setError('Please configure your API key first');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResultImage(null);
        setLoadingStatus('Preparing your images...');

        try {
            const formData = new FormData();

            if (useDefaultPerson && selectedDefaultPerson) {
                const personFile = await fetchImageAsFile(selectedDefaultPerson, 'default-person.jpg');
                formData.append('personImage', personFile);
            } else if (personImage) {
                formData.append('personImage', personImage);
            }

            if (useDefaultClothing && selectedDefaultClothing) {
                const clothingFile = await fetchImageAsFile(selectedDefaultClothing, 'default-clothing.jpg');
                formData.append('clothingImage', clothingFile);
            } else if (clothingImage) {
                formData.append('clothingImage', clothingImage);
            }

            formData.append('apiKey', apiConfig.apiKey);

            setLoadingStatus('Uploading and starting generation...');
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({ error: 'Failed to start generation job.' }));
                throw new Error(data.error || 'Could not start the generation process.');
            }

            const { jobId } = await response.json();

            if (!jobId) {
                throw new Error('Did not receive a job ID from the server.');
            }

            setLoadingStatus('Generation started! Waiting for the result...');
            const result = await pollJobStatus(jobId) as JobResult;

            if (result.imageUrl) {
                const blobUrl = await convertBase64ToBlobUrl(result.imageUrl);
                setResultImage(blobUrl);
            } else {
                throw new Error('The final result did not contain an image URL.');
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate image');
            console.error(err);
        } finally {
            setIsLoading(false);
            setLoadingStatus('');
        }
    };

    const convertBase64ToBlobUrl = async (base64String: string): Promise<string> => {
        try {
            if (base64String && base64String.startsWith('data:')) {
                const base64Response = await fetch(base64String);
                const blob = await base64Response.blob();

                // Revoke any previous object URL to prevent memory leaks
                if (resultImage && resultImage.startsWith('blob:')) {
                    URL.revokeObjectURL(resultImage);
                }

                const blobUrl = URL.createObjectURL(blob);
                objectUrlsRef.current.push(blobUrl);
                return blobUrl;
            }
            return base64String;
        } catch (error) {
            console.error('Error converting base64 to Blob URL:', error);
            return base64String; // Fallback to the original string
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

    return {
        // State
        personImage,
        clothingImage,
        resultImage,
        isLoading,
        loadingStatus,
        error,
        apiConfig,
        selectedDefaultPerson,
        selectedDefaultClothing,
        useDefaultClothing,
        useDefaultPerson,
        isFullViewOpen,
        zoomLevel,
        position,
        isDragging,

        // Constant data
        DEFAULT_PEOPLE,
        DEFAULT_CLOTHING,

        // Handlers
        handleSelectDefaultPerson,
        handleSelectDefaultClothing,
        handleUploadPerson,
        handleUploadClothing,
        createSafeObjectUrl,
        handleSubmit,
        handleDownloadImage,
        handleOpenFullView,
        handleCloseFullView,
        handleZoomIn,
        handleZoomOut,
        handleZoomReset,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleApiConfigured,
    };
} 