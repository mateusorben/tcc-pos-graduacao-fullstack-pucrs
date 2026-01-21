import { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, Calendar, LogOut, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pantry() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [obs, setObs] = useState('');

  async function loadProducts() {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      await api.post('/products', { 
        name, 
        quantity: Number(quantity), 
        expiry_date: expiryDate, 
        obs 
      });
      
      setName(''); setQuantity(''); setExpiryDate(''); setObs('');
      setIsModalOpen(false);
      
      loadProducts();
    } catch (err) {
      const message = err.response?.data?.error || "Erro desconhecido no servidor";
      const status = err.response?.status;
      
      alert(`Erro ${status}: ${message}`);
      
      if (status === 401 || status === 403) {
        console.warn("Sua sessão expirou ou o token é inválido.");
      }
    }
  }

  function getExpiryColor(date) {
    const diff = new Date(date) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 0) return 'text-red-600 font-bold';
    if (days < 7) return 'text-amber-600 font-bold';
    return 'text-slate-500';
  }

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2"><Package /> Smart Pantry</h1>
        <button onClick={handleLogout} className="text-slate-400 hover:text-red-500"><LogOut size={20} /></button>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Meus Itens</h2>
        
        {/* Grid de Itens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between font-bold text-slate-700">
                <span>{p.name}</span>
                <span className="text-emerald-600">{p.quantity} un</span>
              </div>
              <p className={`text-sm flex items-center gap-1 mt-2 ${getExpiryColor(p.expiry_date)}`}>
                <Calendar size={14} /> Validade: {new Date(p.expiry_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Botão Flutuante */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <Plus size={30} />
      </button>

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Novo Produto</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <input 
                placeholder="Nome do produto (ex: Leite)" 
                className="w-full p-3 bg-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={name} onChange={e => setName(e.target.value)} required
              />
              <div className="flex gap-4">
                <input 
                  type="number" placeholder="Qtd" 
                  className="w-1/3 p-3 bg-slate-100 rounded-lg outline-none"
                  value={quantity} onChange={e => setQuantity(e.target.value)} required
                />
                <input 
                  type="date" 
                  className="w-2/3 p-3 bg-slate-100 rounded-lg outline-none"
                  value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required
                />
              </div>
              <textarea 
                placeholder="Observações (opcional)" 
                className="w-full p-3 bg-slate-100 rounded-lg outline-none h-24"
                value={obs} onChange={e => setObs(e.target.value)}
              />
              <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors">
                Salvar na Despensa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}