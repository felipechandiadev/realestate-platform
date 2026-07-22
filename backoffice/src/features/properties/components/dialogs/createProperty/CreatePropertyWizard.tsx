'use client';

import { useMemo } from 'react';
import { Alert, Stepper } from '@realestate/ui';
import type { BaseFormField } from '@/shared/components/ui/BaseForm/StepperBaseForm';
import type { PropertyType } from '@/features/shared/propertyTypes/actions/propertyTypes.action';
import type { LocationOption, PropertyTypeOption } from './types';
import {
  getBasicInfoFields,
  getPropertyDetailsFields,
  getLocationFields,
  getMultimediaFields,
  getSeoFields,
  getInternalNotesFields,
} from './propertyFormFields';
import { CREATE_PROPERTY_WIZARD_STEPS } from './create-property-wizard-constants';
import { CreatePropertyStepFields } from './CreatePropertyStepFields';

export type CreatePropertyWizardProps = {
  stepIndex: number;
  stepError: string | null;
  onStepDotClick: (index: number) => void;
  formData: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
  propertyTypes: PropertyTypeOption[];
  selectedPropertyType?: PropertyType | null;
  stateOptions: LocationOption[];
  cityOptions: LocationOption[];
  detectedCoords?: { initialLat?: number; initialLng?: number } | null;
};

export function CreatePropertyWizard({
  stepIndex,
  stepError,
  onStepDotClick,
  formData,
  onChange,
  propertyTypes,
  selectedPropertyType,
  stateOptions,
  cityOptions,
  detectedCoords,
}: CreatePropertyWizardProps) {
  const fieldRowsByStep = useMemo((): BaseFormField[][][] => {
    const stateId =
      formData.state && typeof formData.state === 'object' && formData.state !== null
        ? String((formData.state as { id?: string }).id ?? '')
        : undefined;

    return [
      getBasicInfoFields(propertyTypes),
      getPropertyDetailsFields(selectedPropertyType),
      getLocationFields(
        stateOptions,
        cityOptions,
        stateId || undefined,
        detectedCoords ?? undefined,
      ),
      getMultimediaFields(),
      getSeoFields(),
      getInternalNotesFields(),
    ];
  }, [
    propertyTypes,
    selectedPropertyType,
    stateOptions,
    cityOptions,
    formData.state,
    detectedCoords,
  ]);

  const activeRows = fieldRowsByStep[stepIndex] ?? [];

  return (
    <Stepper
      steps={CREATE_PROPERTY_WIZARD_STEPS}
      activeIndex={stepIndex}
      allowClickCompletedSteps
      onCompletedStepClick={onStepDotClick}
      data-test-id="create-property-stepper"
    >
      {stepError ? (
        <Alert variant="error" className="mb-3">
          {stepError}
        </Alert>
      ) : null}
      <CreatePropertyStepFields
        fieldRows={activeRows}
        values={formData}
        onChange={onChange}
      />
    </Stepper>
  );
}

export function getCreatePropertyStepFieldRows(
  stepIndex: number,
  args: {
    propertyTypes: PropertyTypeOption[];
    selectedPropertyType?: PropertyType | null;
    stateOptions: LocationOption[];
    cityOptions: LocationOption[];
    formData: Record<string, unknown>;
    detectedCoords?: { initialLat?: number; initialLng?: number } | null;
  },
): BaseFormField[][] {
  const stateId =
    args.formData.state && typeof args.formData.state === 'object' && args.formData.state !== null
      ? String((args.formData.state as { id?: string }).id ?? '')
      : undefined;

  const all: BaseFormField[][][] = [
    getBasicInfoFields(args.propertyTypes),
    getPropertyDetailsFields(args.selectedPropertyType),
    getLocationFields(
      args.stateOptions,
      args.cityOptions,
      stateId || undefined,
      args.detectedCoords ?? undefined,
    ),
    getMultimediaFields(),
    getSeoFields(),
    getInternalNotesFields(),
  ];

  return all[stepIndex] ?? [];
}
