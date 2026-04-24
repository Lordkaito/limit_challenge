import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { Document } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';

interface Props {
  documents: Document[];
}

export function DocumentsSection({ documents }: Props) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Documents{' '}
          <Typography component="span" variant="caption" color="text.secondary">
            ({documents.length})
          </Typography>
        </Typography>
        {documents.length === 0 ? (
          <Typography color="text.disabled" variant="body2">
            No documents attached
          </Typography>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {documents.map((doc) => (
              <Box
                key={doc.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                py={1.5}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <DescriptionIcon color="action" fontSize="small" />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {doc.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.docType} · Uploaded {formatDate(doc.uploadedAt)}
                    </Typography>
                  </Box>
                </Stack>
                {doc.fileUrl && (
                  <Link
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    aria-label={`Open ${doc.title}`}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </Link>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
