import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  Divider,
  Grid,
  useTheme,
  alpha,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface Permission {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

const defaultPermissions: Permission[] = [
  { id: 'user:read', name: 'View Users', description: 'View user profiles and details', checked: false },
  { id: 'user:write', name: 'Manage Users', description: 'Create, edit, and delete users', checked: false },
  { id: 'role:read', name: 'View Roles', description: 'View role definitions', checked: false },
  { id: 'role:write', name: 'Manage Roles', description: 'Create, edit, and delete roles', checked: false },
  { id: 'attendance:read', name: 'View Attendance', description: 'View attendance records', checked: false },
  { id: 'attendance:write', name: 'Manage Attendance', description: 'Create and update attendance records', checked: false },
  { id: 'reports:view', name: 'View Reports', description: 'Access to reports and analytics', checked: false },
  { id: 'settings:manage', name: 'Manage Settings', description: 'Modify system settings', checked: false },
];

const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'attendance:read', 'attendance:write', 'reports:view', 'settings:manage'],
    isDefault: true,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Team management access',
    permissions: ['user:read', 'attendance:read', 'attendance:write', 'reports:view'],
    isDefault: true,
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee access',
    permissions: ['attendance:read'],
    isDefault: true,
  },
];

const RoleManagement: React.FC = () => {
  const theme = useTheme();
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [permissions, setPermissions] = useState<Permission[]>([...defaultPermissions]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement>(null);
  const firstFocusableElementRef = useRef<HTMLElement | null>(null);
  const lastFocusableElementRef = useRef<HTMLElement | null>(null);

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRoles = filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    // In a real app, fetch roles and permissions from API
    // fetchRoles();
    // fetchPermissions();
  }, []);

  const handleOpenDialog = (role: Role | null = null) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setRoleDescription(role.description);
      // Update permissions checkboxes based on role
      const updatedPermissions = permissions.map(perm => ({
        ...perm,
        checked: role.permissions.includes(perm.id),
      }));
      setPermissions(updatedPermissions);
    } else {
      setEditingRole(null);
      setRoleName('');
      setRoleDescription('');
      // Reset permissions checkboxes
      setPermissions(permissions.map(perm => ({ ...perm, checked: false })));
    }
    setOpenDialog(true);
  };

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: KeyboardEvent, role?: Role) => {
    if (e.key === 'Escape') {
      if (openDialog) {
        handleCloseDialog();
      }
    } else if (e.key === 'Enter' && role) {
      handleOpenDialog(role);
    } else if (e.key === ' ' && role) {
      e.preventDefault();
      handleOpenDialog(role);
    } else if (e.key === 'Tab' && openDialog) {
      // Trap focus within dialog
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElementRef.current) {
          e.preventDefault();
          lastFocusableElementRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastFocusableElementRef.current) {
          e.preventDefault();
          firstFocusableElementRef.current?.focus();
        }
      }
    }
  };

  // Set focus when dialog opens
  useEffect(() => {
    if (openDialog) {
      // Store the element that had focus before opening the dialog
      setFocusedElement(document.activeElement as HTMLElement);
      
      // Set focus to the dialog title when it opens
      setTimeout(() => {
        dialogTitleRef.current?.focus();
        
        // Find all focusable elements in the dialog
        const focusableElements = dialogTitleRef.current?.closest('[role="dialog"]')?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements?.length) {
          firstFocusableElementRef.current = focusableElements[0] as HTMLElement;
          lastFocusableElementRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;
        }
      }, 100);
    } else if (focusedElement) {
      // Return focus to the element that had focus before the dialog opened
      focusedElement.focus();
      setFocusedElement(null);
    }
  }, [openDialog]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePermissionChange = (permissionId: string) => {
    setPermissions(
      permissions.map(perm =>
        perm.id === permissionId ? { ...perm, checked: !perm.checked } : perm
      )
    );
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) {
      setSnackbar({ open: true, message: 'Role name is required', severity: 'error' });
      return;
    }

    const selectedPermissions = permissions
      .filter(perm => perm.checked)
      .map(perm => perm.id);

    if (editingRole) {
      // Update existing role
      setRoles(
        roles.map(role =>
          role.id === editingRole.id
            ? {
                ...role,
                name: roleName,
                description: roleDescription,
                permissions: selectedPermissions,
              }
            : role
        )
      );
      setSnackbar({ open: true, message: 'Role updated successfully', severity: 'success' });
    } else {
      // Create new role
      const newRole: Role = {
        id: roleName.toLowerCase().replace(/\s+/g, '-'),
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
        isDefault: false,
      };
      setRoles([...roles, newRole]);
      setSnackbar({ open: true, message: 'Role created successfully', severity: 'success' });
    }
    handleCloseDialog();
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(role => role.id !== roleId));
    setSnackbar({ open: true, message: 'Role deleted successfully', severity: 'success' });
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const handleDeleteClick = (roleId: string) => {
    setRoleToDelete(roleId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      handleDeleteRole(roleToDelete);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const getPermissionCount = (role: Role) => {
    return role.permissions.length;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card 
        elevation={0}
        sx={{
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
          mb: 3,
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                Role Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                aria-label="Add new role"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  },
                }}
              >
                Add Role
              </Button>
            </Box>
          }
          sx={{ pb: 0 }}
        />
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              },
            }}
            sx={{ mb: 3, maxWidth: 400 }}
          />

          <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'background.default' }}>
            <Typography variant="body2" color="textSecondary">
              Manage user roles and their permissions. Default roles cannot be deleted but can be modified.
            </Typography>
          </Paper>

          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 600, color: theme.palette.text.secondary } }}>
                  <TableCell>ROLE NAME</TableCell>
                  <TableCell>DESCRIPTION</TableCell>
                  <TableCell>PERMISSIONS</TableCell>
                  <TableCell align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRoles.length > 0 ? (
                  paginatedRoles.map((role) => (
                    <TableRow
                      key={role.id}
                      hover
                      onClick={() => handleOpenDialog(role)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, role)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {role.name}
                          </Typography>
                          {role.isDefault && (
                            <Chip
                              label="Default"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ 
                                ml: 1,
                                fontSize: '0.65rem',
                                height: 20,
                                '& .MuiChip-label': { px: 1 },
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {role.permissions.slice(0, 3).map((permId) => {
                            const perm = permissions.find((p) => p.id === permId);
                            return perm ? (
                              <Chip
                                key={perm.id}
                                label={perm.name}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 22,
                                  '& .MuiChip-label': { px: 1 },
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.dark,
                                }}
                              />
                            ) : null;
                          })}
                          {role.permissions.length > 3 && (
                            <Chip
                              label={`+${role.permissions.length - 3} more`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.65rem',
                                height: 22,
                                '& .MuiChip-label': { px: 1 },
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(role);
                            }}
                            size="small"
                            aria-label={`Edit ${role.name}`}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!role.isDefault && (
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(role.id);
                              }}
                              size="small"
                              sx={{
                                color: theme.palette.error.main,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                              aria-label={`Delete ${role.name}`}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          No roles found matching your search
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRoles.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                '& .MuiTablePagination-toolbar': {
                  minHeight: 56,
                },
              }}
            />
          </TableContainer>

          {/* Add/Edit Role Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="role-dialog-title"
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <DialogTitle 
              id="role-dialog-title" 
              ref={dialogTitleRef} 
              tabIndex={-1}
              sx={{
                bgcolor: 'primary.main',
                color: 'common.white',
                py: 2,
                px: 3,
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                '& .MuiTypography-root': {
                  fontWeight: 600,
                },
              }}
            >
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    autoFocus
                    margin="normal"
                    label="Role Name"
                    fullWidth
                    variant="outlined"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                  <TextField
                    margin="normal"
                    label="Description"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                  {editingRole?.isDefault && (
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                      This is a default role. Some permissions cannot be modified.
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Permissions
                  </Typography>
                  <Box 
                    sx={{ 
                      maxHeight: 350, 
                      overflowY: 'auto',
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    }}
                  >
                    <FormGroup>
                      {permissions.map((permission) => (
                        <Card 
                          key={permission.id}
                          variant="outlined"
                          sx={{
                            mb: 1,
                            borderRadius: 2,
                            borderColor: permission.checked ? 'primary.main' : 'divider',
                            bgcolor: permission.checked ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
                            },
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={permission.checked}
                                onChange={() => handlePermissionChange(permission.id)}
                                color="primary"
                                disabled={editingRole?.isDefault}
                              />
                            }
                            label={
                              <Box sx={{ py: 1, pr: 1 }}>
                                <Typography variant="body2" fontWeight={500} color="text.primary">
                                  {permission.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {permission.description}
                                </Typography>
                              </Box>
                            }
                            sx={{
                              m: 0,
                              width: '100%',
                              '& .MuiFormControlLabel-label': {
                                flex: 1,
                              },
                            }}
                          />
                        </Card>
                      ))}
                    </FormGroup>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    borderColor: theme.palette.text.secondary,
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRole}
                variant="contained"
                startIcon={editingRole ? <SaveIcon /> : <AddIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  },
                }}
              >
                {editingRole ? 'Save Changes' : 'Add Role'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title">Delete Role</DialogTitle>
            <DialogContent>
              <Typography id="delete-dialog-description">
                Are you sure you want to delete this role? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} color="primary" autoFocus>
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{ '& .MuiPaper-root': { borderRadius: 3 } }}
          >
            <Alert
              elevation={6}
              variant="filled"
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity as any}
              sx={{
                width: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                '& .MuiAlert-icon': {
                  fontSize: 28,
                  mr: 2,
                },
                '& .MuiAlert-message': {
                  fontSize: '0.95rem',
                  fontWeight: 500,
                },
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  );
};

// Export as default for compatibility with existing imports
export default RoleManagement;