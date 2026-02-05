import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Package, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react';
import { DashboardService } from '../services/dashboard.service';
import { COLORS as APP_COLORS } from '../config/constants';

const COLORS = APP_COLORS.CHART;

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await DashboardService.getStats();
                setStats(data);
            } catch (err) {
                console.error("Erro ao carregar dashboard", err);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando indicadores...</div>;
    if (!stats) return <div className="p-8 text-center text-slate-500">Erro ao carregar dados.</div>;

    // Prepare Pie Chart Data
    const pieData = stats.byCategory.map(item => ({
        name: item.name,
        value: item.count
    }));

    // Prepare Bar Chart Data
    const barData = [
        { name: 'Vencidos', qtd: stats.expiredCount, fill: '#f43f5e' },
        { name: 'Vencem em 7 dias', qtd: stats.expiringCount, fill: '#f59e0b' },
        { name: 'Bons', qtd: stats.totalProducts - (stats.expiredCount + stats.expiringCount), fill: '#10b981' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
            <Header />

            <main className="max-w-6xl mx-auto p-6 space-y-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-zinc-100 mb-6">Visão Geral</h2>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KpiCard
                        title="Total de Itens"
                        value={stats.totalProducts}
                        icon={<Package />}
                        color="bg-emerald-500"
                    />
                    <KpiCard
                        title="Vencem em Breve"
                        value={stats.expiringCount}
                        icon={<TrendingUp />}
                        color="bg-amber-500"
                    />
                    <KpiCard
                        title="Já Vencidos"
                        value={stats.expiredCount}
                        icon={<AlertTriangle />}
                        color="bg-rose-500"
                    />
                    <KpiCard
                        title="Na Lista de Compras"
                        value={stats.listCount}
                        icon={<ShoppingCart />}
                        color="bg-blue-500"
                    />
                </div>

                {/* CHARTS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* PIE CHART */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 h-96">
                        <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-200 mb-4 text-center">Distribuição por Categoria</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="40%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    wrapperStyle={{ bottom: 20 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* BAR CHART */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 h-96">
                        <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-200 mb-4 text-center">Saúde do Estoque</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="qtd" radius={[8, 8, 0, 0]}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            </main>
        </div>
    );
}

function KpiCard({ title, value, icon, color }) {
    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between hover:scale-105 transition-transform">
            <div>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">{title}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-zinc-100">{value}</p>
            </div>
            <div className={`${color} text-white p-3 rounded-xl shadow-lg shadow-emerald-500/10`}>
                {icon}
            </div>
        </div>
    );
}
