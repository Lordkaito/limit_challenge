import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { NoteDetail } from '@/lib/types';
import { formatRelativeDate, formatDateTime } from '@/lib/utils/formatters';

interface Props {
  notes: NoteDetail[];
}

export function NotesSection({ notes }: Props) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notes{' '}
          <Typography component="span" variant="caption" color="text.secondary">
            ({notes.length})
          </Typography>
        </Typography>
        {notes.length === 0 ? (
          <Typography color="text.disabled" variant="body2">
            No notes yet
          </Typography>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {notes.map((note) => (
              <Box key={note.id} py={2}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: 13,
                      bgcolor: 'primary.light',
                    }}
                  >
                    {note.authorName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box flex={1}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle2">{note.authorName}</Typography>
                      <Tooltip title={formatDateTime(note.createdAt)} placement="top">
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeDate(note.createdAt)}
                        </Typography>
                      </Tooltip>
                    </Stack>
                    <Typography
                      variant="body2"
                      mt={0.5}
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {note.body}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
