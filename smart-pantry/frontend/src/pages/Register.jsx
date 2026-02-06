import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden min-h-[500px] flex flex-col md:flex-row">

                {/* Banner (Lado Esquerdo - Invertido emrelação ao login) */}
                <div className="w-full md:w-1/2 bg-emerald-600 text-white p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden order-2 md:order-1">
                    {/* Círculos decorativos */}
                    <div className="absolute top-0 left-[-50px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 right-[-50px] w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

                    <h2 className="text-3xl font-bold mb-4 relative z-10">Bem-vindo de volta!</h2>
                    <p className="text-emerald-100 mb-8 relative z-10 max-w-xs text-sm leading-relaxed">
                        Para se manter conectado conosco, faça login com suas informações pessoais.
                    </p>
                    <Link
                        to="/login"
                        className="px-8 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-emerald-600 transition-all active:scale-95 relative z-10"
                    >
                        ENTRAR
                    </Link>
                </div>

                {/* Formulário (Lado Direito) */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-1 md:order-2">
                    <div className="text-center md:text-left mb-8">
                        <h1 className="text-3xl font-extrabold text-emerald-600 mb-2">Criar Conta</h1>
                        <p className="text-slate-400 text-sm">Preencha seus dados para começar</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text" placeholder="Nome"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="email" placeholder="Email"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="password" placeholder="Senha"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? "Criando conta..." : <>CADASTRAR <UserPlus size={18} /></>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
