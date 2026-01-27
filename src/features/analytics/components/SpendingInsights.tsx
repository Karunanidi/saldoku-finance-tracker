import { useState } from 'react';
import { Transaction } from '@/data/models/Transaction';
import { geminiService, SpendingAnalysis } from '@/data/services/geminiService';
import { formatCurrency } from '@/core/utils/currency';

interface SpendingInsightsProps {
    transactions: Transaction[];
    income: number;
}

export const SpendingInsights = ({ transactions, income }: SpendingInsightsProps) => {
    const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        try {
            const safeIncome = income > 0 ? income : 5000;
            const result = await geminiService.analyzeSpending(transactions, safeIncome);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Default state (Pre-analysis) mimicking the HTML design but as "Status: Unknown" or just generic text
    if (!analysis) {
        return (
            <div className="px-4 pt-2">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                    <h3 className="text-[#111318] dark:text-white text-base font-bold leading-tight tracking-[-0.015em]">AI Insights</h3>
                </div>
                <div className="@container">
                    <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#dbdee6] dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
                        <div className="flex w-full justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-gray-400"></span>
                                <p className="text-[#111318] dark:text-white text-sm font-bold leading-tight">Status: Ready to Analyze</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider">Powered by Gemini</span>
                        </div>
                        <p className="text-[#616e89] dark:text-gray-400 text-sm font-normal leading-normal">
                            Ready to see your personalized daily spending limit? Tap below to analyze your budget.
                        </p>
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-medium leading-normal transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            <span className="truncate">{isLoading ? 'Analyzing...' : 'Optimize Budget'}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Analyzed State
    const statusColor = analysis.status === 'Healthy' ? 'bg-green-500' : analysis.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="px-4 pt-2">
            <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                <h3 className="text-[#111318] dark:text-white text-base font-bold leading-tight tracking-[-0.015em]">AI Insights</h3>
            </div>
            <div className="@container">
                <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#dbdee6] dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>

                    <div className="flex w-full justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className={`size-2 rounded-full ${statusColor} animate-pulse`}></span>
                            <p className="text-[#111318] dark:text-white text-sm font-bold leading-tight">Status: {analysis.status}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider">Powered by Gemini</span>
                    </div>

                    <p className="text-[#616e89] dark:text-gray-400 text-sm font-normal leading-normal">
                        Your personalized daily spending limit is <span className="font-bold text-[#111318] dark:text-white">{formatCurrency(analysis.safeDailySpend)}</span> to stay on track.
                        <br />
                        <span className="italic">"{analysis.message}"</span>
                    </p>

                    <div className="w-full">
                        <p className="text-xs font-bold mb-1">Tips:</p>
                        <ul className="text-xs text-[#616e89] list-disc pl-4">
                            {analysis.recommendations.slice(0, 2).map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-medium leading-normal transition-opacity hover:opacity-90"
                    >
                        <span className="truncate">Refresh Analysis</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
