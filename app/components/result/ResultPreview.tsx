import Image from 'next/image';
import LoadingDots from '../LoadingDots';

interface ResultPreviewProps {
    isLoading: boolean;
    resultImage: string | null;
    error: string | null;
    onSubmit: () => void;
    onReset: () => void;
    onDownloadImage: () => void;
    onOpenFullView: () => void;
    isButtonDisabled: boolean;
}

export default function ResultPreview({
    isLoading,
    resultImage,
    error,
    onSubmit,
    onReset,
    onDownloadImage,
    onOpenFullView,
    isButtonDisabled,
}: ResultPreviewProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Result Preview</h2>

            <div className="flex-grow flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                {isLoading ? (
                    <div className="mt-8 flex flex-col items-center">
                        <LoadingDots />
                        <p className="mt-3 text-slate-600 dark:text-slate-300 text-center">
                            Generating your image...
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-center">
                            This can take up to 5 minutes.
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
                                onClick={onDownloadImage}
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
                                onClick={onOpenFullView}
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
                        <button
                            onClick={onReset}
                            className="ml-2 text-red-700 dark:text-red-200 underline hover:no-underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <button
                    onClick={onSubmit}
                    disabled={isButtonDisabled}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                >
                    {isLoading ? 'Generating...' : 'Generate Try-On'}
                </button>
            </div>
        </div>
    );
} 