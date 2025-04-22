import Image from 'next/image';

interface FullViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    zoomLevel: number;
    position: { x: number; y: number };
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
}

export default function FullViewModal({
    isOpen,
    onClose,
    imageSrc,
    zoomLevel,
    position,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
}: FullViewModalProps) {
    if (!isOpen || !imageSrc) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div
                className="relative max-w-4xl max-h-[90vh] overflow-hidden"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
            >
                <div
                    style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.1s ease-out',
                        position: 'relative',
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                    }}
                >
                    <Image
                        src={imageSrc}
                        alt="Generated outfit full view"
                        width={1024}
                        height={1536}
                        className="max-w-full max-h-[85vh] object-contain"
                        unoptimized={true}
                        style={{ pointerEvents: 'none' }}
                    />
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                    aria-label="Close full view"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Zoom controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-lg flex items-center p-2 space-x-3">
                    <button
                        onClick={onZoomOut}
                        className="text-white p-1 hover:bg-gray-700 rounded"
                        disabled={zoomLevel <= 1}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>

                    <button
                        onClick={onZoomReset}
                        className="text-white px-2 py-1 hover:bg-gray-700 rounded text-sm"
                    >
                        {Math.round(zoomLevel * 100)}%
                    </button>

                    <button
                        onClick={onZoomIn}
                        className="text-white p-1 hover:bg-gray-700 rounded"
                        disabled={zoomLevel >= 3}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
} 