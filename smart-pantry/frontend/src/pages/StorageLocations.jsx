import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Package, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { StorageLocationService } from '../services/storage-location.service';

export default function StorageLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadLocations();
    }, []);

    async function loadLocations() {
        try {
            const data = await StorageLocationService.getAll();
            setLocations(data);
        } catch {
            toast.error("Erro ao carregar locais");
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(loc) {
        setEditingId(loc.id);
        setName(loc.name);
        setDescription(loc.description || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleCancelEdit() {
        setEditingId(null);
        setName('');
        setDescription('');
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            if (editingId) {
                await StorageLocationService.update(editingId, { name, description });
                toast.success("Local atualizado!");
            } else {
                await StorageLocationService.create({ name, description });
                toast.success("Local criado!");
            }
            handleCancelEdit();
            loadLocations();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar local");
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Tem certeza que deseja excluir este local?")) return;

        try {
            await StorageLocationService.delete(id);
            toast.success("Local removido!");

            if (editingId === id) {
                handleCancelEdit();
            }

            loadLocations();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Erro ao excluir local");
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
            <Header />

            <main className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <Package className="text-emerald-600" /> Locais de Armazenamento
                </h2>

                {/* Form to Add/Edit Location */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-200">
                            {editingId ? 'Editar Local' : 'Novo Local'}
                        </h3>
                        {editingId && (
                            <button type="button" onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-sm font-medium flex items-center gap-1">
                                <X size={16} /> Cancelar
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <input
                            type="text"
                            placeholder="Nome do local (ex: Armário)..."
                            className="flex-1 w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Descrição (opcional)..."
                            className="flex-1 w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                        <button type="submit" className="w-full md:w-auto min-w-[140px] bg-emerald-600 dark:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                            {editingId ? 'Salvar' : <><Plus size={20} /> Adicionar</>}
                        </button>
                    </form>
                </div>

                {loading ? (
                    <p className="text-center text-slate-500">Carregando...</p>
                ) : locations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locations.map(loc => (
                            <div key={loc.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Package size={20} />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-medium text-slate-700 dark:text-zinc-200 truncate">{loc.name}</span>
                                        {loc.description && <span className="text-xs text-slate-400 truncate">{loc.description}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                    <button onClick={() => handleEdit(loc)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Editar">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(loc.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Excluir">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-zinc-800">
                        <p className="text-slate-400 mb-2">Nenhum local cadastrado.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
