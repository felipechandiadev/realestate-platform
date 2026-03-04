'use client';

import { ContractsContent } from '@/features/backoffice/contracts/components';

/**
 * Rent Contracts Page
 *
 * Main page for viewing and managing property rental contracts in the backoffice
 * Displays contracts grid with filtering, sorting, and CRUD operations
 *
 * @returns {React.ReactNode} Rent contracts page
 */
export default function RentContractsPage() {
  return (
    <div className="w-full">
      <ContractsContent />
    </div>
  );
}
