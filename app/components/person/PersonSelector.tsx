import { useState } from 'react';
import Image from 'next/image';
import ImageUploader from '../ImageUploader';

interface PersonSelectorProps {
    defaultPeople: Array<{
        id: string;
        path: string;
        label: string;
        description: string;
    }>;
    selectedDefaultPerson: string | null;
    personImage: File | null;
    modelDescription: string;
    onSelectDefaultPerson: (path: string, index: number) => void;
    onUploadPerson: (file: File | null) => void;
    onModelDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    createSafeObjectUrl: (file: File | null) => string | null;
}

export default function PersonSelector({
    defaultPeople,
    selectedDefaultPerson,
    personImage,
    modelDescription,
    onSelectDefaultPerson,
    onUploadPerson,
    onModelDescriptionChange,
    createSafeObjectUrl,
}: PersonSelectorProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Choose Person (Optional)</h2>

            {/* Default People Models */}
            <div className="mb-4">
                <h3 className="text-md font-medium mb-2 text-slate-700 dark:text-slate-300">Default Models</h3>
                <div className="grid grid-cols-3 gap-2">
                    {defaultPeople.map((person, index) => (
                        <div
                            key={person.id}
                            className={`relative border-2 rounded cursor-pointer ${selectedDefaultPerson === person.path ? 'border-blue-500' : 'border-transparent'}`}
                            onClick={() => onSelectDefaultPerson(person.path, index)}
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
                <div className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300 flex items-center">
                    Or upload your own
                    <div className="relative ml-1 group">
                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 cursor-help">
                            ?
                        </div>
                        <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-white dark:bg-gray-800 rounded shadow-lg text-xs text-gray-700 dark:text-gray-300 invisible group-hover:visible z-10 border border-gray-200 dark:border-gray-700">
                            <p className="font-bold mb-1">Best Practices:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Use high-resolution, well-lit photos</li>
                                <li>Show full torso/body (not just face)</li>
                                <li>Use plain backgrounds</li>
                                <li>Avoid blurry or cluttered images</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <ImageUploader
                    onImageSelected={onUploadPerson}
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
                    onChange={onModelDescriptionChange}
                    placeholder="Describe the person (e.g., gender, ethnicity, style)"
                />
            </div>
        </div>
    );
} 