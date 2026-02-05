import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [serverStatus, setServerStatus] = useState('checking'); // checking, online, offline

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await AuthService.getVapidKey(); // Use simple endpoint to test connection
        setServerStatus('online');
      } catch (error) {
        console.error("Server check failed:", error);
        setServerStatus('offline');
      }
    };
    checkStatus();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    console.log("Handle Login Called");
    setLoading(true);
    try {
      const data = await AuthService.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-2">
          <h1 className="text-3xl font-extrabold text-emerald-600 text-center">Smart Pantry</h1>
          {serverStatus === 'checking' && <span className="text-xs text-slate-400">Verificando servidor...</span>}
          {serverStatus === 'online' && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">● Servidor Online</span>}
          {serverStatus === 'offline' && <span className="text-xs text-rose-500 font-bold flex items-center gap-1">● Servidor Offline (Erro de conexão)</span>}
        </div>
        <p className="text-slate-500 text-center mb-8 text-sm">Gerencie sua despensa de forma inteligente</p>

        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Não tem uma conta? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}