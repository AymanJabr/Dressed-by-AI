import Image from 'next/image';
import ImageUploader from '../ImageUploader';

interface ClothingSelectorProps {
    defaultClothing: Array<{
        id: string;
        path: string;
        label: string;
        description: string;
    }>;
    selectedDefaultClothing: string | null;
    clothingImage: File | null;
    onSelectDefaultClothing: (path: string, index: number) => void;
    onUploadClothing: (file: File | null) => void;
    createSafeObjectUrl: (file: File | null) => string | null;
}

export default function ClothingSelector({
    defaultClothing,
    selectedDefaultClothing,
    clothingImage,
    onSelectDefaultClothing,
    onUploadClothing,
    createSafeObjectUrl,
}: ClothingSelectorProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Choose Clothing</h2>

            {/* Default Clothing Items */}
            <div className="mb-4">
                <h3 className="text-md font-medium mb-2 text-slate-700 dark:text-slate-300">Default Items</h3>
                <div className="grid grid-cols-3 gap-2">
                    {defaultClothing.map((item, index) => (
                        <div
                            key={item.id}
                            className={`relative border-2 rounded cursor-pointer ${selectedDefaultClothing === item.path ? 'border-blue-500' : 'border-transparent'}`}
                            onClick={() => onSelectDefaultClothing(item.path, index)}
                        >
                            <Image
                                src={item.path}
                                alt={item.label}
                                width={100}
                                height={150}
                                className="w-full h-45 object-cover rounded"
                                sizes="33vw"
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
                                <li>Use high-resolution images of clothing</li>
                                <li>Plain/white backgrounds work best</li>
                                <li>Avoid cluttered or styled images</li>
                                <li>Make sure the entire garment is visible</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <ImageUploader
                    onImageSelected={onUploadClothing}
                    label="Upload a clothing item"
                    imagePreview={clothingImage ? createSafeObjectUrl(clothingImage) : null}
                />
            </div>
        </div>
    );
} 