'use client';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useRouter, useSearchParams } from 'next/navigation';

import { SubmissionListItem } from '@/lib/types';
import { StatusChip } from '@/components/common/StatusChip';
import { PriorityChip } from '@/components/common/PriorityChip';
import { formatRelativeDate, formatDateTime } from '@/lib/utils/formatters';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

interface Props {
  submissions: SubmissionListItem[];
  isLoading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onClear: () => void;
  onRetry: () => void;
}

export function SubmissionTable({
  submissions,
  isLoading,
  isError,
  hasActiveFilters,
  onClear,
  onRetry,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleRowClick(id: number) {
    const qs = searchParams.toString();
    router.push(`/submissions/${id}${qs ? `?${qs}` : ''}`);
  }

  function handleRowKeyDown(e: React.KeyboardEvent, id: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(id);
    }
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label="submissions table">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 600, whiteSpace: 'nowrap' } }}>
            <TableCell>Company</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Broker</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell align="center">
              <Tooltip title="Documents">
                <DescriptionIcon fontSize="inherit" />
              </Tooltip>
            </TableCell>
            <TableCell align="center">
              <Tooltip title="Notes">
                <ChatBubbleOutlineIcon fontSize="inherit" />
              </Tooltip>
            </TableCell>
            <TableCell>Latest Note</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && <LoadingState rows={6} />}

          {isError && (
            <TableRow>
              <TableCell colSpan={9} sx={{ border: 0 }}>
                <ErrorState onRetry={onRetry} />
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && submissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} sx={{ border: 0 }}>
                <EmptyState hasActiveFilters={hasActiveFilters} onClear={onClear} />
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !isError &&
            submissions.map((sub) => (
              <TableRow
                key={sub.id}
                hover
                onClick={() => handleRowClick(sub.id)}
                onKeyDown={(e) => handleRowKeyDown(e, sub.id)}
                tabIndex={0}
                role="button"
                aria-label={`View submission for ${sub.company.legalName}`}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500} noWrap>
                    {sub.company.legalName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {sub.company.industry}
                    {sub.company.headquartersCity
                      ? ` · ${sub.company.headquartersCity}`
                      : ''}
                  </Typography>
                </TableCell>

                <TableCell>
                  <StatusChip status={sub.status} />
                </TableCell>

                <TableCell>
                  <PriorityChip priority={sub.priority} />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" noWrap>
                    {sub.broker.name}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" noWrap>
                    {sub.owner.fullName}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={0.5}
                  >
                    <DescriptionIcon
                      fontSize="inherit"
                      color={sub.documentCount > 0 ? 'action' : 'disabled'}
                    />
                    <Typography variant="caption">{sub.documentCount}</Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={0.5}
                  >
                    <ChatBubbleOutlineIcon
                      fontSize="inherit"
                      color={sub.noteCount > 0 ? 'action' : 'disabled'}
                    />
                    <Typography variant="caption">{sub.noteCount}</Typography>
                  </Box>
                </TableCell>

                <TableCell sx={{ maxWidth: 200 }}>
                  {sub.latestNote ? (
                    <Tooltip title={sub.latestNote.bodyPreview} placement="top">
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                        >
                          {sub.latestNote.authorName}
                        </Typography>
                        <Typography variant="body2" noWrap>
                          {sub.latestNote.bodyPreview.length > 60
                            ? `${sub.latestNote.bodyPreview.slice(0, 60)}…`
                            : sub.latestNote.bodyPreview}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Tooltip title={formatDateTime(sub.createdAt)} placement="top">
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {formatRelativeDate(sub.createdAt)}
                    </Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Box>
  );
}
