'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import DeleteAdminForm from './DeleteAdminForm';
import type { AdministratorType } from './types';

interface DeleteAdminDialogProps {
	open: boolean;
	onClose: () => void;
	administrator: AdministratorType | null;
	onSave: () => void; // Callback to refresh list
}

const DeleteAdminDialog: React.FC<DeleteAdminDialogProps> = ({
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
			title="Eliminar Administrador"
			maxWidth="sm"
		>
			<div >
				{error && (
					<div className="mb-4 text-red-600">
						{error}
					</div>
				)}
				<DeleteAdminForm
					administrator={administrator}
					onSubmitSuccess={handleSubmitSuccess}
					onError={handleError}
					onClose={onClose}
				/>
			</div>
		</Dialog>
	);
};

export default DeleteAdminDialog;