'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import UpdateAdminForm from './UpdateAdminForm';
import type { AdministratorType } from './types';

interface UpdateAdminDialogProps {
	open: boolean;
	onClose: () => void;
	administrator: AdministratorType | null;
	onSave: () => void; // Callback to refresh list
}

const UpdateAdminDialog: React.FC<UpdateAdminDialogProps> = ({
	open,
	onClose,
	administrator,
	onSave,
}) => {
	const [error, setError] = useState<string | null>(null);

	const handleSubmitSuccess = () => {
		setError(null);
		onSave();
		onClose();
	};

	const handleError = (errorMsg: string) => {
		setError(errorMsg);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			title="Editar Administrador"
			maxWidth="md"
		>
			<div>
				{error && (
					<div className="mb-4 text-red-600">
						{error}
					</div>
				)}
				<UpdateAdminForm
					administrator={administrator}
					onSubmitSuccess={handleSubmitSuccess}
					onError={handleError}
					onClose={onClose}
				/>
			</div>
		</Dialog>
	);
};

export default UpdateAdminDialog;