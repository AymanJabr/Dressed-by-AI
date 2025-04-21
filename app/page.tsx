'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeyConfig from './components/ApiKeyConfig';
import { ApiKeyConfig as ApiKeyConfigType } from './types';

// Clothing categories
const CATEGORIES = {
  upper_body: "Upper Body",
  lower_body: "Lower Body",
  dresses: "Dresses"
};

// Default models
const DEFAULT_PEOPLE = [
  { id: 'person1', path: '/people/person1.jpg', label: 'Person 1' },
  { id: 'person2', path: '/people/person2.jpg', label: 'Person 2' },
  { id: 'person3', path: '/people/person3.jpg', label: 'Person 3' },
  { id: 'person4', path: '/people/person4.jpg', label: 'Person 4' },
  { id: 'person5', path: '/people/person5.jpg', label: 'Person 5' },
  { id: 'person6', path: '/people/person6.jpg', label: 'Person 6' },
];

const DEFAULT_CLOTHING = {
  upper_body: [
    { id: 'upper1', path: '/clothing/upper_body/item1.jpg', label: 'Upper Body 1' },
    { id: 'upper2', path: '/clothing/upper_body/item2.jpg', label: 'Upper Body 2' },
    { id: 'upper3', path: '/clothing/upper_body/item3.jpg', label: 'Upper Body 3' },
  ],
  lower_body: [
    { id: 'lower1', path: '/clothing/lower_body/item1.jpg', label: 'Lower Body 1' },
    { id: 'lower2', path: '/clothing/lower_body/item2.jpg', label: 'Lower Body 2' },
    { id: 'lower3', path: '/clothing/lower_body/item3.jpg', label: 'Lower Body 3' },
  ],
  dresses: [
    { id: 'dress1', path: '/clothing/dresses/item1.jpg', label: 'Dress 1' },
    { id: 'dress2', path: '/clothing/dresses/item2.jpg', label: 'Dress 2' },
    { id: 'dress3', path: '/clothing/dresses/item3.jpg', label: 'Dress 3' },
  ],
};

export default function Home() {
  const [category, setCategory] = useState<'upper_body' | 'lower_body' | 'dresses'>('upper_body');
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiKeyConfigType | null>(null);

  // States for default images
  const [selectedDefaultPerson, setSelectedDefaultPerson] = useState<string | null>(null);
  const [selectedDefaultClothing, setSelectedDefaultClothing] = useState<string | null>(null);
  const [useDefaultPerson, setUseDefaultPerson] = useState(false);
  const [useDefaultClothing, setUseDefaultClothing] = useState(false);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value as 'upper_body' | 'lower_body' | 'dresses');
    // Reset clothing selection when category changes
    setClothingImage(null);
    setSelectedDefaultClothing(null);
    setUseDefaultClothing(false);
  };

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
    if (file) {
      setPersonImage(file);
      setSelectedDefaultPerson(null);
      setUseDefaultPerson(false);
    } else {
      setPersonImage(null);
    }
  };

  const handleUploadClothing = (file: File | null) => {
    if (file) {
      setClothingImage(file);
      setSelectedDefaultClothing(null);
      setUseDefaultClothing(false);
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
    if (!useDefaultPerson && !personImage) {
      setError('Please select or upload a person image');
      return;
    }

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

      // Handle person image (default or uploaded)
      if (useDefaultPerson && selectedDefaultPerson) {
        const personFile = await fetchImageAsFile(selectedDefaultPerson, 'default-person.jpg');
        formData.append('personImage', personFile);
      } else if (personImage) {
        formData.append('personImage', personImage);
      }

      // Handle clothing image (default or uploaded)
      if (useDefaultClothing && selectedDefaultClothing) {
        const clothingFile = await fetchImageAsFile(selectedDefaultClothing, 'default-clothing.jpg');
        formData.append('clothingImage', clothingFile);
      } else if (clothingImage) {
        formData.append('clothingImage', clothingImage);
      }

      formData.append('apiKey', apiConfig.apiKey);
      formData.append('category', category);

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
                {/* Category Selector */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Select Clothing Category</h2>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    {Object.entries(CATEGORIES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Person Selection */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Choose Person</h2>

                  {/* Default People Models */}
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2 text-slate-700 dark:text-slate-300">Default Models</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {DEFAULT_PEOPLE.map(person => (
                        <div
                          key={person.id}
                          className={`relative border-2 rounded cursor-pointer ${selectedDefaultPerson === person.path ? 'border-blue-500' : 'border-transparent'}`}
                          onClick={() => handleSelectDefaultPerson(person.path)}
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
                </div>

                {/* Clothing Selection */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Choose Clothing ({CATEGORIES[category]})</h2>

                  {/* Default Clothing Models */}
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2 text-slate-700 dark:text-slate-300">Default Items</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {DEFAULT_CLOTHING[category].map(item => (
                        <div
                          key={item.id}
                          className={`relative border-2 rounded cursor-pointer ${selectedDefaultClothing === item.path ? 'border-blue-500' : 'border-transparent'}`}
                          onClick={() => handleSelectDefaultClothing(item.path)}
                        >
                          <Image
                            src={item.path}
                            alt={item.label}
                            width={100}
                            height={150}
                            className="w-full h-32 object-cover rounded"
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
                      label={`Upload a ${category.replace('_', ' ')} item`}
                      imagePreview={clothingImage ? URL.createObjectURL(clothingImage) : null}
                    />
                  </div>
                </div>

                <div className="text-center flex flex-col gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || ((!personImage && !selectedDefaultPerson) || (!clothingImage && !selectedDefaultClothing))}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Generating...' : 'Create Virtual Try-On'}
                  </button>
                  <button
                    onClick={() => setApiConfig(null)}
                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Change API Configuration
                  </button>
                  {error && (
                    <p className="mt-4 text-red-500">{error}</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
                  {resultImage ? 'Result' : 'Your Result Will Appear Here'}
                </h2>

                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-slate-600 dark:text-slate-300">
                      Generating your try-on image...
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      This may take up to a minute
                    </p>
                  </div>
                ) : resultImage ? (
                  <div className="relative w-full h-full min-h-[300px]">
                    {resultImage.startsWith('data:') ? (
                      // For base64 data URLs, use a regular img tag
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resultImage}
                        alt="Generated try-on image"
                        className="object-contain rounded-md w-full h-full"
                      />
                    ) : (
                      // For normal URLs, use Next.js Image component
                      <Image
                        src={resultImage}
                        alt="Generated try-on image"
                        fill
                        className="object-contain rounded-md"
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <p>Select models or upload your photos and click "Create Virtual Try-On" to see the result</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
