import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import RoleManagement from '../RoleManagement';

// Mock the window.confirm used in the component
window.confirm = jest.fn().mockImplementation(() => true);

describe('RoleManagement Component', () => {
  beforeEach(() => {
    // Mock window.confirm
    window.confirm = jest.fn().mockImplementation(() => true);
  });

  it('renders the component with default roles', async () => {
    render(<RoleManagement />);
    
    // Check if default roles are rendered
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Employee')).toBeInTheDocument();
    
    // Check if the add button is present
    expect(screen.getByRole('button', { name: /add new role/i })).toBeInTheDocument();
  });

  it('opens the add role dialog when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<RoleManagement />);
    
    // Click the add button
    await user.click(screen.getByRole('button', { name: /add new role/i }));
    
    // Check if the dialog is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Role')).toBeInTheDocument();
  });

  it('creates a new role when form is submitted', async () => {
    const user = userEvent.setup();
    render(<RoleManagement />);
    
    // Open the add role dialog
    await user.click(screen.getByRole('button', { name: /add new role/i }));
    
    // Fill in the form
    await user.type(screen.getByLabelText(/role name/i), 'Test Role');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    
    // Select a permission
    const permissionCheckbox = screen.getByLabelText(/view users/i);
    await user.click(permissionCheckbox);
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /create role/i }));
    
    // Check if the new role is added to the table
    expect(screen.getByText('Test Role')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('edits an existing role', async () => {
    const user = userEvent.setup();
    render(<RoleManagement />);
    
    // Find and click the edit button for the Manager role
    const managerRow = screen.getByText('Manager').closest('tr');
    const editButton = within(managerRow!).getByRole('button', { name: /edit role/i });
    await user.click(editButton);
    
    // Check if the edit dialog is open with the correct title
    expect(screen.getByText('Edit Role')).toBeInTheDocument();
    
    // Change the role name
    const roleNameInput = screen.getByLabelText(/role name/i);
    await user.clear(roleNameInput);
    await user.type(roleNameInput, 'Senior Manager');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /update role/i }));
    
    // Check if the role was updated
    expect(screen.getByText('Senior Manager')).toBeInTheDocument();
  });

  it('deletes a role when delete is confirmed', async () => {
    const user = userEvent.setup();
    render(<RoleManagement />);
    
    // Find and click the delete button for a non-default role
    // First add a test role to delete
    await user.click(screen.getByRole('button', { name: /add new role/i }));
    await user.type(screen.getByLabelText(/role name/i), 'Test Delete');
    await user.click(screen.getByRole('button', { name: /create role/i }));
    
    // Find and click the delete button for the new role
    const testRow = screen.getByText('Test Delete').closest('tr');
    const deleteButton = within(testRow!).getByRole('button', { name: /delete role/i });
    await user.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmButton);
    
    // Check if the role was deleted
    expect(screen.queryByText('Test Delete')).not.toBeInTheDocument();
  });

  it('prevents deletion of default roles', async () => {
    const user = userEvent.setup();
    render(<RoleManagement />);
    
    // Find the delete button for a default role (Admin)
    const adminRow = screen.getByText('Administrator').closest('tr');
    const deleteButton = within(adminRow!).getByRole('button', { name: /delete role/i });
    
    // Check if the delete button is disabled for default roles
    expect(deleteButton).toBeDisabled();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<RoleManagement />);
    
    // Open the add role dialog
    await user.click(screen.getByRole('button', { name: /add new role/i }));
    
    // Try to submit without filling in required fields
    await user.click(screen.getByRole('button', { name: /create role/i }));
    
    // Check if validation error is shown
    expect(screen.getByText('Role name is required')).toBeInTheDocument();
  });
});
