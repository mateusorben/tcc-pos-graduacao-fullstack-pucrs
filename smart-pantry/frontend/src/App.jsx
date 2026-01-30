import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Pantry from './pages/Pantry';
import Profile from './pages/Profile';
import ShoppingList from './pages/ShoppingList';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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