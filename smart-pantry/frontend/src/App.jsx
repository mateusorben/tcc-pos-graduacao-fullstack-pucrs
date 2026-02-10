import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Pantry from './pages/Pantry';
import Profile from './pages/Profile';
import ShoppingList from './pages/ShoppingList';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import StorageLocations from './pages/StorageLocations';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';

import { Toaster } from 'sonner';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/pantry"
            element={<ProtectedRoute>
              <Pantry />
            </ProtectedRoute>} />
          <Route
            path="/profile"
            element={<ProtectedRoute>
              <Profile />
            </ProtectedRoute>} />
          <Route
            path="/categories"
            element={<ProtectedRoute>
              <Categories />
            </ProtectedRoute>} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>} />
          <Route
            path="/storage-locations"
            element={<ProtectedRoute>
              <StorageLocations />
            </ProtectedRoute>} />
          <Route
            path="/shopping-list"
            element={<ProtectedRoute>
              <ShoppingList />
            </ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;