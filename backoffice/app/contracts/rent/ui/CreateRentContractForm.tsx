'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useAlert } from '@/shared/hooks/useAlert';
import { createContract } from '@/features/contracts/actions/contracts.action';
import { listAvailableRentProperties, type AvailableRentProperty } from '@/features/properties/actions/properties.action';
import { searchPersons } from '@/features/contracts/actions/persons.action';
import { getDocumentTypes } from '@/features/contracts/actions/documentTypes.action';
import type { DocumentType } from '@/features/contracts/actions/documentTypes.action';
import { ContractOperationType, ContractRole, PaymentType } from '@/shared/types/contracts';
import { TextField } from '@realestate/ui';
import { Select } from "@realestate/ui";
import { AutoComplete } from "@realestate/ui";
import { Button } from '@realestate/ui';
import { Card } from "@realestate/ui";
import { IconButton } from "@realestate/ui";
import { Dialog } from "@realestate/ui";
import { Switch } from "@realestate/ui";
import { Alert, Stepper, type StepperStepItem } from '@realestate/ui';

interface CreateRentContractFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface ContractPerson {
  personId: string;
  personName?: string;
  personDni?: string;
  role: ContractRole;
}

interface ContractPayment {
  amount: number;
  date: string;
  type: PaymentType;
  description?: string;
  isAgencyRevenue: boolean;
}

interface ContractDocumentForm {
  documentTypeId: string;
  documentTypeName: string;
  personId?: string;
  personName?: string;
  title: string;
}

const moneySymbol = (curr: 'CLP' | 'UF' | string = 'CLP') => (curr === 'UF' ? 'UF' : '$');

