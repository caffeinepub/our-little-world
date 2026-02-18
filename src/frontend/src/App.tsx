import AppShell from './components/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AppShell />
      <Toaster />
    </ThemeProvider>
  );
}
