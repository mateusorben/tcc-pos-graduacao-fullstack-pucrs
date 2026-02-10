import { X } from 'lucide-react';

export default function DetailsModal({ isOpen, onClose, title, items, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 border border-slate-100 dark:border-zinc-800 ring-1 ring-black/5">

                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50 rounded-t-2xl sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-slate-500 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-0 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                            <p className="text-sm font-medium">Carregando itens...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center justify-center text-slate-500 dark:text-zinc-500 space-y-3">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                                <X size={32} className="opacity-50" />
                            </div>
                            <p className="text-lg font-medium text-slate-700 dark:text-zinc-300">Nenhum item encontrado.</p>
                            <p className="text-sm text-slate-400">Não há produtos correspondentes a este filtro.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 font-medium sticky top-0">
                                    <tr>
                                        <th className="p-4 pl-6">Produto</th>
                                        <th className="p-4 text-center">Qtd</th>
                                        <th className="p-4 text-right pr-6">Validade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                    {items.map((item) => {
                                        // Formata data de validade (assume ISO UTC e converte para local apenas na visualização)
                                        // Se for YYYY-MM-DD, adiciona T00:00:00 para garantir UTC e evitar "dia anterior"
                                        const expiryDate = item.expiry_date.length === 10 ? item.expiry_date + 'T00:00:00' : item.expiry_date;
                                        const dateObj = new Date(expiryDate);
                                        const isExpired = dateObj < new Date();

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                                <td className="p-4 pl-6 font-medium text-slate-800 dark:text-zinc-200">
                                                    <div className="flex flex-col">
                                                        <span>{item.name}</span>
                                                        {item.obs && (
                                                            <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal truncate max-w-[200px]">{item.obs}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.quantity <= (item.min_quantity || 0)
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                        }`}>
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <span className={`font-medium ${isExpired
                                                            ? 'text-rose-600 dark:text-rose-400'
                                                            : 'text-slate-600 dark:text-zinc-400'
                                                        }`}>
                                                        {dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end bg-slate-50/30 dark:bg-zinc-900 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl font-semibold transition-colors active:scale-95"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
