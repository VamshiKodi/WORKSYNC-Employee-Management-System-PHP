import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RoleManagement from '../RoleManagement';


// Mock the window.confirm used in the component
window.confirm = jest.fn().mockImplementation(() => true);

describe('RoleManagement Accessibility', () => {
  it('should have no accessibility violations on initial render', async () => {
    const { container } = render(<RoleManagement />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels and roles', () => {
    render(<RoleManagement />);
    
    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for table structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Check for column headers
    expect(screen.getByRole('columnheader', { name: /role name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /permissions/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
    
    // Check for add button
    expect(screen.getByRole('button', { name: /add new role/i })).toBeInTheDocument();
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<RoleManagement />);
    
    // Test tab navigation to add button
    const addButton = screen.getByRole('button', { name: /add new role/i });
    expect(addButton).toBeInTheDocument();
    
    // Test opening dialog with keyboard
    await user.click(addButton);
    
    // Check if dialog opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Test escape key closes dialog
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should have proper contrast ratios', async () => {
    const { container } = render(<RoleManagement />);
    
    // Check text contrast using axe with specific rules
    const results = await axe(container);
    
    // Check if there are any contrast-related violations
    const contrastViolations = results.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    expect(contrastViolations).toHaveLength(0);
  });
});
