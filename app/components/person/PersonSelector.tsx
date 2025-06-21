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
    onSelectDefaultPerson: (path: string, index: number) => void;
    onUploadPerson: (file: File | null) => void;
    createSafeObjectUrl: (file: File | null) => string | null;
}

export default function PersonSelector({
    defaultPeople,
    selectedDefaultPerson,
    personImage,
    onSelectDefaultPerson,
    onUploadPerson,
    createSafeObjectUrl,
}: PersonSelectorProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Choose Person</h2>

            {/* Default People Models */}
            <div className="mb-4">
                <h3 className="text-md font-medium mb-2 text-slate-700 dark:text-slate-300">Default Models</h3>
                <div className="grid grid-cols-3 gap-2">
                    {defaultPeople.map((person, index) => (
                        <div
                            key={person.id}
                            className={`relative border-2  cursor-pointer ${selectedDefaultPerson === person.path ? 'border-blue-500' : 'border-transparent'}`}
                            onClick={() => onSelectDefaultPerson(person.path, index)}
                        >
                            <Image
                                src={person.path}
                                alt={person.label}
                                width={100}
                                height={150}
                                className="w-full h-45 object-contain "
                            />
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
        </div>
    );
} 