/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryService } from '../services/category.service';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');

    async function loadCategories() {
        try {
            const data = await CategoryService.getAll();
            setCategories(data);
        } catch {
            // Ignorado intencionalmente no catch
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    async function handleAddCategory(e) {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            const data = await CategoryService.create({ name: newCategory });
            setCategories([...categories, data]);
            setNewCategory('');
            toast.success('Categoria criada com sucesso!');
        } catch {
            toast.error('Erro ao criar categoria.');
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
            <Header />

            <main className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <Tag /> Gerenciar Categorias
                </h2>

                {/* Form to Add Category */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 mb-8">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-200 mb-4">Nova Categoria</h3>
                    <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Nome da categoria..."
                            className="flex-1 p-3 bg-slate-100 dark:bg-zinc-800 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            required
                        />
                        <button className="bg-emerald-600 dark:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                            <Plus size={20} /> Adicionar
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Tag size={20} />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-zinc-200">{cat.name}</span>
                            {cat.user_id === null && (
                                <span className="ml-auto text-xs bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2 py-1 rounded-full">Padrão</span>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
