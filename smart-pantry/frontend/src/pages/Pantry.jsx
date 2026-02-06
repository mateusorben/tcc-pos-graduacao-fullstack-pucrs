import { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import { Calendar, Plus, X, Trash2, Search, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { APP_CONFIG, COLORS } from '../config/constants';

export default function Pantry() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [obs, setObs] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    CategoryService.getAll()
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());

      const diff = new Date(p.expiry_date) - new Date();
      const days = diff / (1000 * 60 * 60 * 24);

      if (filterStatus === 'expired') return matchesSearch && days < 0;
      if (filterStatus === 'warning') return matchesSearch && days >= 0 && days < APP_CONFIG.EXPIRY_WARNING_DAYS;

      return matchesSearch;
    });
  }, [products, searchTerm, filterStatus]);

  async function loadProducts() {
    try {
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenModal(product = null) {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setQuantity(product.quantity);
      setMinQuantity(product.min_quantity || '');
      setExpiryDate(new Date(product.expiry_date).toISOString().split('T')[0]);
      setObs(product.obs || '');
      setCategoryId(product.category_id || '');
    } else {
      setEditingProduct(null);
      setName('');
      setQuantity('');
      setMinQuantity('');
      setExpiryDate('');
      setObs('');
      setCategoryId('');
    }
    setIsModalOpen(true);
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    try {
      const payload = {
        name,
        quantity: Number(quantity),
        min_quantity: Number(minQuantity),
        expiry_date: expiryDate,
        obs,
        category_id: Number(categoryId) || null
      };

      if (editingProduct) {
        await ProductService.update(editingProduct.id, payload);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await ProductService.create(payload);
        toast.success('Produto adicionado com sucesso!');
      }

      setName(''); setQuantity(''); setMinQuantity(''); setExpiryDate(''); setObs(''); setCategoryId('');
      setIsModalOpen(false);

      loadProducts();
    } catch (err) {
      const message = err.response?.data?.error || "Erro desconhecido no servidor";
      toast.error(`Erro: ${message}`);
    }
  }

  function getExpiryColor(date) {
    const diff = new Date(date) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 0) return COLORS.EXPIRY.EXPIRED;
    if (days < APP_CONFIG.EXPIRY_WARNING_DAYS) return COLORS.EXPIRY.WARNING;
    return COLORS.EXPIRY.SAFE;
  }

  function confirmDelete(id) {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!productToDelete) return;

    try {
      await ProductService.delete(productToDelete);
      setProducts(products.filter(p => p.id !== productToDelete));
      toast.success('Produto removido.');
    } catch (err) {
      toast.error("Erro ao excluir produto");
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  }

  async function updateQuantity(id, newQuantity) {
    if (newQuantity < 0) return;

    try {
      await ProductService.updateQuantity(id, newQuantity);

      setProducts(products.map(p =>
        p.id === id ? { ...p, quantity: newQuantity } : p
      ));
    } catch (err) {
      toast.error("Erro ao atualizar quantidade");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 relative transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto p-6">
        {/* CABEÇALHO E BUSCA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Meus Itens</h2>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar produto..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm text-slate-800 dark:text-zinc-200 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* BOTÕES DE FILTRO RÁPIDO */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'all' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'expired' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'}`}
          >
            Vencidos
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'warning' ? 'bg-amber-400 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'}`}
          >
            Vencendo logo
          </button>
        </div>

        {/* GRID DE ITENS FILTRADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <div key={p.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start font-bold text-slate-700 dark:text-zinc-200">
                  <div className="flex flex-col overflow-hidden pr-2">
                    <span className="truncate text-lg">{p.name}</span>
                    {p.obs && <span className="truncate text-xs text-slate-400 font-normal">{p.obs}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 p-1 rounded-lg border border-slate-100 dark:border-zinc-700">
                      <button
                        onClick={() => updateQuantity(p.id, p.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-md shadow-sm text-slate-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                      >
                        -
                      </button>

                      <span className="text-emerald-700 dark:text-emerald-500 font-bold min-w-[20px] text-center">
                        {p.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(p.id, p.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-md shadow-sm text-slate-600 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="text-slate-300 hover:text-emerald-500 transition-colors p-1"
                      title="Editar item"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => confirmDelete(p.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
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
            <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-zinc-800">
              <p className="text-slate-400">Nenhum item encontrada para esta busca ou filtro.</p>
            </div>
          )}
        </div>
      </main>

      {/* Botão Flutuante */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-8 right-8 bg-emerald-600 dark:bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <Plus size={30} />
      </button>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Produto"
        message="Tem certeza que deseja remover este item da sua despensa? Esta ação não pode ser desfeita."
        confirmText="Sim, excluir"
        isDangerous={true}
      />

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <input
                placeholder="Nome do produto (ex: Leite)"
                className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                value={name} onChange={e => setName(e.target.value)} required
              />
              <select
                className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none transition-colors"
                value={categoryId} onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">Selecione uma Categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex gap-4">
                <input
                  type="number" placeholder="Qtd"
                  className="w-1/3 p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none transition-colors"
                  value={quantity} onChange={e => setQuantity(e.target.value)} required
                />
                <input
                  type="number" placeholder="Qtd Mín."
                  className="w-1/3 p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none transition-colors"
                  value={minQuantity} onChange={e => setMinQuantity(e.target.value)}
                  title="Quantidade mínima para alerta de compra"
                />
                <input
                  type="date"
                  className="w-1/3 p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none transition-colors"
                  value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required
                />
              </div>
              <textarea
                placeholder="Observações (opcional)"
                className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none h-24 transition-colors"
                value={obs} onChange={e => setObs(e.target.value)}
              />
              <button className="w-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors">
                {editingProduct ? 'Salvar Alterações' : 'Salvar na Despensa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}