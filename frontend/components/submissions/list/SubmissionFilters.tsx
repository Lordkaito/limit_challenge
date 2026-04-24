'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

import { Broker, SubmissionPriority, SubmissionStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const PRIORITY_OPTIONS: { label: string; value: SubmissionPriority | '' }[] = [
  { label: 'All priorities', value: '' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

interface Props {
  status?: string;
  priority?: string;
  brokerId?: string;
  companyDraft: string;
  createdFrom?: string;
  createdTo?: string;
  hasDocuments?: string;
  hasNotes?: string;
  dateRangeInvalid: boolean;
  hasActiveFilters: boolean;
  brokers: Broker[];
  brokersLoading: boolean;
  onUpdate: (updates: Record<string, string | undefined>) => void;
  onCompanyDraftChange: (value: string) => void;
  onClear: () => void;
  totalCount?: number;
}

export function SubmissionFilters({
  status,
  priority,
  brokerId,
  companyDraft,
  createdFrom,
  createdTo,
  hasDocuments,
  hasNotes,
  dateRangeInvalid,
  hasActiveFilters,
  brokers,
  brokersLoading,
  onUpdate,
  onCompanyDraftChange,
  onClear,
  totalCount,
}: Props) {
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1.5}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <FilterListIcon fontSize="small" color="action" />
          <Typography variant="subtitle2" color="text.secondary">
            Filters
          </Typography>
          {hasActiveFilters && (
            <Chip
              label="Active"
              size="small"
              color="primary"
              variant="outlined"
              onDelete={onClear}
              deleteIcon={<ClearIcon />}
            />
          )}
        </Stack>
        {totalCount !== undefined && (
          <Typography variant="body2" color="text.secondary">
            {totalCount} {totalCount === 1 ? 'submission' : 'submissions'}
          </Typography>
        )}
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        flexWrap="wrap"
        useFlexGap
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            label="Status"
            value={status ?? ''}
            onChange={(e) =>
              onUpdate({ status: (e.target.value as string) || undefined })
            }
            inputProps={{ 'aria-label': 'Filter by status' }}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value || 'all-status'} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            label="Priority"
            value={priority ?? ''}
            onChange={(e) =>
              onUpdate({ priority: (e.target.value as string) || undefined })
            }
            inputProps={{ 'aria-label': 'Filter by priority' }}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <MenuItem key={o.value || 'all-priority'} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }} disabled={brokersLoading}>
          <InputLabel id="broker-label">Broker</InputLabel>
          <Select
            labelId="broker-label"
            label="Broker"
            value={brokerId ?? ''}
            onChange={(e) =>
              onUpdate({ brokerId: (e.target.value as string) || undefined })
            }
            inputProps={{ 'aria-label': 'Filter by broker' }}
          >
            <MenuItem value="">All brokers</MenuItem>
            {brokers.map((b) => (
              <MenuItem key={b.id} value={String(b.id)}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Company"
          value={companyDraft}
          onChange={(e) => onCompanyDraftChange(e.target.value)}
          placeholder="Name, industry or city"
          inputProps={{ 'aria-label': 'Search companies' }}
          sx={{ minWidth: 200 }}
        />

        <TextField
          size="small"
          type="date"
          label="From"
          value={createdFrom ?? ''}
          onChange={(e) =>
            onUpdate({ createdFrom: e.target.value || undefined })
          }
          InputLabelProps={{ shrink: true }}
          error={dateRangeInvalid}
          inputProps={{ 'aria-label': 'Filter from date' }}
          sx={{ minWidth: 150 }}
        />

        <TextField
          size="small"
          type="date"
          label="To"
          value={createdTo ?? ''}
          onChange={(e) => onUpdate({ createdTo: e.target.value || undefined })}
          InputLabelProps={{ shrink: true }}
          error={dateRangeInvalid}
          inputProps={{ 'aria-label': 'Filter to date' }}
          sx={{ minWidth: 150 }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="docs-label">Documents</InputLabel>
          <Select
            labelId="docs-label"
            label="Documents"
            value={hasDocuments ?? ''}
            onChange={(e) =>
              onUpdate({ hasDocuments: (e.target.value as string) || undefined })
            }
            inputProps={{ 'aria-label': 'Filter by has documents' }}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="true">Has documents</MenuItem>
            <MenuItem value="false">No documents</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="notes-label">Notes</InputLabel>
          <Select
            labelId="notes-label"
            label="Notes"
            value={hasNotes ?? ''}
            onChange={(e) =>
              onUpdate({ hasNotes: (e.target.value as string) || undefined })
            }
            inputProps={{ 'aria-label': 'Filter by has notes' }}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="true">Has notes</MenuItem>
            <MenuItem value="false">No notes</MenuItem>
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={onClear}
            color="inherit"
          >
            Clear all
          </Button>
        )}
      </Stack>

      {dateRangeInvalid && (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          &ldquo;From&rdquo; date must be before or equal to &ldquo;To&rdquo; date.
        </Alert>
      )}
    </Box>
  );
}
