export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center space-y-3" role="status">
            <div className="flex space-x-2">
                {[0, 1, 2].map((index) => (
                    <div
                        key={index}
                        className="h-3 w-3 rounded-full bg-blue-600"
                        style={{
                            animation: `pulse 1.5s ease-in-out ${index * 0.2}s infinite`,
                            opacity: 0.3
                        }}
                    />
                ))}
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: scale(1.5);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
} 