'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/Button/Button';
import { MediaGrid } from './MediaGrid';
import { UploadMediaDialog } from './UploadMediaDialog';

/**
 * Media Content Component
 *
 * Main container component for multimedia management
 * Combines MediaGrid and UploadMediaDialog
 * Handles state coordination between upload and grid
 *
 * @returns {React.ReactNode} Content component
 */
export function MediaContent() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Handle successful upload
   */
  const handleUploadSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  /**
   * Handle grid refresh
   */
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Multimedia
          </h1>
          <p className="text-gray-600 mt-1">
            Administre imágenes y videos del sistema
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          Subir Archivos
        </Button>
      </div>

      {/* Grid */}
      <MediaGrid key={refreshKey} onRefresh={handleRefresh} />

      {/* Upload Dialog */}
      <UploadMediaDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
