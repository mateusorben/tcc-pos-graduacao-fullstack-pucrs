import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await AuthService.register({ name, email, password });
            alert('Cadastro realizado com sucesso! Faça login para continuar.');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.error || "Erro ao realizar cadastro.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <h1 className="text-3xl font-extrabold text-emerald-600 text-center mb-2">Crie sua Conta</h1>
                <p className="text-slate-500 text-center mb-8 text-sm">Junte-se ao Smart Pantry</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text" placeholder="Seu nome"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email" placeholder="Seu e-mail"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password" placeholder="Sua senha"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Já tem uma conta? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Faça login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
