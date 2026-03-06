'use client';

import React, { useState } from 'react';
import { UpdateBaseForm, BaseUpdateFormField } from '@/shared/components/ui/BaseForm';
import { updateUser, setUserStatus, updateUserAvatar } from '@/features/backoffice/users/actions/users.action';
import { env } from '@/lib/env';
import type { AdministratorType } from './types';

interface UpdateAdminFormProps {
	administrator: AdministratorType | null;
	onSubmitSuccess: () => void; // Callback after successful update
	onError: (error: string) => void; // Callback for errors
	onClose?: () => void; // Callback for close button
}

const UpdateAdminForm: React.FC<UpdateAdminFormProps> = ({
	administrator,
	onSubmitSuccess,
	onError,
	onClose,
}) => {
	const [loading, setLoading] = useState(false);

	// Initialize form with administrator data
	const getInitialState = () => {
		if (!administrator) return {};

		const statusMap: Record<string, number> = {
			'ACTIVE': 1,
			'INACTIVE': 2,
		};

		// Build full avatar URL if it exists
		let avatarUrl = '';
		if (administrator.personalInfo?.avatarUrl) {
			if (administrator.personalInfo.avatarUrl.startsWith('http')) {
				avatarUrl = administrator.personalInfo.avatarUrl;
			} else {
				avatarUrl = `${env.backendApiUrl}${administrator.personalInfo.avatarUrl}`;
			}
		}

		return {
			username: administrator.username || '',
			email: administrator.email || '',
			firstName: administrator.personalInfo?.firstName || '',
			lastName: administrator.personalInfo?.lastName || '',
			phone: administrator.personalInfo?.phone || '',
			company: administrator.personalInfo?.company || '',
			nationality: administrator.personalInfo?.nationality || '',
			maritalStatus: administrator.personalInfo?.maritalStatus || '',
			status: statusMap[administrator.status] || 1,
			avatar: avatarUrl,
			avatarFile: null,
		};
	};

	const handleSubmit = async (values: Record<string, any>) => {
		if (!administrator) return;

		setLoading(true);
		try {
			// Basic validations
			if (!values.username?.trim()) {
				onError('El nombre de usuario es obligatorio');
				setLoading(false);
				return;
			}
			if (!values.email?.trim()) {
				onError('El email es obligatorio');
				setLoading(false);
				return;
			}

			// Upload avatar if changed
			let avatarUrl = administrator.personalInfo?.avatarUrl;
			if (values.avatarFile) {
				const avatarFormData = new FormData();
				avatarFormData.append('file', values.avatarFile);
				const avatarResult = await updateUserAvatar(administrator.id, avatarFormData);
				if (!avatarResult.success) {
					onError(avatarResult.error || 'Error al actualizar el avatar');
					setLoading(false);
					return;
				}
				avatarUrl = avatarResult.data?.avatarUrl;
			}

			const statusMap: Record<number, string> = {
				1: 'ACTIVE',
				2: 'INACTIVE',
			};
			const newStatus = statusMap[values.status] || 'ACTIVE';
			const currentStatus = administrator.status;

			// Update user data (excluding status)
			const updateData = {
				username: values.username.trim(),
				email: values.email.trim(),
				personalInfo: {
					firstName: values.firstName?.trim() || undefined,
					lastName: values.lastName?.trim() || undefined,
					phone: values.phone?.trim() || undefined,
					company: values.company?.trim() || undefined,
					nationality: values.nationality?.trim() || undefined,
					maritalStatus: values.maritalStatus?.trim() || undefined,
					avatarUrl: avatarUrl || undefined,
				},
			};

			const result = await updateUser(administrator.id, updateData);
			if (!result.success) {
				onError(result.error || 'Error al actualizar el administrador');
				setLoading(false);
				return;
			}

			// Update status if changed
			if (newStatus !== currentStatus) {
				const statusResult = await setUserStatus(administrator.id, newStatus as 'ACTIVE' | 'INACTIVE');
				if (!statusResult.success) {
					onError(statusResult.error || 'Error al actualizar el estado');
					setLoading(false);
					return;
				}
			}

			onSubmitSuccess();
		} catch (err) {
			onError('Error inesperado al actualizar el administrador');
		} finally {
			setLoading(false);
		}
	};

	const fields: BaseUpdateFormField[] = [
		{
			name: 'username',
			label: 'Nombre de usuario',
			type: 'text',
			required: true,
		},
		{
			name: 'email',
			label: 'Email',
			type: 'email',
			required: true,
		},
		{
			name: 'firstName',
			label: 'Nombre',
			type: 'text',
		},
		{
			name: 'lastName',
			label: 'Apellido',
			type: 'text',
		},
		{
			name: 'phone',
			label: 'Teléfono',
			type: 'text',
		},
		{
			name: 'company',
			label: 'Empresa',
			type: 'text',
		},
		{
			name: 'nationality',
			label: 'Nacionalidad',
			type: 'text',
		},
		{
			name: 'maritalStatus',
			label: 'Estado Civil',
			type: 'select',
			options: [
				{ id: 'SINGLE', label: 'Soltero(a)' },
				{ id: 'MARRIED', label: 'Casado(a)' },
				{ id: 'DIVORCED', label: 'Divorciado(a)' },
				{ id: 'WIDOWED', label: 'Viudo(a)' },
			],
		},
		{
			name: 'avatar',
			label: 'Avatar',
			type: 'avatar',
			currentUrl: (() => {
				if (!administrator?.personalInfo?.avatarUrl) return undefined;
				if (administrator.personalInfo.avatarUrl.startsWith('http')) {
					return administrator.personalInfo.avatarUrl;
				}
				return `${env.backendApiUrl}${administrator.personalInfo.avatarUrl}`;
			})(),
		},
		{
			name: 'status',
			label: 'Estado',
			type: 'select',
			required: true,
			options: [
				{ id: 1, label: 'Activo' },
				{ id: 2, label: 'Inactivo' },
			],
		},
	];

	return (
		<UpdateBaseForm
			fields={fields}
			initialState={getInitialState()}
			onSubmit={handleSubmit}
			isSubmitting={loading}
			submitLabel="Guardar Cambios"
			title=""
			subtitle=""
			errors={[]} // Errors handled via onError prop
			columns={1}
			cancelButton={true}
			cancelButtonText="Cerrar"
			onCancel={onClose}
		/>
	);
};

export default UpdateAdminForm;