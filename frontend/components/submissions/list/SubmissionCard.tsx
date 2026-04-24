'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import { useRouter } from 'next/navigation';

import { SubmissionListItem } from '@/lib/types';
import { StatusChip } from '@/components/common/StatusChip';
import { PriorityChip } from '@/components/common/PriorityChip';
import { formatRelativeDate, formatDateTime } from '@/lib/utils/formatters';

interface Props {
  submission: SubmissionListItem;
  backQs?: string;
}

export const SubmissionCard = memo(function SubmissionCard({ submission: sub, backQs }: Props) {
  const router = useRouter();

  function handleClick() {
    router.push(`/submissions/${sub.id}${backQs ? `?${backQs}` : ''}`);
  }

  return (
    <Card variant="outlined">
      <CardActionArea
        onClick={handleClick}
        aria-label={`View submission for ${sub.company.legalName}`}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box flex={1} mr={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                {sub.company.legalName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sub.company.industry}
                {sub.company.headquartersCity ? ` · ${sub.company.headquartersCity}` : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5} flexShrink={0}>
              <StatusChip status={sub.status} />
              <PriorityChip priority={sub.priority} />
            </Stack>
          </Stack>

          <Typography variant="body2" color="text.secondary" mb={1}>
            {sub.broker.name} · {sub.owner.fullName}
          </Typography>

          {sub.latestNote && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1,
              }}
            >
              {sub.latestNote.authorName}: {sub.latestNote.bodyPreview}
            </Typography>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
            <Stack direction="row" spacing={1.5}>
              <Typography variant="caption" color="text.secondary">
                {sub.documentCount} doc{sub.documentCount !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sub.noteCount} note{sub.noteCount !== 1 ? 's' : ''}
              </Typography>
            </Stack>
            <Tooltip title={formatDateTime(sub.createdAt)} placement="top">
              <Typography variant="caption" color="text.secondary">
                {formatRelativeDate(sub.createdAt)}
              </Typography>
            </Tooltip>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});
