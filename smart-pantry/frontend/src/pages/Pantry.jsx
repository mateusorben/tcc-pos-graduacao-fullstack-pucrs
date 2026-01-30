import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Calendar, Plus, X, Trash2, Search } from 'lucide-react';

export default function Pantry() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [obs, setObs] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());

    const diff = new Date(p.expiry_date) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);

    if (filterStatus === 'expired') return matchesSearch && days < 0;
    if (filterStatus === 'warning') return matchesSearch && days >= 0 && days < 7;

    return matchesSearch;
  });

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

  async function handleDelete(id) {
    if (!window.confirm("Deseja realmente remover este item?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert("Erro ao excluir produto");
    }
  }

  async function updateQuantity(id, newQuantity) {
    if (newQuantity < 0) return;

    try {
      await api.patch(`/products/${id}/quantity`, { quantity: newQuantity });

      setProducts(products.map(p =>
        p.id === id ? { ...p, quantity: newQuantity } : p
      ));
    } catch (err) {
      alert("Erro ao atualizar quantidade");
    }
  }



  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Header />

      <main className="max-w-4xl mx-auto p-6">
        {/* CABEÇALHO E BUSCA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Meus Itens</h2>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar produto..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* BOTÕES DE FILTRO RÁPIDO */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'expired' ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            Vencidos
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'warning' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            Vencendo logo
          </button>
        </div>

        {/* GRID DE ITENS FILTRADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start font-bold text-slate-700">
                  <span className="truncate pr-2">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                      <button
                        onClick={() => updateQuantity(p.id, p.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        -
                      </button>

                      <span className="text-emerald-700 font-bold min-w-[20px] text-center">
                        {p.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(p.id, p.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Excluir item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className={`text-sm flex items-center gap-1 mt-2 ${getExpiryColor(p.expiry_date)}`}>
                  <Calendar size={14} /> Validade: {new Date(p.expiry_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <p className="text-slate-400">Nenhum item encontrado para esta busca ou filtro.</p>
            </div>
          )}
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