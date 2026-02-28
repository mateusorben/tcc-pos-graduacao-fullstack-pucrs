/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Check, X, Calendar, ShoppingBag } from 'lucide-react';

export default function PurchaseModal({ isOpen, onClose, onConfirm, product }) {
    const [quantity, setQuantity] = useState(1);
    const [expiryDate, setExpiryDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Default to min_quantity if usually buy in bulk, or just 1.
            // If product has min_quantity > 0, maybe suggest (min - current)?
            // Let's simple default to 1.
            setQuantity(1);

            // Default expiry: Today + 30 days
            const date = new Date();
            date.setDate(date.getDate() + 30);
            setExpiryDate(date.toISOString().split('T')[0]);
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            quantity: Number(quantity),
            expiryDate
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-zinc-800">
                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 rounded-t-2xl">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                        <ShoppingBag className="text-emerald-600" /> Confirmar Compra
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        Estocando <span className="font-semibold text-slate-700 dark:text-zinc-300">{product.name}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                            Quantidade Comprada
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
                            autoFocus
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Será somada ao estoque atual ({product.quantity}).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                            Nova Validade
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Check size={18} /> Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