const formatCurrency = (amount: number, curr: 'CLP' | 'UF' | string = 'CLP') => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${moneySymbol(curr)} ${safeAmount.toLocaleString('es-CL')}`;
};

const RENT_CONTRACT_STEPS: StepperStepItem[] = [
  { id: 'property', title: 'Propiedad', description: 'Elige la propiedad que se arrienda' },
  { id: 'terms', title: 'Condiciones', description: 'Monto, depósito, duración y fecha de inicio' },
  { id: 'people', title: 'Participantes', description: 'Arrendador, arrendatario y otros roles' },
  { id: 'commission', title: 'Comisiones', description: 'Porcentaje del arrendatario y del arrendador sobre un mes' },
  { id: 'payments', title: 'Pagos', description: 'Cronograma mensual, comisiones y pagos extra' },
  { id: 'close', title: 'Cierre', description: 'Documentos requeridos y observaciones' },
];

const LAST_RENT_STEP = RENT_CONTRACT_STEPS.length - 1;

export default function CreateRentContractForm({ onClose, onSuccess }: CreateRentContractFormProps) {
  const alert = useAlert();
  const router = useRouter();
  const { data: session } = useSession();

  const [propertyId, setPropertyId] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [currency, setCurrency] = useState<'CLP' | 'UF'>('CLP');
  const [ufValue, setUfValue] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [contractDuration, setContractDuration] = useState('12');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const [depositIsAgencyRevenue, setDepositIsAgencyRevenue] = useState(false);
  const [tenantCommissionPercent, setTenantCommissionPercent] = useState('50');
  const [landlordCommissionPercent, setLandlordCommissionPercent] = useState('50');
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const [properties, setProperties] = useState<AvailableRentProperty[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [personsForSearch, setPersonsForSearch] = useState<Array<{ id: string; name: string; dni: string }>>([]);

  const [contractPersons, setContractPersons] = useState<ContractPerson[]>([
    { personId: '', role: ContractRole.LANDLORD },
    { personId: '', role: ContractRole.TENANT },
  ]);

  const [payments, setPayments] = useState<ContractPayment[]>([]);
  const [showMonthlyPayments, setShowMonthlyPayments] = useState(true);
  const [scheduledPayments, setScheduledPayments] = useState<ContractPayment[]>([]);

  const [contractDocuments, setContractDocuments] = useState<ContractDocumentForm[]>([]);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<{ id: string; label: string } | null>(null);
  const [selectedPersonForDoc, setSelectedPersonForDoc] = useState<{ id: string; label: string } | null>(null);
  const [documentDescription, setDocumentDescription] = useState('');
  const [editingDocIndex, setEditingDocIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [propertiesData, documentTypesData, personsSearchData] = await Promise.all([
          listAvailableRentProperties({ limit: 100 }),
          getDocumentTypes(),
          searchPersons(),
        ]);

        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        setDocumentTypes(
          documentTypesData.success && Array.isArray(documentTypesData.data)
            ? documentTypesData.data
            : [],
        );
        setPersonsForSearch(Array.isArray(personsSearchData) ? personsSearchData : []);
      } catch (error) {
        console.error('Error loading data:', error);
        alert.showAlert({
          message: 'Error al cargar datos iniciales',
          type: 'error',
          duration: 5000,
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [alert]);

  useEffect(() => {
    if (!depositAmount) {
      setDepositIsAgencyRevenue(false);
    }
  }, [depositAmount]);

  useEffect(() => {
    if (!showMonthlyPayments) {
      setPayments([]);
      return;
    }

    const rentAmount = parseFloat(monthlyRent);
    const duration = parseInt(contractDuration, 10);

    if (!rentAmount || !duration || !startDate) {
      setPayments([]);
      return;
    }

    const start = new Date(startDate);
    if (Number.isNaN(start.valueOf())) {
      setPayments([]);
      return;
    }

    const generated: ContractPayment[] = Array.from({ length: duration }, (_, index) => {
      const paymentDate = new Date(start);
      paymentDate.setMonth(start.getMonth() + index);

      return {
        amount: rentAmount,
        date: paymentDate.toISOString().split('T')[0],
        type: PaymentType.RENT_PAYMENT,
        description: `Arriendo mes ${index + 1}`,
        isAgencyRevenue: false,
      };
    });

    setPayments(generated);
  }, [showMonthlyPayments, monthlyRent, contractDuration, startDate]);

  const propertyOptions = useMemo(() => {
    return properties.map((property) => {
      const location = [property.city, property.state].filter(Boolean).join(', ');
      const priceLabel = typeof property.price === 'number'
        ? formatCurrency(property.price, property.currencyPrice === 'UF' ? 'UF' : 'CLP')
        : null;
      const parts = [property.code, property.title, location, priceLabel].filter(Boolean);
      return {
        id: property.id,
        label: parts.join(' · '),
      };
    });
  }, [properties]);

  const selectedPropertyOption = useMemo(
    () => propertyOptions.find((option) => option.id === propertyId) ?? null,
    [propertyOptions, propertyId],
  );

  const handlePaymentDateChange = (index: number, value: string) => {
    setPayments((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], date: value };
      }
      return updated;
    });
  };

  const disableMonthlyPayments = () => {
    setShowMonthlyPayments(false);
    setPayments([]);
  };

  const enableMonthlyPayments = () => {
    setShowMonthlyPayments(true);
  };

  const handleAddScheduledPayment = () => {
    setScheduledPayments((prev) => [
      ...prev,
      {
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: PaymentType.OTHER,
        description: '',
        isAgencyRevenue: false,
      },
    ]);
  };

  const handleRemoveScheduledPayment = (index: number) => {
    setScheduledPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScheduledPaymentChange = (
    index: number,
    field: keyof ContractPayment,
    value: string | number | boolean,
  ) => {
    setScheduledPayments((prev) => {
      const updated = [...prev];
      const payment = updated[index];
      if (!payment) {
        return prev;
      }
      updated[index] = {
        ...payment,
        [field]: value,
      } as ContractPayment;
      return updated;
    });
  };

  const handleAddPerson = () => {
    setContractPersons((prev) => [...prev, { personId: '', role: ContractRole.GUARANTOR }]);
  };

  const handleRemovePerson = (index: number) => {
    setContractPersons((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePersonChange = (
    index: number,
    field: keyof ContractPerson,
    value: string | { id: string; name: string; dni: string },
  ) => {
    setContractPersons((prev) => {
      const updated = [...prev];
      const current = updated[index];

      if (!current) {
        return prev;
      }

      if (field === 'personId') {
        if (typeof value === 'object') {
          updated[index] = {
            ...current,
            personId: value.id,
            personName: value.name,
            personDni: value.dni,
          };
        } else {
          updated[index] = {
            ...current,
            personId: value,
            personName: value ? current.personName : undefined,
            personDni: value ? current.personDni : undefined,
          };

          if (!value) {
            updated[index].personName = undefined;
            updated[index].personDni = undefined;
          }
        }
      } else if (field === 'role' && typeof value === 'string') {
        updated[index] = { ...current, role: value as ContractRole };
      }

      return updated;
    });
  };

  const handleOpenDocumentDialog = () => {
    setSelectedDocType(null);
    setSelectedPersonForDoc(null);
    setDocumentDescription('');
    setEditingDocIndex(null);
    setShowDocumentDialog(true);
  };

  const handleAddDocument = () => {
    if (!selectedDocType || !documentDescription.trim()) {
      alert.showAlert({
        message: 'Tipo de documento y descripción son obligatorios',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    const newDoc: ContractDocumentForm = {
      documentTypeId: selectedDocType.id,
      documentTypeName: selectedDocType.label,
      personId: selectedPersonForDoc?.id || undefined,
      personName: selectedPersonForDoc?.label || undefined,
      title: documentDescription,
    };

    setContractDocuments((prev) => {
      const updated = [...prev];
      if (editingDocIndex !== null) {
        updated[editingDocIndex] = newDoc;
        return updated;
      }
      return [...prev, newDoc];
    });

    setShowDocumentDialog(false);
  };

  const handleEditDocument = (index: number) => {
    const doc = contractDocuments[index];
    if (!doc) return;

    const docType = documentTypes.find((dt) => dt.id === doc.documentTypeId);
    const person = doc.personId ? personsForSearch.find((p) => p.id === doc.personId) : null;

    setSelectedDocType(docType ? { id: docType.id, label: docType.name } : null);
    setSelectedPersonForDoc(person ? { id: person.id, label: `${person.name} - RUT: ${person.dni}` } : null);
    setDocumentDescription(doc.title);
    setEditingDocIndex(index);
    setShowDocumentDialog(true);
  };

  const handleRemoveDocument = (index: number) => {
    setContractDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const commissionClp = (percent: string) => {
    const rentAmount = parseFloat(monthlyRent) || 0;
    const ufValueNum = parseFloat(ufValue) || 0;
    const percentNum = parseFloat(percent) || 0;
    const base = currency === 'UF' ? rentAmount * ufValueNum : rentAmount;
    return Math.round(base * (percentNum / 100));
  };

  const calculateTotalRent = () => {
    const rentAmount = parseFloat(monthlyRent) || 0;
    const duration = parseInt(contractDuration, 10) || 0;
    return rentAmount * duration;
  };

  const validateStep = (index: number): string | null => {
    if (index === 0 && !propertyId) {
      return 'Selecciona una propiedad.';
    }
    if (index === 1) {
      const rent = parseFloat(monthlyRent);
      const duration = parseInt(contractDuration, 10);
      if (!Number.isFinite(rent) || rent <= 0) return 'Ingresa el arriendo mensual.';
      if (!Number.isFinite(duration) || duration <= 0) return 'Ingresa la duración en meses.';
      if (!startDate) return 'Ingresa la fecha de inicio.';
      if (currency === 'UF' && !(parseFloat(ufValue) > 0)) return 'Ingresa el valor de la UF.';
    }
    if (index === 2) {
      const hasLandlord = contractPersons.some((person) => person.role === ContractRole.LANDLORD && person.personId);
      const hasTenant = contractPersons.some((person) => person.role === ContractRole.TENANT && person.personId);
      if (!hasLandlord || !hasTenant) return 'Elige un arrendador y un arrendatario.';
      if (contractPersons.some((person) => !person.personId)) return 'Completa todas las personas agregadas.';
    }
    if (index === 3) {
      const tenant = parseFloat(tenantCommissionPercent);
      const landlord = parseFloat(landlordCommissionPercent);
      if (!Number.isFinite(tenant) || tenant < 0) return 'Ingresa la comisión del arrendatario.';
      if (!Number.isFinite(landlord) || landlord < 0) return 'Ingresa la comisión del arrendador.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (stepIndex < LAST_RENT_STEP) {
      const error = validateStep(stepIndex);
      if (error) {
        setStepError(error);
        return;
      }
      setStepError(null);
      setStepIndex((current) => Math.min(current + 1, LAST_RENT_STEP));
      return;
    }

    for (let index = 0; index <= 3; index += 1) {
      const error = validateStep(index);
      if (error) {
        setStepIndex(index);
        setStepError(error);
        return;
      }
    }

    setLoading(true);

    try {
      if (!session?.user?.id) {
        alert.showAlert({
          message: 'No se pudo obtener el usuario de la sesión',
          type: 'error',
          duration: 4000,
        });
        setLoading(false);
        return;
      }

      const totalRent = calculateTotalRent();
      const tenantAmount = commissionClp(tenantCommissionPercent);
      const landlordAmount = commissionClp(landlordCommissionPercent);
      const tenantPercent = parseFloat(tenantCommissionPercent) || 0;
      const landlordPercent = parseFloat(landlordCommissionPercent) || 0;
      const rentPayments = showMonthlyPayments ? payments : [];
      const manualScheduledPayments = scheduledPayments.map((payment) => ({
        amount: payment.amount,
        date: payment.date,
        type: payment.type,
        description: payment.description,
        isAgencyRevenue: payment.isAgencyRevenue,
      }));
      const commissionPayments = [
        tenantAmount > 0
          ? {
              amount: tenantAmount,
              date: startDate,
              type: PaymentType.COMMISSION_INCOME,
              description: 'Comisión arrendatario',
              isAgencyRevenue: true,
            }
          : null,
        landlordAmount > 0
          ? {
              amount: landlordAmount,
              date: startDate,
              type: PaymentType.COMMISSION_INCOME,
              description: 'Comisión arrendador',
              isAgencyRevenue: true,
            }
          : null,
      ].filter((payment): payment is NonNullable<typeof payment> => payment !== null);

      const contractData = {
        operation: ContractOperationType.ARRIENDO,
        propertyId,
        userId: session.user.id,
        amount: totalRent,
        currency,
        ufValue: currency === 'UF' ? parseFloat(ufValue) : undefined,
        monthlyRent: parseFloat(monthlyRent),
        commissionPercent: tenantPercent + landlordPercent,
        commissionAmount: tenantAmount + landlordAmount,
        tenantCommissionPercent: tenantPercent,
        tenantCommissionAmount: tenantAmount,
        landlordCommissionPercent: landlordPercent,
        landlordCommissionAmount: landlordAmount,
        description: `${description}
