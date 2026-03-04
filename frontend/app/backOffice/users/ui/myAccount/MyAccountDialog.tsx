'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import UpdateBaseForm from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import Alert from '@/shared/components/ui/Alert/Alert';
import { Button } from '@/shared/components/ui/Button/Button';
import { BaseUpdateFormField, BaseUpdateFormFieldGroup } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import { updateUserProfile, changePassword, uploadMultimedia, updateUserAvatar, getCurrentUserProfile } from '@/features/backoffice/users/actions/users.action';

interface MyAccountDialogProps {
    open: boolean;
    onClose: () => void;
}

interface MyAccountData {
    // Usuario
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;

    // Persona
    dni: string;
    address: string;
    personPhone: string;
    personEmail: string;

    // Seguridad
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;

    // Archivos
    avatar: File | null;
    dniCardFront: File | null;
    dniCardRear: File | null;
}

const MyAccountDialog: React.FC<MyAccountDialogProps> = ({ open, onClose }) => {
    const { data: session, update: updateSession } = useSession();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [initialData, setInitialData] = useState<Partial<MyAccountData>>({});
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>();
    const [currentDniFrontUrl, setCurrentDniFrontUrl] = useState<string | undefined>();
    const [currentDniRearUrl, setCurrentDniRearUrl] = useState<string | undefined>();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const loadUserData = useCallback(async () => {
        try {
            setLoading(true);
            setAlert(null);
            
            // Llamar a la server action para obtener datos completos
            const profileResult = await getCurrentUserProfile();
            
            if (!profileResult.success || !profileResult.data) {
                throw new Error(profileResult.error || 'Error al obtener el perfil del usuario');
            }
            
            const profileData = profileResult.data;

            console.log('Datos del perfil obtenidos:', profileData);
            
            // Mapear los datos del backend a los campos del formulario
            setInitialData({
                username: profileData.username || '',
                email: profileData.email || '',
                firstName: profileData.personalInfo?.firstName || '',
                lastName: profileData.personalInfo?.lastName || '',
                phone: profileData.personalInfo?.phone || '',
                dni: profileData.person?.dni || '',
                address: profileData.person?.address || '',
                // Nota: personPhone y personEmail no se usan actualmente en el componente
                avatar: null, // Se maneja por separado para mostrar la imagen actual
                dniCardFront: null, // Se maneja por separado para mostrar la imagen actual
                dniCardRear: null, // Se maneja por separado para mostrar la imagen actual
            });
            
            // Establecer las URLs actuales para mostrar las imágenes
            setCurrentAvatarUrl(profileData.personalInfo?.avatarUrl);
            setCurrentDniFrontUrl(profileData.person?.dniCardFrontUrl);
            setCurrentDniRearUrl(profileData.person?.dniCardRearUrl);
            
        } catch (error: unknown) {
            console.error('Error loading user data:', error);
            setAlert({ 
                type: 'error', 
                message: error instanceof Error ? error.message : 'Error al cargar los datos del usuario' 
            });
        } finally {
            setLoading(false);
        }
    }, []); // Remover dependencias ya que ahora usa server action

    // Cargar datos iniciales cuando se abre el dialog
    useEffect(() => {
        if (open && session?.user) {
            loadUserData();
        }
    }, [open, session, loadUserData]);

    // Campos para información del usuario
    const userFields: BaseUpdateFormField[] = [
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
            name: 'avatar',
            label: 'Foto de perfil',
            type: 'avatar',
            maxSize: 2,
            buttonText: 'Cambiar foto de perfil',
            currentUrl: currentAvatarUrl,
        },
    ];

    // Campos para información personal
    const personalFields: BaseUpdateFormField[] = [
        {
            name: 'firstName',
            label: 'Nombre',
            type: 'text',
            required: true,
        },
        {
            name: 'lastName',
            label: 'Apellido',
            type: 'text',
            required: true,
        },
        {
            name: 'address',
            label: 'Dirección',
            type: 'textarea',
        },
        {
            name: 'phone',
            label: 'Teléfono',
            type: 'text',
        },
    ];

    // Campos para validación de identidad
    const identityFieldGroups: BaseUpdateFormFieldGroup[] = [
        {
            id: 'identity-dni',
            columns: 1,
            fields: [
                {
                    name: 'dni',
                    label: 'DNI',
                    type: 'dni',
                    required: true,
                },
            ],
        },
        {
            id: 'identity-documents',
            columns: 2,
            gap: 12,
            fields: [
                {
                    name: 'dniCardFront',
                    label: 'Frente del DNI',
                    type: 'image',
                    maxSize: 2,
                    buttonText: 'Subir frente del DNI',
                    labelText: 'Frente del DNI',
                    currentUrl: currentDniFrontUrl,
                },
                {
                    name: 'dniCardRear',
                    label: 'Reverso del DNI',
                    type: 'image',
                    maxSize: 2,
                    buttonText: 'Subir reverso del DNI',
                    labelText: 'Reverso del DNI',
                    currentUrl: currentDniRearUrl,
                },
            ],
        },
    ];

    const handleUserSubmit = async (values: Record<string, unknown>) => {
        try {
            setLoading(true);
            setAlert(null);

            const userId = (session?.user as {
                id?: string;
                username?: string;
                email?: string;
            })?.id;
            if (!userId) {
                throw new Error('Usuario no identificado');
            }

            const userData = {
                username: String(values.username || ''),
                email: String(values.email || ''),
            };

            await updateUserProfile(userId, userData);

            // Subir avatar si cambió
            if (values.avatar) {
                const avatarFormData = new FormData();
                avatarFormData.append('file', values.avatar as File);
                await updateUserAvatar(userId, avatarFormData);
            }

            // Actualizar la sesión si cambió el email
            await updateSession({
                ...session,
                user: {
                    ...session?.user,
                    email: userData.email,
                }
            });

            setAlert({ type: 'success', message: 'Información del usuario actualizada correctamente' });
        } catch (error: unknown) {
            console.error('Error updating user profile:', error);
            setAlert({
                type: 'error',
                message: error instanceof Error ? error.message : 'Error al actualizar la información del usuario'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePersonalSubmit = async (values: Record<string, unknown>) => {
        try {
            setLoading(true);
            setAlert(null);

            const userId = (session?.user as { id?: string })?.id;
            if (!userId) {
                throw new Error('Usuario no identificado');
            }

            const userData = {
                personalInfo: {
                    firstName: String(values.firstName || ''),
                    lastName: String(values.lastName || ''),
                    phone: String(values.phone || ''),
                }
            };

            await updateUserProfile(userId, userData);

            // Actualizar la sesión con el nombre completo
            await updateSession({
                ...session,
                user: {
                    ...session?.user,
                    name: `${userData.personalInfo.firstName} ${userData.personalInfo.lastName}`,
                }
            });

            setAlert({ type: 'success', message: 'Información personal actualizada correctamente' });
        } catch (error: unknown) {
            console.error('Error updating personal info:', error);
            setAlert({
                type: 'error',
                message: error instanceof Error ? error.message : 'Error al actualizar la información personal'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleIdentitySubmit = async (values: Record<string, unknown>) => {
        try {
            setLoading(true);
            setAlert(null);

            const userId = (session?.user as { id?: string })?.id;
            if (!userId) {
                throw new Error('Usuario no identificado');
            }

            // Aquí iría la lógica para actualizar validación de identidad
            // Por ahora solo mostramos un mensaje
            console.log('Identity data to update:', values);

            // Subir documentos DNI si cambiaron
            if (values.dniCardFront) {
                const frontResult = await uploadMultimedia(values.dniCardFront as File);
                console.log('DNI Front uploaded:', frontResult);
            }
            if (values.dniCardRear) {
                const rearResult = await uploadMultimedia(values.dniCardRear as File);
                console.log('DNI Rear uploaded:', rearResult);
            }

            setAlert({ type: 'success', message: 'Validación de identidad actualizada correctamente' });
        } catch (error: unknown) {
            console.error('Error updating identity validation:', error);
            setAlert({
                type: 'error',
                message: error instanceof Error ? error.message : 'Error al actualizar la validación de identidad'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        try {
            setPasswordLoading(true);
            setAlert(null);

            const userId = (session?.user as { id?: string })?.id;
            if (!userId) {
                throw new Error('Usuario no identificado');
            }

            if (!passwordData.currentPassword || !passwordData.newPassword) {
                throw new Error('Todos los campos de contraseña son requeridos');
            }

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            await changePassword(userId, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            // Limpiar campos de contraseña
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            setAlert({ type: 'success', message: 'Contraseña cambiada correctamente' });
        } catch (error: unknown) {
            console.error('Error changing password:', error);
            setAlert({
                type: 'error',
                message: error instanceof Error ? error.message : 'Error al cambiar la contraseña'
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleClose = () => {
        setAlert(null);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            title="Mi Cuenta"
            size="custom"
            maxWidth="1100px"
            fullWidth
        >
            <div className="space-y-6">
                {alert && (
                    <Alert
                        variant={alert.type}
                        className="mb-4"
                    >
                        {alert.message}
                    </Alert>
                )}

                {loading && !initialData.username ? (
                    <div className="flex justify-center py-8">
                        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna 1: Información del Usuario */}
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">Información de Usuario</h3>
                            </div>
                            <UpdateBaseForm
                                title=''
                                fields={userFields}
                                initialState={initialData}
                                onSubmit={handleUserSubmit}
                                submitLabel="Actualizar Usuario"
                                submitVariant="outlined"
                                isSubmitting={loading}
                                cancelButton={false}
                            />
                        </div>

                        {/* Columna 2: Información Personal */}
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                            </div>
                            <UpdateBaseForm
                                title=''
                                fields={personalFields}
                                initialState={initialData}
                                onSubmit={handlePersonalSubmit}
                                submitLabel="Actualizar Información"
                                submitVariant="outlined"
                                isSubmitting={loading}
                                cancelButton={false}
                            />
                        </div>

                        {/* Columna 3: Validación de Identidad */}
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">Validación de Identidad</h3>
                            </div>
                            <UpdateBaseForm
                                title=''
                                fields={identityFieldGroups}
                                initialState={initialData}
                                onSubmit={handleIdentitySubmit}
                                submitLabel="Validar"
                                submitVariant="outlined"
                                isSubmitting={loading}
                                cancelButton={false}
                            />
                        </div>

                        {/* Cambio de Contraseña - Ancho completo */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contraseña actual
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ingresa tu contraseña actual"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nueva contraseña
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ingresa la nueva contraseña"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirmar contraseña
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Confirma la nueva contraseña"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="primary"
                                        onClick={handlePasswordChange}
                                        disabled={passwordLoading}
                                        className="px-6 py-2"
                                    >
                                        {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de acción principales */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        disabled={loading || passwordLoading}
                    >
                        Cerrar
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default MyAccountDialog;