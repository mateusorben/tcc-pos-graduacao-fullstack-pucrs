import { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import { Calendar, Plus, X, Trash2, Search, Pencil, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { StorageLocationService } from '../services/storage-location.service';
import { APP_CONFIG, COLORS } from '../config/constants';

export default function Pantry() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const [storageLocationId, setStorageLocationId] = useState('');
  const [storageLocations, setStorageLocations] = useState([]);


  const [batches, setBatches] = useState([]);
  const [newBatchQty, setNewBatchQty] = useState('');
  const [newBatchDate, setNewBatchDate] = useState('');

  useEffect(() => {
    loadProducts();
    CategoryService.getAll()
      .then(data => setCategories(data))
      .catch(err => console.error(err));
    StorageLocationService.getAll()
      .then(data => setStorageLocations(data))
      .catch(err => console.error(err));
  }, []);

  function getExpiryColor(date) {
    if (!date) return COLORS.EXPIRY.SAFE;
    const diff = new Date(date) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 0) return COLORS.EXPIRY.EXPIRED;
    if (days < APP_CONFIG.EXPIRY_WARNING_DAYS) return COLORS.EXPIRY.WARNING;
    return COLORS.EXPIRY.SAFE;
  }

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
    }
  }

  async function handleOpenModal(product = null) {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setQuantity(product.quantity);
      setMinQuantity(product.min_quantity || '');
      setExpiryDate('');
      setObs(product.obs || '');
      setCategoryId(product.category_id || '');
      setStorageLocationId(product.storage_location_id || '');

      try {
        const batchesData = await ProductService.getBatches(product.id);
        setBatches(batchesData);
      } catch (e) {
        console.error(e);
        setBatches([]);
      }
    } else {
      setEditingProduct(null);
      setName('');
      setQuantity('');
      setMinQuantity('');
      setExpiryDate('');
      setObs('');
      setCategoryId('');
      setStorageLocationId('');
      setBatches([]);
    }
    setIsModalOpen(true);
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    try {
      const payload = {
        name,
        min_quantity: Number(minQuantity),
        obs,
        category_id: Number(categoryId) || null,
        storage_location_id: Number(storageLocationId) || null
      };

      if (editingProduct) {
        await ProductService.update(editingProduct.id, payload);
        toast.success('Produto atualizado!');
      } else {
        await ProductService.create({
          ...payload,
          quantity: Number(quantity),
          expiry_date: expiryDate
        });
        toast.success('Produto criado!');
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      const message = err.response?.data?.error || "Erro desconhecido";
      toast.error(`Erro: ${message}`);
    }
  }

  async function handleAddBatch() {
    if (!newBatchQty || !newBatchDate) return toast.error("Preencha quantidade e validade");

    try {
      await ProductService.addBatch(editingProduct.id, {
        quantity: Number(newBatchQty),
        expiry_date: newBatchDate
      });

      const updatedBatches = await ProductService.getBatches(editingProduct.id);
      setBatches(updatedBatches);
      loadProducts();

      setNewBatchQty('');
      setNewBatchDate('');
      toast.success("Lote adicionado!");
    } catch {
      toast.error("Erro ao adicionar lote");
    }
  }

  async function handleUpdateBatch(batchId, quantity) {
    try {
      if (quantity < 0) return;

      await ProductService.updateBatch(editingProduct.id, batchId, quantity);


      const updatedBatches = await ProductService.getBatches(editingProduct.id);
      setBatches(updatedBatches);


      loadProducts();
    } catch {
      toast.error("Erro ao atualizar lote");
    }
  }

  async function handleDeleteBatch(batchId) {
    try {
      await ProductService.deleteBatch(editingProduct.id, batchId);
      const updatedBatches = await ProductService.getBatches(editingProduct.id);
      setBatches(updatedBatches);
      loadProducts();
      toast.success("Lote removido!");
    } catch {
      toast.error("Erro ao remover lote");
    }
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
    } catch {
      toast.error("Erro ao excluir produto");
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 relative transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto p-6">
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

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">

          <button onClick={() => setFilterStatus('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'all' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'}`}>Todos</button>
          <button onClick={() => setFilterStatus('expired')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'expired' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'}`}>Vencidos</button>
          <button onClick={() => setFilterStatus('warning')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'warning' ? 'bg-amber-400 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'}`}>Vencendo logo</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <div key={p.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start font-bold text-slate-700 dark:text-zinc-200 mb-2">
                  <div className="flex flex-col overflow-hidden pr-2">
                    <span className="truncate text-lg">{p.name}</span>
                    {p.storage_location_name && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full w-fit mb-1">
                        <MapPin size={10} /> {p.storage_location_name}
                      </span>
                    )}
                    {p.obs && <span className="truncate text-xs text-slate-400 font-normal">{p.obs}</span>}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 p-1 px-3 rounded-lg border border-slate-100 dark:border-zinc-700 shadow-sm shrink-0">
                    <span className="text-emerald-700 dark:text-emerald-500 font-bold text-sm">
                      Qtd: {p.quantity}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-2">
                  <p className={`text-sm flex items-center gap-1 ${getExpiryColor(p.expiry_date)}`}>
                    <Calendar size={14} /> Validade: {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}
                  </p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleOpenModal(p)} className="text-slate-400 hover:text-emerald-500 transition-colors p-1" title="Editar item"><Pencil size={18} /></button>
                    <button onClick={() => confirmDelete(p.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1" title="Excluir item"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-zinc-800">
              <p className="text-slate-400">Nenhum item encontrada para esta busca ou filtro.</p>
            </div>
          )}
        </div>
      </main>

      <button onClick={() => handleOpenModal()} className="fixed bottom-8 right-8 bg-emerald-600 dark:bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"><Plus size={30} /></button>

      <ConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} title="Excluir Produto" message="Tem certeza que deseja remover este item da sua despensa? Esta ação não pode ser desfeita." confirmText="Sim, excluir" isDangerous={true} />


      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{editingProduct ? 'Gerenciar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Dados Gerais</h4>
                <input placeholder="Nome do produto" className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none" value={name} onChange={e => setName(e.target.value)} required />

                <div className="grid grid-cols-2 gap-4">
                  <select className="col-span-1 p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Categoria</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                  <select className="col-span-1 p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none" value={storageLocationId} onChange={e => setStorageLocationId(e.target.value)}>
                    <option value="">Local</option>
                    {storageLocations.map(loc => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 ml-1">Estoque Mínimo</label>
                  <input type="number" placeholder="Qtd Mínima" className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} />
                </div>

                <textarea placeholder="Observações" className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none h-20" value={obs} onChange={e => setObs(e.target.value)} />
              </div>

              {editingProduct && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Lotes ({batches.length})</h4>
                    <span className="text-sm font-bold text-emerald-600">Total: {batches.reduce((acc, b) => acc + b.quantity, 0)} un</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {batches.map(batch => (
                      <div key={batch.id} className="flex items-center justify-between text-sm p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                        <span className="text-slate-600 dark:text-zinc-300">
                          Validade: <b>{new Date(batch.expiry_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</b>
                        </span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleUpdateBatch(batch.id, batch.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-zinc-700 rounded hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors text-slate-600 dark:text-zinc-300">-</button>
                          <span className="font-bold text-slate-800 dark:text-zinc-100 w-8 text-center">{batch.quantity}</span>
                          <button type="button" onClick={() => handleUpdateBatch(batch.id, batch.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-zinc-700 rounded hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors text-slate-600 dark:text-zinc-300">+</button>

                          <button type="button" onClick={() => handleDeleteBatch(batch.id)} className="ml-2 text-rose-400 hover:text-rose-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    {batches.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Nenhum lote cadastrado.</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-end bg-slate-50 dark:bg-zinc-800 p-3 rounded-xl border border-dashed border-slate-200 dark:border-zinc-700">
                    <div className="col-span-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Qtd</label>
                      <input type="number" className="w-full p-2 text-sm rounded-md border border-slate-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white" value={newBatchQty} onChange={e => setNewBatchQty(e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Validade</label>
                      <input type="date" className="w-full p-2 text-sm rounded-md border border-slate-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white" value={newBatchDate} onChange={e => setNewBatchDate(e.target.value)} />
                    </div>
                    <button type="button" onClick={handleAddBatch} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 h-[38px] rounded-md font-bold text-sm hover:bg-emerald-200 transition-colors">+ Add</button>
                  </div>
                </div>
              )}

              {!editingProduct && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 ml-1">Quantidade Inicial</label>
                    <input type="number" placeholder="Qtd" className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none transition-colors" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 ml-1">Validade Inicial</label>
                    <input type="date" className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none transition-colors" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required />
                  </div>
                </div>
              )}

              <button className="w-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">{editingProduct ? 'Salvar Configurações' : 'Cadastrar Produto'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}