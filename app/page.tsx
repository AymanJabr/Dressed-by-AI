'use client';

import ApiKeyConfig from './components/ApiKeyConfig';
import Header from './components/layout/Header';
import PersonSelector from './components/person/PersonSelector';
import ClothingSelector from './components/clothing/ClothingSelector';
import ResultPreview from './components/result/ResultPreview';
import FullViewModal from './components/modal/FullViewModal';
import useTryOnLogic from './hooks/useTryOnLogic';

export default function Home() {
  const {
    // State
    personImage,
    clothingImage,
    resultImage,
    isLoading,
    error,
    apiConfig,
    selectedDefaultPerson,
    selectedDefaultClothing,
    useDefaultClothing,
    isFullViewOpen,
    zoomLevel,
    position,

    // Constant data
    DEFAULT_PEOPLE,
    DEFAULT_CLOTHING,

    // Handlers
    handleSelectDefaultPerson,
    handleSelectDefaultClothing,
    handleUploadPerson,
    handleUploadClothing,
    createSafeObjectUrl,
    handleSubmit,
    handleDownloadImage,
    handleOpenFullView,
    handleCloseFullView,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleApiConfigured,
    // Add useDefaultPerson to the destructuring
    useDefaultPerson,
  } = useTryOnLogic();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <Header />

        {!apiConfig ? (
          <div className="mb-8">
            <ApiKeyConfig onApiKeyConfigured={handleApiConfigured} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                {/* Person Selection */}
                <PersonSelector
                  defaultPeople={DEFAULT_PEOPLE}
                  selectedDefaultPerson={selectedDefaultPerson}
                  personImage={personImage}
                  onSelectDefaultPerson={handleSelectDefaultPerson}
                  onUploadPerson={handleUploadPerson}
                  createSafeObjectUrl={createSafeObjectUrl}
                />

                {/* Clothing Selection */}
                <ClothingSelector
                  defaultClothing={DEFAULT_CLOTHING}
                  selectedDefaultClothing={selectedDefaultClothing}
                  clothingImage={clothingImage}
                  onSelectDefaultClothing={handleSelectDefaultClothing}
                  onUploadClothing={handleUploadClothing}
                  createSafeObjectUrl={createSafeObjectUrl}
                />
              </div>

              <div className="space-y-6">
                {/* Result Preview */}
                <ResultPreview
                  isLoading={isLoading}
                  resultImage={resultImage}
                  error={error}
                  onSubmit={handleSubmit}
                  onDownloadImage={handleDownloadImage}
                  onOpenFullView={handleOpenFullView}
                  isButtonDisabled={
                    isLoading ||
                    (!clothingImage && !useDefaultClothing) ||
                    (!personImage && !useDefaultPerson)
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Full View Modal */}
      <FullViewModal
        isOpen={isFullViewOpen}
        onClose={handleCloseFullView}
        imageSrc={resultImage}
        zoomLevel={zoomLevel}
        position={position}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
