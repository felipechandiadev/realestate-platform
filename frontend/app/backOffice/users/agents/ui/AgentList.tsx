'use client'

import React, { useState, useMemo, ChangeEvent } from 'react'
import { AgentType } from './types'
import AgentCard from './AgentCard'
import { TextField } from '@/shared/components/ui/TextField/TextField'
import IconButton from '@/shared/components/ui/IconButton/IconButton'
import { useAlert } from '@/shared/hooks/useAlert'
import CreateAgentFormDialog from './dialogs/CreateAgentFormDialog'
import UpdateAgentDialog from './dialogs/UpdateAgentDialog'
import DeleteAgentDialog from './dialogs/DeleteAgentDialog'

interface AgentListProps {
  initialAgents: AgentType[]
  isLoading?: boolean
}

const AgentList: React.FC<AgentListProps> = ({
  initialAgents,
  isLoading = false,
}) => {
  const { showAlert } = useAlert()
  const [agents, setAgents] = useState<AgentType[]>(initialAgents)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(isLoading)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null)

  // Filter agents based on search
  const filteredAgents = useMemo(() => {
    if (!searchTerm.trim()) return agents

    const term = searchTerm.toLowerCase()
    return agents.filter(
      (agent) =>
        agent.username.toLowerCase().includes(term) ||
        agent.email.toLowerCase().includes(term) ||
        (agent.personalInfo?.firstName?.toLowerCase().includes(term) ?? false) ||
        (agent.personalInfo?.lastName?.toLowerCase().includes(term) ?? false) ||
        (agent.personalInfo?.phone?.includes(term) ?? false)
    )
  }, [agents, searchTerm])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleEditAgent = (agent: AgentType) => {
    setSelectedAgent(agent)
    setUpdateDialogOpen(true)
  }

  const handleDeleteAgent = (agent: AgentType) => {
    setSelectedAgent(agent)
    setDeleteDialogOpen(true)
  }

  const handleRefreshList = () => {
    // This will be called after successful create/update/delete
    // In a real app, you might refetch the list here
  }

  if (loading && agents.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full">
        {/* Search and Add Button */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <IconButton
              aria-label="Agregar agente"
              variant="primary"
              onClick={() => setCreateDialogOpen(true)}
              icon="add"
              size={'sm'}
            />
          </div>
          <div className="w-full max-w-sm">
            <TextField
              label="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              startIcon="search"
              placeholder="Buscar..."
            />
          </div>
        </div>

        {/* No Results Message */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {agents.length === 0
                ? 'No hay agentes registrados'
                : 'No se encontraron agentes con los criterios de búsqueda'}
            </p>
          </div>
        )}

        {/* Grid of Agent Cards */}
        {filteredAgents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={handleEditAgent}
                onDelete={handleDeleteAgent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {createDialogOpen && (
        <CreateAgentFormDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={handleRefreshList}
        />
      )}

      {updateDialogOpen && selectedAgent && (
        <UpdateAgentDialog
          open={updateDialogOpen}
          agent={selectedAgent}
          onClose={() => {
            setUpdateDialogOpen(false)
            setSelectedAgent(null)
          }}
          onSuccess={handleRefreshList}
        />
      )}

      {deleteDialogOpen && selectedAgent && (
        <DeleteAgentDialog
          open={deleteDialogOpen}
          agent={selectedAgent}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedAgent(null)
          }}
          onSuccess={handleRefreshList}
        />
      )}
    </>
  )
}

export default AgentList
