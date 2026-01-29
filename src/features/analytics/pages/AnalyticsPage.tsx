import { useMemo } from 'react';
import { formatCurrency } from '@/core/utils/currency';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip as RechartsTooltip } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { AppLayout } from '@/components/Layout/AppLayout';

export const AnalyticsPage = () => {
    // const navigate = useNavigate(); // handled by AppLayout
    const { data: transactions = [], isLoading } = useTransactions();

    const currentMonthStats = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const thisMonthTransactions = transactions.filter(t =>
            t.is_expense && isWithinInterval(parseISO(t.date), { start, end })
        );

        const total = thisMonthTransactions.reduce((acc, curr) => acc + curr.amount, 0);
        return { total, count: thisMonthTransactions.length };
    }, [transactions]);

    const categoryData = useMemo(() => {
        const categoryMap = new Map<string, number>();
        transactions.filter(t => t.is_expense).forEach(t => {
            const current = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, current + t.amount);
        });

        const data = Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 categories

        return data;
    }, [transactions]);

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const trendData = useMemo(() => {
        const dailyMap = new Map<string, number>();
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        transactions.filter(t => t.is_expense && isWithinInterval(parseISO(t.date), { start, end }))
            .forEach(t => {
                const day = format(parseISO(t.date), 'dd MMM');
                const current = dailyMap.get(day) || 0;
                dailyMap.set(day, current + t.amount);
            });

        return Array.from(dailyMap.entries())
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <AppLayout title="Spending Analysis" showAddButton={true}>
            <div className="flex flex-col pb-20">
                <div className="px-4 mt-6">
                    <div className="bg-primary rounded-3xl p-6 text-white shadow-lg shadow-blue-500/30">
                        <p className="text-blue-100 text-sm font-medium mb-1">Total Spent This Month</p>
                        <h2 className="text-3xl font-extrabold mb-4">{formatCurrency(currentMonthStats.total)}</h2>
                    </div>
                </div>

                <div className="px-4 mt-6">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Category Breakdown</h3>
                        </div>

                        <div className="h-64 relative w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                                </PieChart>
                            </ResponsiveContainer>
                            {categoryData.length > 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Top</span>
                                    <span className="text-xl font-extrabold">{categoryData[0].name}</span>
                                </div>
                            )}
                        </div>

                        {/* Category List */}
                        <div className="space-y-4 mt-4">
                            {categoryData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <div>
                                            <p className="text-sm font-bold">{item.name}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold">{formatCurrency(item.value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-4 mt-6">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-6">Spending Trend</h3>
                        <div className="h-48 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2463eb" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2463eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" hide />
                                    <RechartsTooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                                    <Area type="monotone" dataKey="amount" stroke="#2463eb" fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
