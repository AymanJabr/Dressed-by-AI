export default function LoadingDots() {
    return (
        <div className="flex flex-col items-center justify-center space-y-3" role="status">
            <div className="flex space-x-2">
                {[0, 1, 2].map((index) => (
                    <div
                        key={index}
                        className="h-3 w-3 rounded-full bg-blue-600 animate-pulse"
                        style={{
                            animationDelay: `${index * 0.2}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
} 