'use client';
import { useState, useEffect } from "react";
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import type { AdministratorType } from './types';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { useRouter, useSearchParams } from "next/navigation";
import AdminCard from "./AdminCard";
import UpdateAdminDialog from "./UpdateAdminDialog";
import DeleteAdminDialog from "./DeleteAdminDialog";
import CreateAdminFormDialog from "./CreateAdminFormDialog";

export interface AdminListProps {
    administrators: AdministratorType[];
}

const defaultEmptyMessage = 'No hay administradores para mostrar.';



const getDisplayName = (admin: AdministratorType): string => {

    const firstName = admin.personalInfo?.firstName?.trim() ?? '';
    const lastName = admin.personalInfo?.lastName?.trim() ?? '';
    const combined = `${firstName} ${lastName}`.trim();

    if (combined) {
        return combined;
    }

    if (admin.username) {
        return admin.username;
    }

    return admin.email;
};

const AdminList: React.FC<AdminListProps> = ({
    administrators,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdministratorType | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);

    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setSearch(value);
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        if (value) {
            params.set("search", value);
        } else {
            params.delete("search");
        }
        router.replace(`?${params.toString()}`);
    };

    const handleEditAdmin = (admin: AdministratorType) => {
        setSelectedAdmin(admin);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedAdmin(null);
    };

    const handleDeleteAdmin = (admin: AdministratorType) => {
        setSelectedAdmin(admin);
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setSelectedAdmin(null);
    };

    const handleRefreshList = () => {
        // Refresh the page to reload the administrators list
        router.refresh();
    };


    return (
        <>



            <div className="w-full">
                {/* Primera fila: botón agregar y búsqueda */}
                <div className="flex items-center justify-between mb-4 gap-2">
                    <div>
                        <IconButton
                            aria-label="Agregar administrador"
                            variant="containedPrimary"
                            onClick={() => setOpenCreateDialog(true)}
                            icon="add"
                            size={'sm'}
                        />
                    </div>
                    <div className="w-full max-w-sm">
                        <TextField
                            label="Buscar"
                            value={search}
                            onChange={handleSearchChange}
                            startIcon="search"
                            placeholder="Buscar..."
                        />
                    </div>
                </div>
                {/* Segunda fila: grid de tarjetas con ancho estable */}
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
                >
                    {administrators.map(admin => (
                        <AdminCard key={admin.id} admin={admin} onEdit={handleEditAdmin} onDelete={handleDeleteAdmin} />
                    ))}
                </div>
            </div>



            <UpdateAdminDialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                administrator={selectedAdmin}
                onSave={handleRefreshList}
            />

            <DeleteAdminDialog
                open={deleteDialogOpen}
                onClose={handleDeleteDialogClose}
                administrator={selectedAdmin}
                onSave={handleRefreshList}
            />

            <CreateAdminFormDialog
                open={openCreateDialog}
                onClose={() => setOpenCreateDialog(false)}
                onSuccess={handleRefreshList}
            />
        </>
    );
};

export default AdminList;
