import React from 'react';
import PropertyTypeList from './ui/PropertyTypeList';
import { getPropertyTypes } from '@/features/shared/propertyTypes/actions/propertyTypes.action';

export default async function PropertyTypesPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params?.search || '';
  const propertyTypes = await getPropertyTypes(search);

  return (
    <div className="p-4">
      <PropertyTypeList propertyTypes={propertyTypes} />
    </div>
  );
}
