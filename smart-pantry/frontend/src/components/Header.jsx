import { useState, useEffect } from 'react';
import { Package, LogOut, User, Settings, ShoppingCart, Sun, Moon, TrendingUp, Tag } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    function handleLogout() {
        localStorage.clear();
        navigate('/login');
    }

    // Função para pegar as iniciais do nome (Ex: João Silva -> JS)
    function getInitials(name) {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return (
        <nav className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 px-6 py-4 flex justify-between items-center z-50 relative shadow-sm transition-colors duration-300">
            <Link to="/pantry" className="text-xl font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Package /> Smart Pantry
            </Link>

            <div className="flex items-center gap-4">
                <Link
                    to="/dashboard"
                    className="p-2 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 rounded-full transition-colors relative"
                    title="Dashboard"
                >
                    <TrendingUp size={24} />
                </Link>

                <Link
                    to="/shopping-list"
                    className="p-2 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 rounded-full transition-colors relative"
                    title="Lista de Compras"
                >
                    <ShoppingCart size={24} />
                </Link>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 focus:outline-none"
                        title="Menu do Usuário"
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center border-2 border-emerald-200 hover:scale-105 transition-transform">
                            {user ? getInitials(user.name) : 'U'}
                        </div>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800 mb-2">
                                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{user?.email}</p>
                            </div>

                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors w-full text-left font-medium"
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                {theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
                            </button>

                            <Link
                                to="/profile"
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors w-full text-left font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Settings size={18} /> Meu Perfil
                            </Link>

                            <Link
                                to="/categories"
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors w-full text-left font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Tag size={18} /> Categorias
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full text-left font-medium"
                            >
                                <LogOut size={18} /> Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay para fechar ao clicar fora */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
        </nav>
    );
}
