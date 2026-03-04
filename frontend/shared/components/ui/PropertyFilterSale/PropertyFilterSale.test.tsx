import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import PropertyFilterSale from './PropertyFilterSale'

jest.mock('@/features/backoffice/cms/actions/identity.action', () => ({
  getIdentity: jest.fn().mockResolvedValue({ name: 'Bravo Schott Propiedades' }),
}))

describe('PropertyFilterSale', () => {
  it('renders company name from identity when available', async () => {
    render(<PropertyFilterSale />)

    await waitFor(() => expect(screen.getByText(/BRAVO SCHOTT PROPIEDADES/i)).toBeInTheDocument())
  })
})
