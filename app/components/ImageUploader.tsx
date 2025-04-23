'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
    onImageSelected: (file: File | null) => void;
    label: string;
    imagePreview: string | null;
}

export default function ImageUploader({ onImageSelected, label, imagePreview }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clean up any locally created object URLs
    useEffect(() => {
        // When component unmounts or imagePreview changes, clean up old blob URLs
        return () => {
            if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(localPreviewUrl);
            }
        };
    }, [localPreviewUrl]);

    // Use the provided preview or create a local one for safety
    useEffect(() => {
        if (imagePreview) {
            setLocalPreviewUrl(imagePreview);
        } else {
            setLocalPreviewUrl(null);
        }
    }, [imagePreview]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                onImageSelected(file);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onImageSelected(e.target.files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onImageSelected(null);
    };

    return (
        <div className="w-full">
            {localPreviewUrl ? (
                <div className="relative w-full h-64 mb-4">
                    <Image
                        src={localPreviewUrl}
                        alt="Preview"
                        fill
                        className="object-contain rounded-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <button
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center"
                        onClick={handleRemoveImage}
                        aria-label="Remove image"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors h-64 flex flex-col items-center justify-center ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <svg
                        className="w-12 h-12 mb-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{label}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, or JPG</p>
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
} 