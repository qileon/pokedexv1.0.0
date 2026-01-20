
import React, { useState, useRef, useEffect } from 'react';
import { PokemonData, PokemonListEntry } from '../types';
import { Card, Badge, Button, Loader } from './UI';
import { capitalize, fetchPokemonData, TYPE_COLORS, STAT_NAMES } from '../utils';

interface CompareProps {
  pokemonList: PokemonListEntry[];
  onExit: () => void;
}

interface PokemonSlotProps {
    data: PokemonData | null;
    loading: boolean;
    slot: 1 | 2;
    pokemonList: PokemonListEntry[];
    onSelect: (term: string) => void;
}

const PokemonSlot: React.FC<PokemonSlotProps> = ({ data, loading, slot, pokemonList, onSelect }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<PokemonListEntry[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        if (val.length > 0) {
            const lower = val.toLowerCase();
            const matches = pokemonList.filter(p => p.name.startsWith(lower) || p.name.includes(lower)).slice(0, 8);
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelect = (name: string) => {
        setInputValue(capitalize(name));
        setShowSuggestions(false);
        onSelect(name);
    };

    return (
      <div className="flex flex-col gap-4 relative" ref={wrapperRef}>
          <div className="relative z-10">
              <input 
                 value={inputValue}
                 onChange={handleInput}
                 onFocus={() => { if (inputValue.length > 0) setShowSuggestions(true); }}
                 placeholder={`Search Pokémon ${slot}...`}
                 className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition text-[var(--text-color)]"
                 onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                         setShowSuggestions(false);
                         onSelect(inputValue);
                     }
                 }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card-bg-color)] border border-[var(--border-color)] rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl z-50 custom-scrollbar">
                  {suggestions.map(p => (
                    <div 
                      key={p.name} 
                      className="px-4 py-2 hover:bg-white/10 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0"
                      onClick={() => handleSelect(p.name)}
                    >
                      <span>{capitalize(p.name)}</span>
                      <span className="text-xs opacity-50">#{String(p.id).padStart(4, '0')}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
          
          <div className="flex-grow min-h-[300px] bg-[var(--card-bg-color)] rounded-2xl border border-white/10 flex flex-col items-center justify-center p-6 relative z-0">
               {loading ? <Loader /> : data ? (
                   <div className="animate-fade-in text-center">
                       <img 
                          src={data.sprites.other['official-artwork'].front_default} 
                          className="w-40 h-40 object-contain mx-auto mb-4 drop-shadow-lg" 
                          alt={data.name}
                       />
                       <h2 className="text-2xl font-bold mb-2">{capitalize(data.name)}</h2>
                       <div className="flex gap-2 justify-center">
                           {data.types.map(t => <Badge key={t.type.name} color={TYPE_COLORS[t.type.name]}>{capitalize(t.type.name)}</Badge>)}
                       </div>
                   </div>
               ) : (
                   <div className="text-6xl font-bold opacity-10 border-4 border-dashed border-white/20 rounded-full w-32 h-32 flex items-center justify-center select-none">?</div>
               )}
          </div>
      </div>
    );
};

export const ComparisonView: React.FC<CompareProps> = ({ pokemonList, onExit }) => {
  const [p1, setP1] = useState<PokemonData | null>(null);
  const [p2, setP2] = useState<PokemonData | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleSearch = async (term: string, slot: 1 | 2) => {
     const setLoading = slot === 1 ? setLoading1 : setLoading2;
     const setP = slot === 1 ? setP1 : setP2;
     setLoading(true);
     try {
         const { pokemonData } = await fetchPokemonData(term, pokemonList);
         setP(pokemonData);
     } catch (e) {
         console.error(e);
     } finally {
         setLoading(false);
     }
  };

  return (
      <div className="animate-fade-in max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <PokemonSlot data={p1} loading={loading1} slot={1} pokemonList={pokemonList} onSelect={(term) => handleSearch(term, 1)} />
              <PokemonSlot data={p2} loading={loading2} slot={2} pokemonList={pokemonList} onSelect={(term) => handleSearch(term, 2)} />
          </div>

          {(p1 || p2) && (
              <Card className="p-6 mb-8">
                  <h3 className="text-xl font-bold text-center mb-6 border-b border-white/10 pb-4">Stat Comparison</h3>
                  <div className="space-y-4">
                      {Object.keys(STAT_NAMES).map(key => {
                          const s1 = p1?.stats.find(s => s.stat.name === key)?.base_stat || 0;
                          const s2 = p2?.stats.find(s => s.stat.name === key)?.base_stat || 0;
                          const max = 255;
                          const w1 = (s1 / max) * 100;
                          const w2 = (s2 / max) * 100;
                          
                          return (
                              <div key={key} className="grid grid-cols-[40px_1fr_100px_1fr_40px] gap-4 items-center text-sm">
                                  <span className={`font-bold text-center ${s1 > s2 && s2 > 0 ? 'text-green-400 scale-110' : ''}`}>{s1 || '-'}</span>
                                  <div className="h-3 bg-gray-700/30 rounded-full overflow-hidden flex justify-end transform rotate-180">
                                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${w1}%` }}></div>
                                  </div>
                                  <div className="text-center font-medium opacity-60 text-xs uppercase">{STAT_NAMES[key]}</div>
                                  <div className="h-3 bg-gray-700/30 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${w2}%` }}></div>
                                  </div>
                                  <span className={`font-bold text-center ${s2 > s1 && s1 > 0 ? 'text-green-400 scale-110' : ''}`}>{s2 || '-'}</span>
                              </div>
                          );
                      })}
                  </div>
              </Card>
          )}
          
          <Button onClick={onExit} variant="danger" className="w-full">Exit Compare Mode</Button>
      </div>
  );
};
