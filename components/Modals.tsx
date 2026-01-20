import React, { useEffect, useState } from 'react';
import { Button, Loader, Badge } from './UI';
import { PokemonListEntry, Theme } from '../types';
import { capitalize, TYPE_COLORS, GENERATIONS } from '../utils';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const ModalOverlay: React.FC<ModalProps> = ({ onClose, children, title }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-[var(--bg-color)] border border-[var(--border-color)] w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-color)]">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button onClick={onClose} className="text-3xl opacity-50 hover:opacity-100 transition">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);

// Favorites Modal
export const FavoritesModal: React.FC<{ favorites: string[], onClose: () => void, onSelect: (n: string) => void }> = ({ favorites, onClose, onSelect }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (favorites.length === 0) { setLoading(false); return; }
        Promise.all(favorites.map(name => fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(r => r.ok ? r.json() : null)))
            .then(results => {
                setData(results.filter(Boolean));
                setLoading(false);
            });
    }, [favorites]);

    return (
        <ModalOverlay title="Favorite Pokémon" onClose={onClose}>
            {loading ? <Loader /> : data.length === 0 ? <p className="text-center opacity-50">No favorites yet.</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {data.map(p => (
                        <div 
                           key={p.name} 
                           className="bg-white/5 p-4 rounded-xl hover:bg-white/10 cursor-pointer transition text-center group"
                           onClick={() => { onSelect(p.name); onClose(); }}
                        >
                            <img 
                                src={p.sprites.other['official-artwork'].front_default} 
                                alt={p.name} 
                                className="w-20 h-20 object-contain mx-auto mb-2 group-hover:scale-110 transition-transform"
                            />
                            <div className="font-bold text-sm">{capitalize(p.name)}</div>
                            <div className="text-xs opacity-50">#{String(p.id).padStart(4, '0')}</div>
                        </div>
                    ))}
                </div>
            )}
        </ModalOverlay>
    );
};

// Filter Modal
interface FilterProps {
    onClose: () => void;
    onApply: (types: string[], gen: string | null, isLegendary: boolean) => void;
}
export const FilterModal: React.FC<FilterProps> = ({ onClose, onApply }) => {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedGen, setSelectedGen] = useState<string | null>(null);
    const [onlyLegendary, setOnlyLegendary] = useState(false);

    const toggleType = (t: string) => {
        if (selectedTypes.includes(t)) setSelectedTypes(prev => prev.filter(x => x !== t));
        else if (selectedTypes.length < 2) setSelectedTypes(prev => [...prev, t]);
    };

    return (
        <ModalOverlay title="Filter & Sort" onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold border-b border-white/10 pb-2 mb-3">By Type (Max 2)</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(TYPE_COLORS).map(t => (
                            <button
                                key={t}
                                onClick={() => toggleType(t)}
                                className={`px-3 py-1 rounded-full text-sm transition border ${selectedTypes.includes(t) ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white font-bold' : 'bg-transparent border-white/20 hover:bg-white/10'}`}
                            >
                                {capitalize(t)}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold border-b border-white/10 pb-2 mb-3">By Generation</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(GENERATIONS).map(([num, name]) => (
                            <button
                                key={num}
                                onClick={() => setSelectedGen(selectedGen === num ? null : num)}
                                className={`px-3 py-1 rounded-lg text-sm transition border ${selectedGen === num ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white font-bold' : 'bg-transparent border-white/20 hover:bg-white/10'}`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold border-b border-white/10 pb-2 mb-3">Special Filters</h4>
                    <button
                        onClick={() => setOnlyLegendary(!onlyLegendary)}
                        className={`w-full py-2 rounded-lg text-sm transition border ${onlyLegendary ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200' : 'bg-transparent border-white/20 hover:bg-white/10'}`}
                    >
                        {onlyLegendary ? 'Showing Legendary & Mythical Only' : 'Show Legendary & Mythical Only'}
                    </button>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button variant="secondary" onClick={() => { setSelectedGen(null); setSelectedTypes([]); setOnlyLegendary(false); }}>Clear</Button>
                    <Button onClick={() => { onApply(selectedTypes, selectedGen, onlyLegendary); onClose(); }}>Apply Filters</Button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// Theme Modal
export const ThemeModal: React.FC<{ onClose: () => void, onSetTheme: (t: Theme) => void }> = ({ onClose, onSetTheme }) => (
    <ModalOverlay title="Select Theme" onClose={onClose}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
                { id: 'dark', name: 'Dark', bg: '#1a1c20', accent: '#ff3333' },
                { id: 'light', name: 'Light', bg: '#f8f9fa', accent: '#007bff' },
                { id: 'fire', name: 'Fire', bg: '#2c1a1a', accent: '#ff7b00' }
            ].map((t: any) => (
                <div 
                    key={t.id} 
                    onClick={() => { onSetTheme(t.id); onClose(); }}
                    className="border border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-[var(--accent-color)] transition hover:-translate-y-1"
                >
                    <div className="flex justify-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full border-2 border-gray-400" style={{ backgroundColor: t.bg }}></div>
                        <div className="w-8 h-8 rounded-full border-2 border-gray-400" style={{ backgroundColor: t.accent }}></div>
                    </div>
                    <h4 className="font-bold text-lg">{t.name}</h4>
                </div>
            ))}
        </div>
    </ModalOverlay>
);