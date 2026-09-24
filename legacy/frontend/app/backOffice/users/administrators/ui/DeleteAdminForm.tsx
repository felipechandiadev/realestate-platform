'use client';

import React, { useState } from 'react';
import { DeleteBaseForm } from '@/shared/components/ui/BaseForm';
import { deleteUser } from '@/features/backoffice/users/actions/users.action';
import type { AdministratorType } from './types';

interface DeleteAdminFormProps {
	administrator: AdministratorType | null;
	onSubmitSuccess: () => void;
	onError: (error: string) => void;
	onClose?: () => void;
}

const DeleteAdminForm: React.FC<DeleteAdminFormProps> = ({
	administrator,
	onSubmitSuccess,
	onError,
	onClose,
}) => {
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		if (!administrator) return;

		setLoading(true);
		try {
			const result = await deleteUser(administrator.id);
			if (!result.success) {
				onError(result.error || 'Error al eliminar el administrador');
				setLoading(false);
				return;
			}

			onSubmitSuccess();
		} catch (err) {
			onError('Error inesperado al eliminar el administrador');
		} finally {
			setLoading(false);
		}
	};

	const fullName = administrator
		? `${administrator.personalInfo?.firstName ?? ''} ${administrator.personalInfo?.lastName ?? ''}`.trim() ||
		  administrator.username ||
		  administrator.email
		: '';

	return (
		<DeleteBaseForm
			message={`¿Estás seguro de que quieres eliminar al administrador "${fullName}"?`}
			subtitle="Esta acción no se puede deshacer."
            title=''
			isSubmitting={loading}
			submitLabel="Eliminar"
			onSubmit={handleSubmit}
			cancelButton={true}
			cancelButtonText="Cancelar"
			onCancel={onClose}
		/>
	);
};

export default DeleteAdminForm;