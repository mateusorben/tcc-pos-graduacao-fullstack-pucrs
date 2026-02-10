import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { ShoppingCart, AlertTriangle, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ShoppingListService } from '../services/shopping-list.service';
import PurchaseModal from '../components/PurchaseModal';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';

export default function ShoppingList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [adding, setAdding] = useState(false);

    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    function handlePurchaseClick(product) {
        setSelectedProduct(product);
        setPurchaseModalOpen(true);
    }

    async function handlePurchaseConfirm({ quantity, expiryDate }) {
        if (!selectedProduct) return;

        try {
            await ProductService.addBatch(selectedProduct.id, {
                quantity: quantity,
                expiry_date: expiryDate
            });

            toast.success("Produto atualizado e estoque abastecido!");
            setPurchaseModalOpen(false);
            setSelectedProduct(null);
            loadShoppingList();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar produto.");
        }
    }

    async function loadShoppingList() {
        try {
            const data = await ShoppingListService.getSuggested();
            setItems(data);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar lista de compras.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadShoppingList();
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            const data = await CategoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Erro ao carregar categorias", error);
        }
    }

    async function handleQuickAdd(e) {
        e.preventDefault();
        if (!newItemName.trim()) return;

        setAdding(true);
        try {

            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);

            await ProductService.create({
                name: newItemName,
                quantity: 0,
                min_quantity: 1,
                expiry_date: futureDate.toISOString(),
                category_id: newItemCategory || null
            });

            toast.success("Item adicionado à lista!");
            setNewItemName('');
            setNewItemCategory('');
            loadShoppingList(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Erro ao adicionar item.");
        } finally {
            setAdding(false);
        }
    }

    function getReason(item) {
        const isExpired = new Date(item.expiry_date) < new Date();
        const isLowStock = item.quantity <= (item.min_quantity || 0);

        if (isExpired && isLowStock) return { label: "Vencido e Acabando", color: "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800", icon: <AlertTriangle size={14} /> };
        if (isExpired) return { label: "Vencido", color: "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800", icon: <Clock size={14} /> };
        if (isLowStock) return { label: `Estoque Baixo (${item.quantity}/${item.min_quantity})`, color: "bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800", icon: <AlertTriangle size={14} /> };

        return { label: "Necessário", color: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300", icon: null };
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
            <Header />

            <main className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                        <ShoppingCart className="text-emerald-600 dark:text-emerald-500" /> Lista de Compras
                    </h2>
                </div>

                {/* Quick Add Form */}
                <form onSubmit={handleQuickAdd} className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Adicionar item rápido (ex: Leite, Pão)..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1 w-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
                    />

                    <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="w-full md:w-48 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
                    >
                        <option value="">Sem Categoria</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        disabled={adding || !newItemName.trim()}
                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {adding ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Plus size={20} /> Adicionar</>}
                    </button>
                </form>

                {loading ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 mt-10">Carregando sugestões de compra...</p>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map(item => {
                            const reason = getReason(item);
                            return (
                                <div key={item.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 transition-colors duration-300 relative group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-700 dark:text-zinc-200 text-lg mb-1">{item.name}</h3>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${reason.color}`}>
                                                {reason.icon} {reason.label}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handlePurchaseClick(item)}
                                            className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                            title="Marcar como Comprado"
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-zinc-800 transition-colors duration-300">
                        <ShoppingCart size={48} className="mx-auto text-slate-300 dark:text-zinc-600 mb-4" />
                        <p className="text-slate-500 dark:text-zinc-400 font-medium">Tudo certo por aqui!</p>
                        <p className="text-slate-400 dark:text-zinc-500 text-sm">Nenhum item vencido ou com estoque baixo.</p>
                    </div>
                )}
            </main>

            <PurchaseModal
                isOpen={purchaseModalOpen}
                onClose={() => setPurchaseModalOpen(false)}
                onConfirm={handlePurchaseConfirm}
                product={selectedProduct}
            />
        </div>
    );
}
