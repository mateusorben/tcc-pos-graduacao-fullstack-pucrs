import { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Save, Lock, User } from 'lucide-react';

export default function Profile() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setName(user.name);
            setEmail(user.email);
        }
    }, []);

    async function handleUpdate(e) {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }

        setLoading(true);
        try {
            const response = await api.put('/users', {
                name,
                password: password || undefined
            });

            // Atualiza dados no localStorage
            const newUser = { ...JSON.parse(localStorage.getItem('user')), name: response.data.user.name };
            localStorage.setItem('user', JSON.stringify(newUser));

            alert('Perfil atualizado com sucesso!');
            setPassword('');
            setConfirmPassword('');

            // Força recarregamento para atualizar iniciais no Header se necessário
            window.location.reload();

        } catch (err) {
            alert(err.response?.data?.error || "Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
            <Header />

            <main className="max-w-xl mx-auto p-6 mt-8">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
                        <User className="text-emerald-600 dark:text-emerald-500" /> Meu Perfil
                    </h2>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="block text-slate-600 dark:text-zinc-300 font-medium mb-1">Nome</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-colors"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 dark:text-zinc-500 font-medium mb-1">E-mail (não pode ser alterado)</label>
                            <input
                                type="email"
                                className="w-full p-3 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 dark:text-zinc-500 cursor-not-allowed transition-colors"
                                value={email}
                                disabled
                            />
                        </div>

                        <hr className="border-slate-100 dark:border-zinc-800 my-6" />

                        <div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-200 mb-4 flex items-center gap-2">
                                <Lock size={18} className="text-slate-400 dark:text-zinc-500" /> Alterar Senha
                            </h3>
                            <div className="space-y-4">
                                <input
                                    type="password"
                                    placeholder="Nova senha (deixe em branco para manter)"
                                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-colors"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirme a nova senha"
                                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-colors"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Salvando..." : <><Save size={20} /> Salvar Alterações</>}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
