import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Package, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { StorageLocationService } from '../services/storage-location.service';

export default function StorageLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    function handleOpenModal(loc = null) {
        if (loc) {
            setEditingId(loc.id);
            setName(loc.name);
            setDescription(loc.description || '');
        } else {
            setEditingId(null);
            setName('');
            setDescription('');
        }
        setIsModalOpen(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        try {
            if (editingId) {
                await StorageLocationService.update(editingId, { name, description });
                toast.success("Local atualizado!");
            } else {
                await StorageLocationService.create({ name, description });
                toast.success("Local criado!");
            }
            setIsModalOpen(false);
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
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                        <Package className="text-emerald-600" /> Locais de Armazenamento
                    </h2>
                    <button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Plus size={20} /> Novo Local
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-slate-500">Carregando...</p>
                ) : locations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locations.map(loc => (
                            <div key={loc.id} className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 flex justify-between items-start group">
                                <div>
                                    <h3 className="font-bold text-slate-700 dark:text-zinc-200 text-lg">{loc.name}</h3>
                                    {loc.description && <p className="text-sm text-slate-400 mt-1">{loc.description}</p>}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(loc)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(loc.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-zinc-800">
                        <p className="text-slate-400">Nenhum local cadastrado.</p>
                        <button onClick={() => handleOpenModal()} className="mt-4 text-emerald-600 font-bold hover:underline">Cadastrar o primeiro</button>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{editingId ? 'Editar Local' : 'Novo Local'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-400 mb-1">Nome do Local</label>
                                <input
                                    className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Armário da Cozinha, Geladeira..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-400 mb-1">Descrição (opcional)</label>
                                <textarea
                                    className="w-full p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Detalhes sobre o local..."
                                />
                            </div>
                            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors">
                                Salvar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
