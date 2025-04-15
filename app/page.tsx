'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';

export default function Home() {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!personImage || !clothingImage) {
      setError('Please upload both a person image and a clothing item image');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append('personImage', personImage);
      formData.append('clothingImage', clothingImage);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2 text-slate-800 dark:text-white">Dressed by AI</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Try on clothes virtually using AI image generation
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Upload Your Photo</h2>
              <ImageUploader
                onImageSelected={(file: File) => setPersonImage(file)}
                label="Upload a photo of yourself"
                imagePreview={personImage ? URL.createObjectURL(personImage) : null}
              />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Upload Clothing Item</h2>
              <ImageUploader
                onImageSelected={(file: File) => setClothingImage(file)}
                label="Upload a photo of the clothing item"
                imagePreview={clothingImage ? URL.createObjectURL(clothingImage) : null}
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !personImage || !clothingImage}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Create Virtual Try-On'}
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
                <Image
                  src={resultImage}
                  alt="Generated try-on image"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400">
                <p>Upload your photos and click "Create Virtual Try-On" to see the result</p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Powered by GPT-4o and Next.js</p>
        </footer>
      </div>
    </div>
  );
}
