import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { ShoppingCart, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ShoppingListService } from '../services/shopping-list.service';

export default function ShoppingList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => { loadShoppingList(); }, []);

    function getReason(item) {
        const isExpired = new Date(item.expiry_date) < new Date();
        const isLowStock = item.quantity <= item.min_quantity;

        if (isExpired && isLowStock) return { label: "Vencido e Acabando", color: "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800", icon: <AlertTriangle size={14} /> };
        if (isExpired) return { label: "Vencido", color: "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800", icon: <Clock size={14} /> };
        if (isLowStock) return { label: `Estoque Baixo (${item.quantity}/${item.min_quantity})`, color: "bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800", icon: <AlertTriangle size={14} /> };

        return { label: "Necessário", color: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300", icon: null };
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
            <Header />

            <main className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <ShoppingCart className="text-emerald-600 dark:text-emerald-500" /> Lista de Compras
                </h2>

                {loading ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 mt-10">Carregando sugestões de compra...</p>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map(item => {
                            const reason = getReason(item);
                            return (
                                <div key={item.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 transition-colors duration-300">
                                    <h3 className="font-bold text-slate-700 dark:text-zinc-200 text-lg mb-1">{item.name}</h3>

                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${reason.color}`}>
                                        {reason.icon} {reason.label}
                                    </span>
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
        </div>
    );
}
