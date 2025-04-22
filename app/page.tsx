'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeyConfig from './components/ApiKeyConfig';
import { ApiKeyConfig as ApiKeyConfigType } from './types';

// Default models with descriptions
const DEFAULT_PEOPLE = [
  { id: 'person1', path: '/people/person1.jpg', label: 'Person 1', description: 'Young woman with dark hair' },
  { id: 'person2', path: '/people/person2.jpg', label: 'Person 2', description: 'Asian woman with shoulder-length hair' },
  { id: 'person3', path: '/people/person3.jpg', label: 'Person 3', description: 'Blonde woman with long hair' },
  { id: 'person4', path: '/people/person4.jpg', label: 'Person 4', description: 'Man with short dark hair and beard' },
  { id: 'person5', path: '/people/person5.jpg', label: 'Person 5', description: 'Woman with curly brown hair' },
  { id: 'person6', path: '/people/person6.jpg', label: 'Person 6', description: 'Man with dark hair and medium build' },
];

const DEFAULT_CLOTHING = [
  { id: 'clothing1', path: '/clothing/item1.jpg', label: 'Clothing 1', description: 'Black NASA logo t-shirt' },
  { id: 'clothing2', path: '/clothing/item2.jpg', label: 'Clothing 2', description: 'Orange/Yellowish cotton sweater' },
  { id: 'clothing3', path: '/clothing/item3.jpg', label: 'Clothing 3', description: 'Red Christmas sweater' },
  { id: 'clothing4', path: '/clothing/item4.jpg', label: 'Clothing 4', description: 'Blue evening gown' },
  { id: 'clothing5', path: '/clothing/item5.jpg', label: 'Clothing 5', description: 'Floral black, pink, and red dress' },
  { id: 'clothing6', path: '/clothing/item6.jpg', label: 'Clothing 6', description: 'Blue denim jeans' },
  { id: 'clothing7', path: '/clothing/item7.jpg', label: 'Clothing 7', description: 'Red cardigan' },
  { id: 'clothing8', path: '/clothing/item8.jpg', label: 'Clothing 8', description: 'Green hoodie' },
  { id: 'clothing9', path: '/clothing/item9.jpg', label: 'Clothing 9', description: 'Beige trench coat' },
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

  // States for default images
  const [selectedDefaultPerson, setSelectedDefaultPerson] = useState<string | null>(null);
  const [selectedDefaultPersonIndex, setSelectedDefaultPersonIndex] = useState<number | null>(null);
  const [selectedDefaultClothing, setSelectedDefaultClothing] = useState<string | null>(null);
  const [selectedDefaultClothingIndex, setSelectedDefaultClothingIndex] = useState<number | null>(null);
  const [useDefaultPerson, setUseDefaultPerson] = useState(false);
  const [useDefaultClothing, setUseDefaultClothing] = useState(false);

  const handleModelDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelDescription(e.target.value);
  };

  const handleClothDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClothDescription(e.target.value);
  };

  const handleSelectDefaultPerson = (path: string, index: number) => {
    setSelectedDefaultPerson(path);
    setSelectedDefaultPersonIndex(index);
    setPersonImage(null);
    setUseDefaultPerson(true);
    setModelDescription(DEFAULT_PEOPLE[index].description);
  };

  const handleSelectDefaultClothing = (path: string, index: number) => {
    setSelectedDefaultClothing(path);
    setSelectedDefaultClothingIndex(index);
    setClothingImage(null);
    setUseDefaultClothing(true);
    setClothDescription(DEFAULT_CLOTHING[index].description);
  };

  const handleUploadPerson = (file: File | null) => {
    if (file) {
      setPersonImage(file);
      setSelectedDefaultPerson(null);
      setSelectedDefaultPersonIndex(null);
      setUseDefaultPerson(false);
      // Clear the model description when uploading own image
      setModelDescription('');
    } else {
      setPersonImage(null);
    }
  };

  const handleUploadClothing = (file: File | null) => {
    if (file) {
      setClothingImage(file);
      setSelectedDefaultClothing(null);
      setSelectedDefaultClothingIndex(null);
      setUseDefaultClothing(false);
      // Clear the cloth description when uploading own image
      setClothDescription('');
    } else {
      setClothingImage(null);
    }
  };

  const fetchImageAsFile = async (url: string, fileName: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
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
    setResultImage(null);

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

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResultImage(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
                      imagePreview={personImage ? URL.createObjectURL(personImage) : null}
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
                      imagePreview={clothingImage ? URL.createObjectURL(clothingImage) : null}
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
                      <div className="flex flex-col items-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Generating your virtual try-on...</p>
                      </div>
                    ) : resultImage ? (
                      <div className="max-h-full flex flex-col items-center">
                        <Image
                          src={resultImage}
                          alt="AI generated try-on"
                          width={400}
                          height={600}
                          className="max-h-[500px] w-auto object-contain rounded-lg shadow-lg"
                        />
                        <button
                          onClick={() => window.open(resultImage, '_blank')}
                          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded"
                        >
                          View Full Size
                        </button>
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
    </div>
  );
}
