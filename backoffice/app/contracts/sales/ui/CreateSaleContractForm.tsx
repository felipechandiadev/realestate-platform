'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useAlert } from '@/shared/hooks/useAlert';
import { createContract } from '@/features/contracts/actions/contracts.action';
import { getSalePropertiesGrid, type SalePropertyGridRow } from '@/features/properties/actions/properties.action';
import { listPersons, searchPersons } from '@/features/contracts/actions/persons.action';
import { listAdminsAgents } from '@/features/users/actions/users.action';
import { getDocumentTypes } from '@/features/contracts/actions/documentTypes.action';
import type { Person } from '@/features/contracts/actions/persons.action';
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

interface CreateSaleContractFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const moneySymbol = (curr: 'CLP' | 'UF' | string = 'CLP') => (curr === 'UF' ? 'UF' : '$');

const formatCurrency = (amount: number, curr: 'CLP' | 'UF' | string = 'CLP') => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${moneySymbol(curr)} ${safeAmount.toLocaleString('es-CL')}`;
};

const SALE_CONTRACT_STEPS: StepperStepItem[] = [
  { id: 'property', title: 'Propiedad', description: 'Elige la propiedad y el agente' },
  { id: 'terms', title: 'Condiciones', description: 'Precio de venta y moneda' },
  { id: 'people', title: 'Participantes', description: 'Vendedor, comprador y otros roles' },
  { id: 'commission', title: 'Comisiones', description: 'Porcentaje del comprador y del vendedor sobre el precio' },
  { id: 'payments', title: 'Pagos', description: 'Comisiones y pagos programados' },
  { id: 'close', title: 'Cierre', description: 'Documentos requeridos y observaciones' },
];

const LAST_SALE_STEP = SALE_CONTRACT_STEPS.length - 1;

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
  notes?: string;
}

export default function CreateSaleContractForm({ onClose, onSuccess }: CreateSaleContractFormProps) {
  const alert = useAlert();
  const router = useRouter();
  const { data: session } = useSession();

  // Form state
  const [propertyId, setPropertyId] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<{ id: string; code: string; title: string } | null>(null);
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'CLP' | 'UF'>('CLP');
  const [ufValue, setUfValue] = useState('');
  const [buyerCommissionPercent, setBuyerCommissionPercent] = useState('1.75');
  const [sellerCommissionPercent, setSellerCommissionPercent] = useState('1.75');
  const [description, setDescription] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  // Related data
  const [properties, setProperties] = useState<SalePropertyGridRow[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [personsForSearch, setPersonsForSearch] = useState<Array<{ id: string; name: string; dni: string }>>([]);
  const [agents, setAgents] = useState<Array<{ id: string; displayName: string }>>([]);

  // Contract participants
  const [contractPersons, setContractPersons] = useState<ContractPerson[]>([
    { personId: '', role: ContractRole.SELLER },
    { personId: '', role: ContractRole.BUYER },
  ]);

  // Payments
  const [payments, setPayments] = useState<ContractPayment[]>([]);

  // Documents
  const [contractDocuments, setContractDocuments] = useState<ContractDocumentForm[]>([]);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<{ id: string; label: string } | null>(null);
  const [selectedPersonForDoc, setSelectedPersonForDoc] = useState<{ id: string; label: string } | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentNotes, setDocumentNotes] = useState('');
  const [editingDocIndex, setEditingDocIndex] = useState<number | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [propertiesData, personsData, documentTypesData, personsSearchData, agentsData] = await Promise.all([
          getSalePropertiesGrid({ limit: 100, pagination: false }),
          listPersons({ limit: 100 }),
          getDocumentTypes(),
          searchPersons(),
          listAdminsAgents({ limit: 100 }),
        ]);

        // Handle properties response - can be array or paginated object
        if (Array.isArray(propertiesData)) {
          setProperties(propertiesData);
        } else if (propertiesData && typeof propertiesData === 'object' && 'data' in propertiesData) {
          setProperties(Array.isArray(propertiesData.data) ? propertiesData.data : []);
        } else {
          setProperties([]);
        }

        setPersons(Array.isArray(personsData) ? personsData : []);
        setDocumentTypes(
          documentTypesData.success && Array.isArray(documentTypesData.data)
            ? documentTypesData.data
            : [],
        );
        setPersonsForSearch(Array.isArray(personsSearchData) ? personsSearchData : []);
        
        // Format agents for Select component
        if (agentsData && agentsData.success && agentsData.data && Array.isArray(agentsData.data.data)) {
          const formattedAgents = agentsData.data.data.map((agent: any) => ({
            id: agent.id,
            displayName: `${agent.personalInfo?.firstName || ''} ${agent.personalInfo?.lastName || ''}`.trim() + 
                        ` (${agent.role === 'ADMINISTRATOR' ? 'Admin' : 'Agente'})`,
          }));
          setAgents(formattedAgents);
        } else {
          console.warn('No agents data received or invalid format:', agentsData);
          setAgents([]);
        }
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
  }, []);

  const handleAddPerson = () => {
    setContractPersons([...contractPersons, { personId: '', role: ContractRole.NOTARY }]);
  };

  const handleRemovePerson = (index: number) => {
    setContractPersons(contractPersons.filter((_, i) => i !== index));
  };

  const handlePersonChange = (index: number, field: keyof ContractPerson, value: string | { id: string; name: string; dni: string }) => {
    const updated = [...contractPersons];
    
    if (field === 'personId' && typeof value === 'object') {
      // When selecting a person, store id, name, and dni
      updated[index] = { 
        ...updated[index], 
        personId: value.id,
        personName: value.name,
        personDni: value.dni,
      };
    } else {
      // For other fields (like role), just update the field
      updated[index] = { ...updated[index], [field]: value };
    }
    
    setContractPersons(updated);
  };

  const handleAddPayment = () => {
    setPayments([...payments, {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: PaymentType.SALE_DOWN_PAYMENT,
      description: '',
      isAgencyRevenue: false,
    }]);
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index: number, field: keyof ContractPayment, value: string | number | boolean) => {
    const updated = [...payments];
    updated[index] = { ...updated[index], [field]: value };
    setPayments(updated);
  };

  const handleOpenDocumentDialog = () => {
    setSelectedDocType(null);
    setSelectedPersonForDoc(null);
    setDocumentTitle('');
    setDocumentNotes('');
    setEditingDocIndex(null);
    setShowDocumentDialog(true);
  };

  const handleAddDocument = () => {
    if (!selectedDocType || !documentTitle.trim()) {
      alert.showAlert({
        message: 'Tipo de documento y título son obligatorios',
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
      title: documentTitle.trim(),
      notes: documentNotes.trim() || undefined,
    };

    if (editingDocIndex !== null) {
      const updated = [...contractDocuments];
      updated[editingDocIndex] = newDoc;
      setContractDocuments(updated);
    } else {
      setContractDocuments([...contractDocuments, newDoc]);
    }

    setShowDocumentDialog(false);
  };

  const handleEditDocument = (index: number) => {
    const doc = contractDocuments[index];
    
    // Find complete objects from IDs
    const docType = documentTypes.find(dt => dt.id === doc.documentTypeId);
    const person = doc.personId ? personsForSearch.find(p => p.id === doc.personId) : null;
    
    setSelectedDocType(docType ? { id: docType.id, label: docType.name } : null);
    setSelectedPersonForDoc(person ? { id: person.id, label: `${person.name} - RUT: ${person.dni}` } : null);
    setDocumentTitle(doc.title);
    setDocumentNotes(doc.notes ?? '');
    setEditingDocIndex(index);
    setShowDocumentDialog(true);
  };

  const handleRemoveDocument = (index: number) => {
    setContractDocuments(contractDocuments.filter((_, i) => i !== index));
  };

  const saleBaseClp = () => {
    const amountNum = parseFloat(amount) || 0;
    const ufValueNum = parseFloat(ufValue) || 0;
    return currency === 'UF' ? amountNum * ufValueNum : amountNum;
  };

  const commissionClp = (percent: string) => {
    const percentNum = parseFloat(percent) || 0;
    return Math.round(saleBaseClp() * (percentNum / 100));
  };

  const validateStep = (index: number): string | null => {
    if (index === 0) {
      if (!propertyId) return 'Selecciona una propiedad.';
      if (!assignedAgentId) return 'Selecciona el agente asignado.';
    }
    if (index === 1) {
      const saleAmount = parseFloat(amount);
      if (!Number.isFinite(saleAmount) || saleAmount <= 0) return 'Ingresa el monto de venta.';
      if (currency === 'UF' && !(parseFloat(ufValue) > 0)) return 'Ingresa el valor de la UF.';
    }
    if (index === 2) {
      const hasSeller = contractPersons.some((person) => person.role === ContractRole.SELLER && person.personId);
      const hasBuyer = contractPersons.some((person) => person.role === ContractRole.BUYER && person.personId);
      if (!hasSeller || !hasBuyer) return 'Elige un vendedor y un comprador.';
      if (contractPersons.some((person) => !person.personId)) return 'Completa todas las personas agregadas.';
    }
    if (index === 3) {
      const buyer = parseFloat(buyerCommissionPercent);
      const seller = parseFloat(sellerCommissionPercent);
      if (!Number.isFinite(buyer) || buyer < 0) return 'Ingresa la comisión del comprador.';
      if (!Number.isFinite(seller) || seller < 0) return 'Ingresa la comisión del vendedor.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (stepIndex < LAST_SALE_STEP) {
      const error = validateStep(stepIndex);
      if (error) {
        setStepError(error);
        return;
      }
      setStepError(null);
      setStepIndex((current) => Math.min(current + 1, LAST_SALE_STEP));
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

      const buyerPercent = parseFloat(buyerCommissionPercent) || 0;
      const sellerPercent = parseFloat(sellerCommissionPercent) || 0;
      const buyerAmount = commissionClp(buyerCommissionPercent);
      const sellerAmount = commissionClp(sellerCommissionPercent);
      const commissionDate = new Date().toISOString().split('T')[0];
      const commissionPayments = [
        buyerAmount > 0
          ? {
              amount: buyerAmount,
              date: commissionDate,
              type: PaymentType.COMMISSION_INCOME,
              currency: 'CLP' as const,
              description: 'Comisión comprador',
              isAgencyRevenue: true,
            }
          : null,
        sellerAmount > 0
          ? {
              amount: sellerAmount,
              date: commissionDate,
              type: PaymentType.COMMISSION_INCOME,
              currency: 'CLP' as const,
              description: 'Comisión vendedor',
              isAgencyRevenue: true,
            }
          : null,
      ].filter((payment): payment is NonNullable<typeof payment> => payment !== null);

      const contractData = {
        operation: 'COMPRAVENTA' as ContractOperationType,
        propertyId,
        userId: assignedAgentId,
        amount: parseFloat(amount),
        currency,
        ufValue: currency === 'UF' ? parseFloat(ufValue) : undefined,
        commissionPercent: buyerPercent + sellerPercent,
        commissionAmount: buyerAmount + sellerAmount,
        tenantCommissionPercent: buyerPercent,
        tenantCommissionAmount: buyerAmount,
        landlordCommissionPercent: sellerPercent,
        landlordCommissionAmount: sellerAmount,
        description: `${description}
