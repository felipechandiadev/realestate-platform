export type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'VACATION' | 'LEAVE'

export interface PersonalInfo {
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  company?: string | null
  nationality?: string | null
  maritalStatus?: string | null
  avatarUrl?: string | null
}

export interface AgentType {
  id: string
  username: string
  email: string
  status: AgentStatus
  role: 'AGENT'
  permissions: string[]
  personalInfo?: PersonalInfo | null
  lastLogin?: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
