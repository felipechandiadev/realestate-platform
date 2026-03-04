'use client';

import { ContractsContent } from '@/features/backoffice/contracts/components';

/**
 * Sales Contracts Page
 *
 * Main page for viewing and managing property sale contracts in the backoffice
 * Displays contracts grid with filtering, sorting, and CRUD operations
 *
 * @returns {React.ReactNode} Sales contracts page
 */
export default function SalesContractsPage() {
  return (
    <div className="w-full">
      <ContractsContent />
    </div>
  );
}
