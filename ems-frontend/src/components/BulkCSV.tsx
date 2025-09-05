import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CloudUpload,
  CloudDownload,
  Description,
  CheckCircle,
  Error,
  Warning,
  Info,
  Delete,
  Visibility,
  GetApp,
} from '@mui/icons-material';

interface ImportRecord {
  id: string;
  fileName: string;
  type: 'employees' | 'attendance' | 'payroll';
  status: 'success' | 'error' | 'warning' | 'processing';
  recordsProcessed: number;
  totalRecords: number;
  timestamp: string;
  errors?: string[];
}

const BulkCSV: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([
    {
      id: '1',
      fileName: 'employees_2024.csv',
      type: 'employees',
      status: 'success',
      recordsProcessed: 247,
      totalRecords: 247,
      timestamp: '2024-01-20 14:30:00',
    },
    {
      id: '2',
      fileName: 'attendance_jan.csv',
      type: 'attendance',
      status: 'warning',
      recordsProcessed: 1890,
      totalRecords: 1920,
      timestamp: '2024-01-19 09:15:00',
      errors: ['30 records had invalid date format', 'Missing employee IDs in 5 records']
    },
    {
      id: '3',
      fileName: 'payroll_q4.csv',
      type: 'payroll',
      status: 'error',
      recordsProcessed: 0,
      totalRecords: 150,
      timestamp: '2024-01-18 16:45:00',
      errors: ['Invalid file format', 'Missing required columns: salary, department']
    },
  ]);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ImportRecord | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setImporting(true);
    // Simulate import process
    setTimeout(() => {
      const newRecord: ImportRecord = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        type: 'employees',
        status: 'success',
        recordsProcessed: Math.floor(Math.random() * 100) + 50,
        totalRecords: Math.floor(Math.random() * 100) + 50,
        timestamp: new Date().toLocaleString(),
      };
      setImportHistory([newRecord, ...importHistory]);
      setSelectedFile(null);
      setImporting(false);
    }, 3000);
  };

  const handleExport = (type: string) => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'error': return <Error sx={{ color: '#ef4444' }} />;
      case 'warning': return <Warning sx={{ color: '#f59e0b' }} />;
      default: return <Info sx={{ color: '#3b82f6' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: 'white',
            borderRadius: 4,
          }}
        >
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            Bulk Import/Export
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Import and export employee data, attendance records, and payroll information
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Import Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CloudUpload sx={{ mr: 2, color: '#059669' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Import Data
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{
                      py: 2,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: '#d1d5db',
                      '&:hover': {
                        borderColor: '#059669',
                        bgcolor: 'rgba(5, 150, 105, 0.05)'
                      }
                    }}
                  >
                    <CloudUpload sx={{ mr: 1 }} />
                    Choose CSV File
                  </Button>
                </label>
              </Box>

              {selectedFile && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                disabled={!selectedFile || importing}
                onClick={handleImport}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                  }
                }}
              >
                {importing ? 'Importing...' : 'Import Data'}
              </Button>

              {importing && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress sx={{ mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Processing your file...
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Export Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CloudDownload sx={{ mr: 2, color: '#3b82f6' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Export Data
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleExport('employees')}
                    sx={{ py: 1.5, mb: 1 }}
                  >
                    <GetApp sx={{ mr: 1 }} />
                    Export Employees
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleExport('attendance')}
                    sx={{ py: 1.5, mb: 1 }}
                  >
                    <GetApp sx={{ mr: 1 }} />
                    Export Attendance
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleExport('payroll')}
                    sx={{ py: 1.5 }}
                  >
                    <GetApp sx={{ mr: 1 }} />
                    Export Payroll
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Import History */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Import History
          </Typography>
          
          <List>
            {importHistory.map((record, index) => (
              <React.Fragment key={record.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    {getStatusIcon(record.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {record.fileName}
                        </Typography>
                        <Chip
                          label={record.type}
                          size="small"
                          sx={{
                            background: `${getStatusColor(record.status)}20`,
                            color: getStatusColor(record.status),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {record.recordsProcessed}/{record.totalRecords} records processed
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedRecord(record);
                        setPreviewDialog(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < importHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Preview Dialog */}
        <Dialog
          open={previewDialog}
          onClose={() => setPreviewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Import Details: {selectedRecord?.fileName}
          </DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(selectedRecord.status)}
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {selectedRecord.status}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Records Processed
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.recordsProcessed}/{selectedRecord.totalRecords}
                    </Typography>
                  </Grid>
                </Grid>
                
                {selectedRecord.errors && selectedRecord.errors.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Errors/Warnings:
                    </Typography>
                    {selectedRecord.errors.map((error, index) => (
                      <Alert key={index} severity="error" sx={{ mb: 1 }}>
                        {error}
                      </Alert>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BulkCSV;