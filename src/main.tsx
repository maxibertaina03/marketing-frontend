import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/rutas';
import './index.css';

const claveClerk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!claveClerk) {
  throw new Error('Falta VITE_CLERK_PUBLISHABLE_KEY en el archivo .env');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={claveClerk} afterSignOutUrl="/login">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);