Arriendo mensual: ${formatCurrency(parseFloat(monthlyRent), currency)}
Duración: ${contractDuration} meses
Fecha inicio: ${startDate}
Comisión arrendatario: ${tenantPercent}% (${formatCurrency(tenantAmount, 'CLP')})
Comisión arrendador: ${landlordPercent}% (${formatCurrency(landlordAmount, 'CLP')})${depositAmount ? `
Depósito: ${formatCurrency(parseFloat(depositAmount), currency)}` : ''}`.trim(),
        people: contractPersons.filter((p) => p.personId),
        payments: [
          ...(depositAmount
            ? [{
                amount: parseFloat(depositAmount),
                date: startDate,
                type: PaymentType.DEPOSIT,
                description: 'Depósito/Garantía',
                isAgencyRevenue: depositIsAgencyRevenue,
              }]
            : []),
          ...commissionPayments,
          ...rentPayments.map((payment) => ({
            amount: payment.amount,
            date: payment.date,
            type: payment.type,
            description: payment.description,
            isAgencyRevenue: payment.isAgencyRevenue,
          })),
          ...manualScheduledPayments,
        ],
        documents: contractDocuments.map((doc) => ({
          documentTypeId: doc.documentTypeId,
          personId: doc.personId,
          title: doc.title,
          required: true,
          uploaded: false,
        })),
      };

      await createContract(contractData);

      alert.showAlert({
        message: 'Contrato de arriendo creado exitosamente',
        type: 'success',
        duration: 3000,
      });

      onSuccess?.();
      onClose();
      router.refresh();
      return;
    } catch (error) {
      alert.showAlert({
        message: `Error al crear contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        type: 'error',
        duration: 5000,
      });
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  const tenantAmount = commissionClp(tenantCommissionPercent);
  const landlordAmount = commissionClp(landlordCommissionPercent);
  const commissionAmount = tenantAmount + landlordAmount;
  const totalRent = calculateTotalRent();
  const summaryPayments = showMonthlyPayments ? payments.length : 0;

  const goToStep = (index: number) => {
    setStepError(null);
    setStepIndex(index);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Stepper
        steps={RENT_CONTRACT_STEPS}
        activeIndex={stepIndex}
        allowClickCompletedSteps
        onCompletedStepClick={goToStep}
        data-test-id="create-rent-contract-stepper"
      >
        {stepError ? <Alert variant="error">{stepError}</Alert> : null}

        {stepIndex === 0 && (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Propiedad</h3>
        <AutoComplete
          label="Seleccionar Propiedad"
          placeholder="Buscar propiedad..."
          value={selectedPropertyOption}
          onChange={(option) => {
            const nextId = option ? String(option.id) : '';
            setPropertyId(nextId);

            if (nextId) {
              const selected = properties.find((property) => property.id === nextId);
              if (selected) {
                if (selected.currencyPrice === 'CLP' || selected.currencyPrice === 'UF') {
                  setCurrency(selected.currencyPrice);
                  if (selected.currencyPrice === 'CLP') {
                    setUfValue('');
                  }
                }

                if (typeof selected.price === 'number' && !Number.isNaN(selected.price)) {
                  setMonthlyRent(String(selected.price));
                }
              }
            } else {
              setMonthlyRent('');
            }
          }}
          options={propertyOptions}
          required
        />
      </Card>
        )}

        {stepIndex === 1 && (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Información del Arriendo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextField
            label="Arriendo Mensual"
            type="currency"
            currencySymbol={moneySymbol(currency)}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            required
          />

          <Select
            label="Moneda"
            value={currency}
            onChange={(id) => {
              if (typeof id === 'string') {
                setCurrency(id as 'CLP' | 'UF');
              }
            }}
            options={[
              { id: 'CLP', label: 'Pesos Chilenos (CLP)' },
              { id: 'UF', label: 'Unidad de Fomento (UF)' },
            ]}
          />

          {currency === 'UF' && (
            <TextField
              label="Valor UF"
              type="currency"
              currencySymbol="$"
              value={ufValue}
              onChange={(e) => setUfValue(e.target.value)}
              placeholder="Ej: 38000"
              required
            />
          )}

          <TextField
            label="Depósito/Garantía"
            type="currency"
            currencySymbol={moneySymbol(currency)}
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Depósito/Garantía"
          />

          {depositAmount && (
            <div className="md:col-span-2 lg:col-span-3 flex items-center rounded-lg border border-border px-3 py-2">
              <Switch
                label="Depósito para la empresa"
                labelPosition="right"
                checked={depositIsAgencyRevenue}
                onChange={setDepositIsAgencyRevenue}
              />
            </div>
          )}

          <TextField
            label="Duración (meses)"
            type="number"
            value={contractDuration}
            onChange={(e) => setContractDuration(e.target.value)}
            placeholder="12"
            required
          />

          <TextField
            label="Fecha de Inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        {(monthlyRent && contractDuration) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Total arriendo:</strong>
                <br />
                {formatCurrency(totalRent, currency)}
              </div>
              <div>
                <strong>Pagos mensuales:</strong>
                <br />
                {summaryPayments} cuotas generadas
              </div>
            </div>
          </div>
        )}
      </Card>
        )}

        {stepIndex === 2 && (
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Participantes del Contrato</h3>
          <IconButton icon="add" variant="primary" onClick={handleAddPerson} title="Agregar Persona" />
        </div>

        <div className="space-y-3">
          {contractPersons.map((person, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <AutoComplete
                  label={`Persona ${index + 1}`}
                  placeholder="Buscar persona..."
                  value={person.personId
                    ? {
                        id: person.personId,
                        label:
                          person.personName && person.personDni
                            ? `${person.personName} - ${person.personDni}`
                            : person.personName || person.personId,
                      }
                    : null}
                  onChange={(option) => {
                    if (option) {
                      const personData = personsForSearch.find((p) => p.id === option.id);
                      if (personData) {
                        handlePersonChange(index, 'personId', personData);
                      }
                    } else {
                      handlePersonChange(index, 'personId', '');
                    }
                  }}
                  options={personsForSearch.map((p) => ({
                    id: p.id,
                    label: `${p.name} - ${p.dni || 'Sin RUT'}`,
                  }))}
                  required
                />
              </div>

              <div className="w-48">
                <Select
                  label="Rol"
                  value={person.role}
                  onChange={(id) => {
                    if (typeof id === 'string') {
                      handlePersonChange(index, 'role', id);
                    }
                  }}
                  options={[
                    { id: ContractRole.LANDLORD, label: 'Arrendador' },
                    { id: ContractRole.TENANT, label: 'Arrendatario' },
                    { id: ContractRole.GUARANTOR, label: 'Garante' },
                    { id: ContractRole.NOTARY, label: 'Notario' },
                    { id: ContractRole.WITNESS, label: 'Testigo' },
                    { id: ContractRole.AGENT, label: 'Agente' },
                  ]}
                />
              </div>

              {contractPersons.length > 2 && (
                <IconButton
                  icon="delete"
                  variant="text"
                  className="text-red-500 mb-2"
                  onClick={() => handleRemovePerson(index)}
                  title="Remover persona"
                />
              )}
            </div>
          ))}
        </div>
      </Card>
        )}

        {stepIndex === 3 && (
          <Card className="p-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Comisiones</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cada porcentaje se calcula sobre un mes de arriendo
                {currency === 'UF' ? ' convertido a pesos con el valor UF' : ''}.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                label="Comisión arrendatario (%)"
                type="number"
                step="0.1"
                min="0"
                value={tenantCommissionPercent}
                onChange={(e) => setTenantCommissionPercent(e.target.value)}
                required
              />
              <TextField
                label="Comisión arrendador (%)"
                type="number"
                step="0.1"
                min="0"
                value={landlordCommissionPercent}
                onChange={(e) => setLandlordCommissionPercent(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-900/20 md:grid-cols-3">
              <div>
                <strong>Arrendatario:</strong>
                <br />
                $ {tenantAmount.toLocaleString('es-CL')}
              </div>
              <div>
                <strong>Arrendador:</strong>
                <br />
                $ {landlordAmount.toLocaleString('es-CL')}
              </div>
              <div>
                <strong>Total empresa:</strong>
                <br />
                $ {commissionAmount.toLocaleString('es-CL')}
              </div>
            </div>
          </Card>
        )}

        {stepIndex === 4 && (
          <>
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Comisiones de la empresa</h3>
        {tenantAmount <= 0 && landlordAmount <= 0 ? (
          <p className="text-sm text-muted-foreground">No hay comisiones para cobrar en este contrato.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {tenantAmount > 0 && (
              <p>Comisión arrendatario: $ {tenantAmount.toLocaleString('es-CL')} · {startDate || 'sin fecha'}</p>
            )}
            {landlordAmount > 0 && (
              <p>Comisión arrendador: $ {landlordAmount.toLocaleString('es-CL')} · {startDate || 'sin fecha'}</p>
            )}
          </div>
        )}
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cronograma de Pagos Mensuales</h3>
          {showMonthlyPayments ? (
            <Button type="button" variant="outlined" onClick={disableMonthlyPayments}>
              Desactivar seguimiento
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={enableMonthlyPayments}>
              Volver a generar
            </Button>
          )}
        </div>

        {showMonthlyPayments ? (
          payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Completa el arriendo mensual, la fecha de inicio y la duración para generar los pagos.
            </p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div
                  key={`${payment.date}-${index}`}
                  className="border border-border rounded-lg p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(payment.amount, currency)}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <TextField
                      label="Fecha estimada"
                      type="date"
                      value={payment.date}
                      onChange={(e) => handlePaymentDateChange(index, e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            El seguimiento de los pagos mensuales está desactivado. Podrás volver a generarlos en cualquier momento.
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pagos Programados</h3>
          <IconButton
            icon="add"
            variant="primary"
            onClick={handleAddScheduledPayment}
            title="Agregar Pago"
          />
        </div>

        {scheduledPayments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay pagos programados adicionales. Puedes agregarlos según se definan en el contrato.
          </p>
        ) : (
          <div className="space-y-4">
            {scheduledPayments.map((payment, index) => (
              <div key={index} className="p-4 border rounded-lg bg-card">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Pago #{index + 1}</h4>
                  <IconButton
                    icon="delete"
                    variant="text"
                    className="text-red-500"
                    onClick={() => handleRemoveScheduledPayment(index)}
                    title="Remover pago"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <TextField
                    label="Monto"
                    type="currency"
                    value={Number.isFinite(payment.amount) ? payment.amount.toString() : ''}
                    onChange={(e) => handleScheduledPaymentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                    currencySymbol={moneySymbol(currency)}
                  />

                  <TextField
                    label="Fecha"
                    type="date"
                    value={payment.date}
                    onChange={(e) => handleScheduledPaymentChange(index, 'date', e.target.value)}
                  />

                  <Select
                    label="Tipo"
                    value={payment.type}
                    onChange={(id) => handleScheduledPaymentChange(index, 'type', id as PaymentType)}
                    options={[
                      { id: PaymentType.RENT_PAYMENT, label: 'Pago de Arriendo' },
                      { id: PaymentType.MAINTENANCE_FEE, label: 'Gasto Común / Administración' },
                      { id: PaymentType.UTILITIES, label: 'Servicios Básicos' },
                      { id: PaymentType.COMMISSION_INCOME, label: 'Comisión' },
                      { id: PaymentType.DEPOSIT, label: 'Depósito' },
                      { id: PaymentType.OTHER, label: 'Otro' },
                    ]}
                  />
                </div>

                <TextField
                  label="Descripción"
                  value={payment.description || ''}
                  onChange={(e) => handleScheduledPaymentChange(index, 'description', e.target.value)}
                  placeholder="Opcional"
                  multiline
                  rows={2}
                />

                <div className="flex items-center mt-3">
                  <Switch
                    label="Ingreso para la empresa"
                    labelPosition="right"
                    checked={payment.isAgencyRevenue}
                    onChange={(checked) => handleScheduledPaymentChange(index, 'isAgencyRevenue', checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
          </>
        )}

        {stepIndex === 5 && (
          <>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Documentos Requeridos</h3>
          <IconButton icon="add" variant="primary" onClick={handleOpenDocumentDialog} title="Agregar documento" />
        </div>

        {contractDocuments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay documentos agregados. Haz clic en + para agregar.</p>
        ) : (
          <div className="space-y-3">
            {contractDocuments.map((doc, index) => (
              <Card key={index} className="p-3 bg-muted/30">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{doc.documentTypeName}</div>
                    {doc.personName && <div className="text-sm text-muted-foreground mt-1">👤 {doc.personName}</div>}
                    <div className="text-sm mt-1 text-foreground/80">{doc.title}</div>
                  </div>
                  <div className="flex gap-2">
                    <IconButton icon="edit" variant="text" onClick={() => handleEditDocument(index)} title="Editar" />
                    <IconButton
                      icon="delete"
                      variant="text"
                      className="text-red-500"
                      onClick={() => handleRemoveDocument(index)}
                      title="Eliminar"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Dialog
        open={showDocumentDialog}
        onClose={() => setShowDocumentDialog(false)}
        title={editingDocIndex !== null ? 'Editar Documento' : 'Agregar Documento Requerido'}
        maxWidth="md"
      >
        <div className="space-y-4 p-4">
          <AutoComplete
            label="Tipo de Documento *"
            options={documentTypes.map((dt) => ({ id: dt.id, label: dt.name }))}
            value={selectedDocType}
            onChange={(option) => setSelectedDocType(option)}
            placeholder="Selecciona un tipo de documento"
          />

          <AutoComplete
            label="Persona Asociada (Opcional)"
            options={personsForSearch.map((person) => ({
              id: person.id,
              label: `${person.name} - RUT: ${person.dni}`,
            }))}
            value={selectedPersonForDoc}
            onChange={(option) => setSelectedPersonForDoc(option)}
            placeholder="Buscar persona por nombre o RUT..."
          />

          <TextField
            label="Descripción / Título *"
            value={documentDescription}
            onChange={(e) => setDocumentDescription(e.target.value)}
            multiline
            rows={3}
            placeholder="Ej: Contrato de trabajo del arrendatario"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outlined" onClick={() => setShowDocumentDialog(false)} type="button">
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddDocument} type="button">
              {editingDocIndex !== null ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
        </div>
      </Dialog>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Información Adicional</h3>
        <TextField
          label="Observaciones"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Cláusulas especiales, condiciones particulares..."
        />
      </Card>
          </>
        )}
      </Stepper>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outlined" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => goToStep(Math.max(stepIndex - 1, 0))}
          disabled={loading || stepIndex <= 0}
        >
          Atrás
        </Button>
        {stepIndex < LAST_RENT_STEP ? (
          <Button type="submit" variant="primary" disabled={loading}>
            Siguiente
          </Button>
        ) : (
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              'Crear Contrato'
            )}
          </Button>
        )}
      </div>
    </form>
  );
}

