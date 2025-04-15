# Dressed by AI

A virtual try-on application that uses AI to visualize how clothing items would look on you. Upload your photo and a clothing item photo, and get a realistic visualization of yourself wearing that item.

## Features

- Upload your photo
- Upload clothing item photo
- AI-powered image generation
- Mobile-responsive design
- Dark mode support

## Technology Stack

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI GPT-4o for image generation

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dressed-by-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   
Create a `.env.local` file in the root directory with the following content:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

### Development

Run the development server with Turbopack:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

```bash
pnpm build
pnpm start
```

## Usage

1. Upload your photo (selfie or portrait)
2. Upload a clothing item image
3. Click "Create Virtual Try-On"
4. Wait for the AI to generate your try-on image
5. View and save the result

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with OpenAI's GPT-4o Vision model
- Styled with Tailwind CSS
- Powered by Next.js
