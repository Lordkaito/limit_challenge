import Chip from '@mui/material/Chip';
import { SubmissionPriority } from '@/lib/types';
import { PRIORITY_META } from '@/lib/utils/formatters';

interface Props {
  priority: SubmissionPriority;
  size?: 'small' | 'medium';
}

export function PriorityChip({ priority, size = 'small' }: Props) {
  const meta = PRIORITY_META[priority] ?? { label: priority, color: 'default' as const };
  return <Chip label={meta.label} color={meta.color} size={size} variant="outlined" />;
}
