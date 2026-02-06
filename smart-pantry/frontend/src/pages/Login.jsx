import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { Mail, Lock, LogIn, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await AuthService.getVapidKey();
        setServerStatus('online');
      } catch (error) {
        setServerStatus('offline');
      }
    };
    checkStatus();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await AuthService.login({ email, password });
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden min-h-[500px] flex flex-col md:flex-row">

        {/* Formulário (Lado Esquerdo) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-extrabold text-emerald-600 mb-2">Login</h1>
            <p className="text-slate-400 text-sm">Use seu email cadastrado para entrar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div className="text-right">
              <a href="#" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors">Esqueceu a senha?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Entrando..." : <>ENTRAR <LogIn size={18} /></>}
            </button>
          </form>

          {/* Status do Servidor (Rodapé do Form) */}
          <div className="mt-8 flex justify-center md:justify-start">
            {serverStatus === 'checking' && <span className="text-xs text-slate-400 animate-pulse">Verificando servidor...</span>}
            {serverStatus === 'online' && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 size={12} /> Servidor Online</span>}
            {serverStatus === 'offline' && <span className="text-xs text-rose-500 font-bold flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-full"><XCircle size={12} /> Servidor Offline</span>}
          </div>
        </div>

        {/* Banner (Lado Direito) */}
        <div className="w-full md:w-1/2 bg-emerald-600 text-white p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
          {/* Círculos decorativos de fundo */}
          <div className="absolute top-0 right-[-50px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-[-50px] w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

          <h2 className="text-3xl font-bold mb-4 relative z-10">Novo aqui?</h2>
          <p className="text-emerald-100 mb-8 relative z-10 max-w-xs text-sm leading-relaxed">
            Cadastre-se e comece a organizar sua despensa de forma inteligente e evite desperdícios.
          </p>
          <Link
            to="/register"
            className="px-8 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-emerald-600 transition-all active:scale-95 relative z-10"
          >
            CADASTRAR-SE
          </Link>
        </div>

      </div>
    </div>
  );
}