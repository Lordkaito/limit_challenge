'use client';

import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ToastContextValue {
  showError: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  showError: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

function useTheme() {
  return useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: '#0f62fe',
          },
          background: {
            default: '#f5f7fb',
          },
        },
        shape: { borderRadius: 8 },
      }),
    [],
  );
}

export default function Providers({ children }: PropsWithChildren) {
  const theme = useTheme();
  const [queryClient] = useState(() => new QueryClient());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showError = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const handleClose = useCallback(() => {
    setToastMessage(null);
  }, []);

  const toastContextValue = useMemo(() => ({ showError }), [showError]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContext.Provider value={toastContextValue}>
          {children}
          <Snackbar
            open={Boolean(toastMessage)}
            autoHideDuration={5000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <MuiAlert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
              {toastMessage}
            </MuiAlert>
          </Snackbar>
        </ToastContext.Provider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