Comisión comprador: ${buyerPercent}% (${formatCurrency(buyerAmount, 'CLP')})
Comisión vendedor: ${sellerPercent}% (${formatCurrency(sellerAmount, 'CLP')})`.trim(),
        people: contractPersons.filter(p => p.personId),
        payments: [
          ...commissionPayments,
          ...payments.map(p => ({
            amount: p.amount,
            date: p.date,
            type: p.type,
            description: p.description,
            isAgencyRevenue: p.isAgencyRevenue,
          })),
        ],
        documents: contractDocuments.map(doc => ({
          documentTypeId: doc.documentTypeId,
          personId: doc.personId,
          title: doc.title,
          notes: doc.notes,
          required: true,
          uploaded: false,
        })),
      };

      const result = await createContract(contractData);

      if (result.success) {
        alert.showAlert({
          message: 'Contrato de venta creado exitosamente',
          type: 'success',
          duration: 3000,
        });

        onSuccess?.();
        onClose();
        router.refresh();
        return;
      }

      alert.showAlert({
        message: `Error al crear contrato: ${result.error || 'Error desconocido'}`,
        type: 'error',
        duration: 5000,
      });
      setLoading(false);
    } catch (error) {
      alert.showAlert({
        message: `Error inesperado al crear contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`,
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

  const buyerAmount = commissionClp(buyerCommissionPercent);
  const sellerAmount = commissionClp(sellerCommissionPercent);
  const commissionAmount = buyerAmount + sellerAmount;

  const goToStep = (index: number) => {
    setStepError(null);
    setStepIndex(index);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Stepper
        steps={SALE_CONTRACT_STEPS}
        activeIndex={stepIndex}
        allowClickCompletedSteps
        onCompletedStepClick={goToStep}
        data-test-id="create-sale-contract-stepper"
      >
        {stepError ? <Alert variant="error">{stepError}</Alert> : null}

        {stepIndex === 0 && (
      <>
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Propiedad</h3>
        <AutoComplete
          label="Seleccionar Propiedad"
          placeholder="Buscar propiedad..."
          value={selectedProperty ? {
            id: selectedProperty.id,
            label: `${selectedProperty.code} - ${selectedProperty.title}`
          } : null}
          onChange={(option) => {
            if (option) {
              const property = properties.find((p: SalePropertyGridRow) => p.id === option.id);
              if (property) {
                setPropertyId(option.id);
                setSelectedProperty({
                  id: property.id,
                  code: property.code || 'Sin código',
                  title: property.title || 'Sin título',
                });

                if (property.currencyPrice === 'CLP' || property.currencyPrice === 'UF') {
                  setCurrency(property.currencyPrice);
                  if (property.currencyPrice === 'CLP') {
                    setUfValue('');
                  }
                }

                if (typeof property.price === 'number' && !Number.isNaN(property.price)) {
                  setAmount(String(property.price));
                }

                const agentId =
                  property.assignedAgentId ||
                  property.assignedAgent?.id ||
                  '';
                setAssignedAgentId(typeof agentId === 'string' ? agentId : '');
              }
            } else {
              setPropertyId('');
              setSelectedProperty(null);
              setAmount('');
              setAssignedAgentId('');
              setCurrency('CLP');
              setUfValue('');
            }
          }}
          options={properties.map((p: SalePropertyGridRow) => ({
            id: p.id,
            label: `${p.code || 'Sin código'} - ${p.title}`.trim(),
          }))}
          required
        />
      </Card>

      {/* Assigned Agent */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Agente Asignado</h3>
        <Select
          label="Seleccionar Agente"
          placeholder="Seleccione el agente asignado"
          value={assignedAgentId}
          onChange={(id: string | number | null) => setAssignedAgentId(id as string || '')}
          options={agents.map(agent => ({
            id: agent.id,
            label: agent.displayName,
          }))}
          required
        />
      </Card>
      </>
        )}

        {stepIndex === 1 && (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Información Financiera</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Monto de Venta"
            type="currency"
            currencySymbol={moneySymbol(currency)}
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAmount(e.target.value)}
            required
          />

          <Select
            label="Moneda"
            value={currency}
            onChange={(id: string | number | null) => setCurrency(id as 'CLP' | 'UF')}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setUfValue(e.target.value)}
              placeholder="Ej: 38000"
              required
            />
          )}
        </div>
      </Card>
        )}

        {stepIndex === 2 && (
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Participantes del Contrato</h3>
          <IconButton
            icon="add"
            variant="primary"
            onClick={handleAddPerson}
            title="Agregar Persona"
          />
        </div>

        <div className="space-y-3">
          {contractPersons.map((person, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <AutoComplete
                  label={`Persona ${index + 1}`}
                  placeholder="Buscar persona..."
                  value={person.personId ? {
                    id: person.personId,
                    label: person.personName && person.personDni 
                      ? `${person.personName} - ${person.personDni}` 
                      : person.personName || person.personId
                  } : null}
                  onChange={(option) => {
                    if (option) {
                      const personData = personsForSearch.find(p => p.id === option.id);
                      if (personData) {
                        handlePersonChange(index, 'personId', personData);
                      }
                    } else {
                      handlePersonChange(index, 'personId', '');
                    }
                  }}
                  options={personsForSearch.map(p => ({
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
                  onChange={(id: string | number | null) => handlePersonChange(index, 'role', id as string)}
                  options={[
                    { id: 'SELLER', label: 'Vendedor' },
                    { id: 'BUYER', label: 'Comprador' },
                    { id: 'NOTARY', label: 'Notario' },
                    { id: 'REGISTRAR', label: 'Registrador' },
                    { id: 'WITNESS', label: 'Testigo' },
                    { id: 'AGENT', label: 'Agente' },
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
                Cada porcentaje se calcula sobre el precio de venta
                {currency === 'UF' ? ' convertido a pesos con el valor UF' : ''}.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                label="Comisión comprador (%)"
                type="number"
                step="0.01"
                min="0"
                value={buyerCommissionPercent}
                onChange={(e) => setBuyerCommissionPercent(e.target.value)}
                required
              />
              <TextField
                label="Comisión vendedor (%)"
                type="number"
                step="0.01"
                min="0"
                value={sellerCommissionPercent}
                onChange={(e) => setSellerCommissionPercent(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-900/20 md:grid-cols-3">
              <div>
                <strong>Comprador:</strong>
                <br />
                $ {buyerAmount.toLocaleString('es-CL')}
              </div>
              <div>
                <strong>Vendedor:</strong>
                <br />
                $ {sellerAmount.toLocaleString('es-CL')}
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
        {buyerAmount <= 0 && sellerAmount <= 0 ? (
          <p className="text-sm text-muted-foreground">No hay comisiones para cobrar en este contrato.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {buyerAmount > 0 && (
              <p>Comisión comprador: $ {buyerAmount.toLocaleString('es-CL')}</p>
            )}
            {sellerAmount > 0 && (
              <p>Comisión vendedor: $ {sellerAmount.toLocaleString('es-CL')}</p>
            )}
          </div>
        )}
      </Card>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pagos Programados</h3>
          <IconButton
            icon="add"
            variant="primary"
            onClick={handleAddPayment}
            title="Agregar Pago"
          />
        </div>

        {payments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay pagos programados. Los pagos se pueden agregar después de crear el contrato.
          </p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div key={index} className="p-4 border rounded-lg bg-card">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Pago #{index + 1}</h4>
                  <IconButton
                    icon="delete"
                    variant="text"
                    className="text-red-500"
                    onClick={() => handleRemovePayment(index)}
                    title="Remover pago"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <TextField
                    label="Monto"
                    type="currency"
                    value={payment.amount.toString()}
                    onChange={(e) => handlePaymentChange(index, 'amount', parseFloat(e.target.value))}
                    currencySymbol={currency === 'UF' ? 'UF' : '$'}
                  />

                  <TextField
                    label="Fecha"
                    type="date"
                    value={payment.date}
                    onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                  />

                  <Select
                    label="Tipo"
                    value={payment.type}
                    onChange={(id: string | number | null) => handlePaymentChange(index, 'type', id as PaymentType)}
                    options={[
                      { id: 'SALE_DOWN_PAYMENT', label: 'Pie/Cuota Inicial' },
                      { id: 'SALE_INSTALLMENT', label: 'Cuota Mensual' },
                      { id: 'SALE_FINAL_PAYMENT', label: 'Pago Final' },
                      { id: 'COMMISSION_INCOME', label: 'Comisión' },
                    ]}
                  />
                </div>

                <TextField
                  label="Descripción"
                  value={payment.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handlePaymentChange(index, 'description', e.target.value)}
                  placeholder="Opcional"
                  multiline
                  rows={2}
                />

                <div className="flex items-center mt-3">
                  <Switch
                    label="Ingreso para la empresa"
                    labelPosition="right"
                    checked={payment.isAgencyRevenue}
                    onChange={(checked) => handlePaymentChange(index, 'isAgencyRevenue', checked)}
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
          <IconButton
            icon="add"
            variant="primary"
            onClick={handleOpenDocumentDialog}
            title="Agregar documento"
          />
        </div>

        {contractDocuments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay documentos agregados. Haz clic en + para agregar.
          </p>
        ) : (
          <div className="space-y-3">
            {contractDocuments.map((doc, index) => (
              <Card key={index} className="p-3 bg-muted/30">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{doc.documentTypeName}</div>
                    {doc.personName && (
                      <div className="text-sm text-muted-foreground mt-1">
                        👤 {doc.personName}
                      </div>
                    )}
                      <div className="text-sm mt-1 text-foreground/80 font-medium">{doc.title}</div>
                      {doc.notes && (
                        <div className="text-xs mt-1 text-muted-foreground whitespace-pre-wrap">
                          {doc.notes}
                        </div>
                      )}
                  </div>
                  <div className="flex gap-2">
                    <IconButton
                      icon="edit"
                      variant="text"
                      onClick={() => handleEditDocument(index)}
                      title="Editar"
                    />
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

      {/* Document Dialog */}
      <Dialog
        open={showDocumentDialog}
        onClose={() => setShowDocumentDialog(false)}
        title={editingDocIndex !== null ? "Editar Documento" : "Agregar Documento Requerido"}
        maxWidth="md"
      >
        <div className="space-y-4 p-4">
          <AutoComplete
            label="Tipo de Documento *"
            options={documentTypes.map(dt => ({ id: dt.id, label: dt.name }))}
            value={selectedDocType}
            onChange={(option) => setSelectedDocType(option)}
            placeholder="Selecciona un tipo de documento"
          />
          
          <AutoComplete
            label="Persona Asociada (Opcional)"
            options={personsForSearch.map(person => ({
              id: person.id,
              label: `${person.name} - RUT: ${person.dni}`
            }))}
            value={selectedPersonForDoc}
            onChange={(option) => setSelectedPersonForDoc(option)}
            placeholder="Buscar persona por nombre o RUT..."
          />
          
          <TextField
            label="Título *"
            value={documentTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDocumentTitle(e.target.value)}
            placeholder="Ej: DNI vigente del comprador"
          />

          <TextField
            label="Notas (opcional)"
            value={documentNotes}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDocumentNotes(e.target.value)}
            multiline
            rows={3}
            placeholder="Detalles extras para identificar el documento"
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outlined" 
              onClick={() => setShowDocumentDialog(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddDocument}
              type="button"
            >
              {editingDocIndex !== null ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Description */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Información Adicional</h3>
        <TextField
          label="Descripción"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Observaciones adicionales del contrato..."
        />
      </Card>
          </>
        )}
      </Stepper>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
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
        {stepIndex < LAST_SALE_STEP ? (
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