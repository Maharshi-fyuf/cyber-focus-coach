import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Placeholder } from './pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="roadmap" element={<Placeholder />} />
          <Route path="logs" element={<Placeholder />} />
          <Route path="settings" element={<Placeholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
