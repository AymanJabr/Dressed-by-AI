# Dressed by AI

A virtual try-on application that uses AI to visualize how clothing items would look on you. Select from default models or upload your own photos, and get a realistic visualization of how clothing items would look on you.

## Features

- Choose from 6 default person models or upload your own photo
- Select from 9 default clothing items or upload your own
- AI-powered virtual try-on using Segmind's Segfit v1.2 model
- Mobile-responsive design
- Dark mode support

## Technology Stack

- Next.js 15 with Turbopack
- TypeScript
- Tailwind CSS
- Segmind Segfit v1.2 API for virtual try-on

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm package manager
- Segmind API key (available at https://cloud.segmind.com/console/api-keys)

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

1. Enter your Segmind API key in the configuration screen
2. Choose from default person models or upload your own photo
3. Select from default clothing items or upload your own
4. Click "Generate Try-On"
5. Wait for the AI to generate your try-on image
6. View and save the result

## API Information

This project uses the Segmind Segfit v1.2 API for virtual try-on functionality. The API has the following key attributes:

- **outfit_image** (required): The clothing item image
- **model_image** (required): A reference person image
- **model_type**: Quality setting (Speed, Balanced, Quality)

For more information on the Segmind Segfit v1.2 API, visit their documentation at https://www.segmind.com/models/segfit-v1.2/api

## Adding Default Models

The application comes with a directory structure for default models:

```
public/
├── people/         # Person model images (person1.jpg - person6.jpg)
└── clothing/       # Clothing items (item1.jpg - item9.jpg)
```

You can replace these images with your own default models, maintaining the same naming convention.

