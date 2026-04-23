import { Skeleton, TableCell, TableRow } from '@mui/material';

interface Props {
  rows?: number;
}

export function LoadingState({ rows = 6 }: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rounded" width={70} height={24} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rounded" width={60} height={24} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={100} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={30} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={30} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={160} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={70} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
