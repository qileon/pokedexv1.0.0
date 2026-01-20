
import React, { useState } from 'react';
import { Card, CardHeader, Badge, Button } from './UI';
import { NATURES, capitalize, STAT_NAMES } from '../utils';

interface NatureListPageProps {
    onBack: () => void;
}

export const NatureListPage: React.FC<NatureListPageProps> = ({ onBack }) => {
    const [search, setSearch] = useState('');

    const filteredNatures = NATURES.filter(n => 
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        (n.increased && STAT_NAMES[n.increased].toLowerCase().includes(search.toLowerCase())) ||
        (n.decreased && STAT_NAMES[n.decreased].toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button onClick={onBack} variant="secondary" className="flex items-center gap-2">
                        <span>←</span> <span className="hidden sm:inline">Back</span>
                    </Button>
                    <h2 className="text-3xl font-bold">Nature Library</h2>
                </div>
                <div className="relative w-full md:w-64">
                    <input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search nature or stat..."
                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition text-[var(--text-color)]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNatures.map(nature => (
                    <Card key={nature.name} className="hover:border-[var(--accent-color)] transition-colors">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold">{capitalize(nature.name)}</h3>
                                {!nature.increased && <span className="text-xs opacity-50 font-mono">Neutral</span>}
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="opacity-70">Stat Increase</span>
                                    {nature.increased ? (
                                        <span className="font-bold text-green-400 flex items-center gap-1">
                                            {STAT_NAMES[nature.increased]} <span className="text-lg">↑</span>
                                        </span>
                                    ) : (
                                        <span className="opacity-30">—</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="opacity-70">Stat Decrease</span>
                                    {nature.decreased ? (
                                        <span className="font-bold text-red-400 flex items-center gap-1">
                                            {STAT_NAMES[nature.decreased]} <span className="text-lg">↓</span>
                                        </span>
                                    ) : (
                                        <span className="opacity-30">—</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 text-xs italic opacity-60 leading-relaxed">
                                {nature.increased 
                                    ? `Provides a 10% bonus to ${STAT_NAMES[nature.increased]} while penalizing ${STAT_NAMES[nature.decreased || '']} by 10%.`
                                    : "Balanced growth nature. No stats are modified by this nature."
                                }
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredNatures.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <p>No natures found matching your search.</p>
                </div>
            )}
        </div>
    );
};
