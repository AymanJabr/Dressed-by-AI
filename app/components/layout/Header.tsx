import Image from 'next/image';

export default function Header() {
    return (
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
    );
} 