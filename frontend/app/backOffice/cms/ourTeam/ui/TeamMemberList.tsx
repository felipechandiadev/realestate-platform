'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import TeamMemberCard from './TeamMemberCard';
import CreateTeamMemberDialog from './CreateTeamMemberDialog';
import UpdateTeamMemberDialog from './UpdateTeamMemberDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import type { TeamMember } from '@/features/backoffice/cms/actions/ourTeam.action';

interface TeamMemberListProps {
  initialMembers: TeamMember[];
  initialSearch: string;
}

export default function TeamMemberList({
  initialMembers,
  initialSearch,
}: TeamMemberListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [search, setSearch] = useState(initialSearch);
  const [isSearching, setIsSearching] = useState(false);

  // Diálogos
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Manejo de búsqueda con modificación de URL
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearch(value);
    setIsSearching(true);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.replace(`?${params.toString()}`);
  };

  // El cambio de URL dispara re-render de page.tsx que llamará getTeamMembers nuevamente
  useEffect(() => {
    if (initialMembers) {
      setMembers(initialMembers);
      setIsSearching(false);
    }
  }, [initialMembers]);

  // Handlers de diálogos
  const handleCreateSuccess = (newMember: TeamMember) => {
    setMembers((prev) => [...prev, newMember]);
    setShowCreateDialog(false);
  };

  const handleUpdateSuccess = (updatedMember: TeamMember) => {
    setMembers((prev) => prev.map((member) => member.id === updatedMember.id ? updatedMember : member));
    setShowUpdateDialog(false);
    setSelectedMember(null);
  };

  const handleDeleteSuccess = () => {
    if (!selectedMember) {
      console.error('selectedMember is null in handleDeleteSuccess');
      return;
    }
    
    const deletedMemberId = selectedMember.id;
    setMembers((prev) => prev.filter((member) => member.id !== deletedMemberId));
    setShowConfirmDelete(false);
    setSelectedMember(null);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Nuestro Equipo</h1>
          <p className="text-muted-foreground">Gestiona los perfiles visibles en la sección pública</p>
        </div>
        <IconButton
          icon="add"
          variant="text"
          size="lg"
          onClick={() => setShowCreateDialog(true)}
          ariaLabel="Crear miembro del equipo"
        />
      </div>

      <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
        <TextField
          label="Buscar miembros"
          placeholder="Buscar por nombre, posición o email..."
          value={search}
          onChange={handleSearch}
          className="w-full"
          startIcon="search"
        />
      </div>

      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="aspect-square bg-neutral animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-neutral animate-pulse rounded" />
                <div className="h-4 bg-neutral animate-pulse rounded w-2/3" />
                <div className="h-4 bg-neutral animate-pulse rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <span className="material-symbols-outlined text-6xl mb-4 block">groups</span>
          <p className="text-lg font-medium mb-2 text-foreground">
            {search
              ? `No se encontraron miembros con "${search}"`
              : 'No hay miembros del equipo para mostrar.'}
          </p>
          {search && (
            <p className="text-sm">
              Prueba con otros términos de búsqueda o crea un nuevo perfil.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={() => {
                setSelectedMember(member);
                setShowUpdateDialog(true);
              }}
              onDelete={() => {
                setSelectedMember(member);
                setShowConfirmDelete(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Diálogos */}
      {showCreateDialog && (
        <CreateTeamMemberDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showUpdateDialog && selectedMember && (
        <UpdateTeamMemberDialog
          open={showUpdateDialog}
          member={selectedMember}
          onClose={() => {
            setShowUpdateDialog(false);
            setSelectedMember(null);
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {showConfirmDelete && selectedMember && (
        <ConfirmDeleteDialog
          open={showConfirmDelete}
          member={selectedMember}
          onConfirm={handleDeleteSuccess}
          onCancel={() => {
            setShowConfirmDelete(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
}
