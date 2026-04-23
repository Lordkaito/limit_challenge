import Chip from '@mui/material/Chip';
import { SubmissionStatus } from '@/lib/types';
import { STATUS_META } from '@/lib/utils/formatters';

interface Props {
  status: SubmissionStatus;
  size?: 'small' | 'medium';
}

export function StatusChip({ status, size = 'small' }: Props) {
  const meta = STATUS_META[status] ?? { label: status, color: 'default' as const };
  return <Chip label={meta.label} color={meta.color} size={size} />;
}
