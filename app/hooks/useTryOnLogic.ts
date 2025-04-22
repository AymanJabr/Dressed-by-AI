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
    { id: 'clothing2', path: '/clothing/item2.jpg', label: 'Clothing 2', description: 'Orange/Yellowish cotton sweater' },
    { id: 'clothing3', path: '/clothing/item3.jpg', label: 'Clothing 3', description: 'Red Christmas sweater' },
    { id: 'clothing4', path: '/clothing/item4.jpg', label: 'Clothing 4', description: 'Green long dress' },
    { id: 'clothing5', path: '/clothing/item5.jpg', label: 'Clothing 5', description: 'Floral black, pink, and red dress' },
    { id: 'clothing6', path: '/clothing/item6.jpg', label: 'Clothing 6', description: '3-piece suit, grey and black' },
    { id: 'clothing7', path: '/clothing/item7.jpg', label: 'Clothing 7', description: 'Blue and green striped skirt' },
    { id: 'clothing8', path: '/clothing/item8.jpg', label: 'Clothing 8', description: 'Black leather skirt' },
    { id: 'clothing9', path: '/clothing/item9.jpg', label: 'Clothing 9', description: 'Cargo shorts' },
];

export default function useTryOnLogic() {
    const [personImage, setPersonImage] = useState<File | null>(null);
    const [clothingImage, setClothingImage] = useState<File | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiConfig, setApiConfig] = useState<ApiKeyConfigType | null>(null);
    const [modelDescription, setModelDescription] = useState<string>('');
    const [clothDescription, setClothDescription] = useState<string>('');

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

    return {
        // State
        personImage,
        clothingImage,
        resultImage,
        isLoading,
        error,
        apiConfig,
        modelDescription,
        clothDescription,
        selectedDefaultPerson,
        selectedDefaultClothing,
        useDefaultPerson,
        useDefaultClothing,
        isFullViewOpen,
        zoomLevel,
        position,
        isDragging,

        // Constant data
        DEFAULT_PEOPLE,
        DEFAULT_CLOTHING,

        // Handlers
        handleModelDescriptionChange,
        handleClothDescriptionChange,
        handleSelectDefaultPerson,
        handleSelectDefaultClothing,
        handleUploadPerson,
        handleUploadClothing,
        createSafeObjectUrl,
        reset,
        handleSubmit,
        handleReset,
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