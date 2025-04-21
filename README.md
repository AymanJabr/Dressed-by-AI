# Dressed by AI

A virtual try-on application that uses AI to visualize how clothing items would look on you. Select from default models or upload your own photos, and get a realistic visualization of how clothing items would look on you.

## Features

- Choose from 6 default person models or upload your own photo
- Select from default clothing items or upload your own
- Support for multiple clothing categories (upper body, lower body, dresses)
- AI-powered virtual try-on using Segmind's IDM-VTON model
- Mobile-responsive design
- Dark mode support

## Technology Stack

- Next.js 15 with Turbopack
- TypeScript
- Tailwind CSS
- Segmind IDM-VTON API for virtual try-on

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
2. Select a clothing category (upper body, lower body, or dresses)
3. Choose from default person models or upload your own photo
4. Select from default clothing items or upload your own
5. Click "Create Virtual Try-On"
6. Wait for the AI to generate your try-on image
7. View and save the result

## API Information

This project uses the Segmind IDM-VTON API for virtual try-on functionality. The API has the following attributes:

- **Category**: Choose between `upper_body`, `lower_body`, or `dresses`
- **Force DC**: Automatically enabled for dresses category
- **Crop**: Option for non-standard image ratios

For more information on the Segmind API, visit their documentation at https://cloud.segmind.com/

## Adding Default Models

The application comes with a directory structure for default models:

```
public/
├── people/         # Person model images (person1.jpg - person6.jpg)
└── clothing/
    ├── upper_body/ # Upper body clothing items (item1.jpg - item3.jpg)
    ├── lower_body/ # Lower body clothing items (item1.jpg - item3.jpg)
    └── dresses/    # Dress items (item1.jpg - item3.jpg)
```

You can replace these images with your own default models, maintaining the same naming convention.

