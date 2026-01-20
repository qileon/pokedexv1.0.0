

import React, { useState, useEffect, useMemo } from 'react';
import { MoveListEntry, MoveDetails, PokemonData } from '../types';
import { Card, CardHeader, Badge, Loader, Button, DamageClassIcon } from './UI';
import { capitalize, TYPE_COLORS, VERSION_GROUPS, VERSION_GROUP_TO_GEN, fetchPokemonMoves, fetchMoveDetails } from '../utils';

interface MoveListProps {
  moves: MoveListEntry[];
  onSelectMove: (name: string) => void;
  isLoading: boolean;
}

// Helper to fetch details for sorting
const fetchBatchDetails = async (names: string[]) => {
    const results = await Promise.all(names.map(name => fetchMoveDetails(name).catch(() => null)));
    const map: Record<string, MoveDetails> = {};
    results.forEach(r => { if(r) map[r.name] = r; });
    return map;
};

export const MoveListPage: React.FC<MoveListProps> = ({ moves, onSelectMove, isLoading }) => {
  const [filter, setFilter] = useState('');
  const [displayLimit, setDisplayLimit] = useState(100);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'type' | 'power' | 'accuracy'>('id');
  const [selectedVersion, setSelectedVersion] = useState('scarlet-violet');
  
  // Cache for move details to enable sorting
  const [moveDetailsCache, setMoveDetailsCache] = useState<Record<string, MoveDetails>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const getId = (url: string) => {
      if (!url) return 0;
      const parts = url.split('/');
      return parseInt(parts[parts.length - 2]) || 0;
  };

  // Generation filter logic based on ID ranges
  const filterByGeneration = (id: number) => {
      const gen = VERSION_GROUP_TO_GEN[selectedVersion] || 9;
      // Approximate ranges
      if (gen === 1) return id <= 165;
      if (gen === 2) return id <= 251;
      if (gen === 3) return id <= 354;
      if (gen === 4) return id <= 467;
      if (gen === 5) return id <= 559;
      if (gen === 6) return id <= 621;
      if (gen === 7) return id <= 742;
      if (gen === 8) return id <= 826;
      return true;
  };

  const filteredMoves = useMemo(() => {
      const term = filter.toLowerCase();
      return moves.filter(m => {
          const id = getId(m.url);
          const nameMatch = m.name.includes(term) || String(id) === term;
          const genMatch = filterByGeneration(id);
          return nameMatch && genMatch;
      });
  }, [moves, filter, selectedVersion]);

  // Handle Sort Logic
  const sortedMoves = useMemo(() => {
      const list = [...filteredMoves];
      if (sortBy === 'name') {
          return list.sort((a, b) => a.name.localeCompare(b.name));
      }
      if (sortBy === 'id') {
          return list.sort((a, b) => getId(a.url) - getId(b.url));
      }
      
      // For detailed sorting, we need cache
      return list.sort((a, b) => {
          const dA = moveDetailsCache[a.name];
          const dB = moveDetailsCache[b.name];
          if (!dA || !dB) return 0; // Keep order if loading

          if (sortBy === 'power') return (dB.power || 0) - (dA.power || 0);
          if (sortBy === 'accuracy') return (dB.accuracy || 0) - (dA.accuracy || 0);
          if (sortBy === 'type') {
              const tA = dA.type?.name || '';
              const tB = dB.type?.name || '';
              return tA.localeCompare(tB);
          }
          return 0;
      });
  }, [filteredMoves, sortBy, moveDetailsCache]);

  // Load details if sorting requires it
  useEffect(() => {
      if (['type', 'power', 'accuracy'].includes(sortBy)) {
          const missing = filteredMoves.filter(m => !moveDetailsCache[m.name]);
          if (missing.length > 0 && !loadingDetails) {
              setLoadingDetails(true);
              // Process in chunks of 50
              const processChunks = async () => {
                  const chunkSize = 50;
                  for (let i = 0; i < missing.length; i += chunkSize) {
                      const chunk = missing.slice(i, i + chunkSize);
                      const details = await fetchBatchDetails(chunk.map(m => m.name));
                      setMoveDetailsCache(prev => ({ ...prev, ...details }));
                      setLoadingProgress(Math.round(((i + chunkSize) / missing.length) * 100));
                  }
                  setLoadingDetails(false);
                  setLoadingProgress(0);
              };
              processChunks();
          }
      }
  }, [sortBy, filteredMoves]); // eslint-disable-line

  const visibleMoves = sortedMoves.slice(0, displayLimit);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setDisplayLimit(prev => Math.min(prev + 50, sortedMoves.length));
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold">Moves Library</h2>
             {loadingDetails && <span className="text-xs text-[var(--accent-color)] animate-pulse">Loading stats... {loadingProgress}%</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="relative">
                 <input 
                   value={filter}
                   onChange={(e) => { setFilter(e.target.value); setDisplayLimit(100); }}
                   placeholder="Search..."
                   className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition text-[var(--text-color)]"
                 />
               </div>
               
               <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value as any)}
                   className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--accent-color)] text-[var(--text-color)]"
               >
                   <option className="bg-[var(--bg-color)] text-[var(--text-color)]" value="name">Sort by Name</option>
                   <option className="bg-[var(--bg-color)] text-[var(--text-color)]" value="id">Sort by ID</option>
                   <option className="bg-[var(--bg-color)] text-[var(--text-color)]" value="type">Sort by Type (Loads Data)</option>
                   <option className="bg-[var(--bg-color)] text-[var(--text-color)]" value="power">Sort by Power (Loads Data)</option>
                   <option className="bg-[var(--bg-color)] text-[var(--text-color)]" value="accuracy">Sort by Accuracy (Loads Data)</option>
               </select>

               <select 
                   value={selectedVersion}
                   onChange={(e) => setSelectedVersion(e.target.value)}
                   className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--accent-color)] text-[var(--text-color)]"
               >
                   {VERSION_GROUPS.map(v => <option key={v.value} value={v.value} className="bg-[var(--bg-color)] text-[var(--text-color)]">{v.label}</option>)}
               </select>
          </div>
      </div>

      {isLoading && moves.length === 0 ? <Loader /> : (
        <Card className="h-[70vh] flex flex-col relative">
            {loadingDetails && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 z-10">
                    <div className="h-full bg-[var(--accent-color)] transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                </div>
            )}
            <div className="p-2 border-b border-white/10 text-xs uppercase opacity-50 flex font-bold bg-white/5 pr-6">
                <div className="w-16 pl-4">ID</div>
                <div className="w-40">Name</div>
                {['type', 'power', 'accuracy'].includes(sortBy) && <div className="flex-grow text-right pr-4">{capitalize(sortBy)}</div>}
            </div>
            <div 
                className="flex-grow overflow-y-auto custom-scrollbar p-2"
                onScroll={handleScroll}
            >
                {visibleMoves.length === 0 ? <p className="text-center opacity-50 py-10">No moves found.</p> : (
                    <div className="grid grid-cols-1 gap-2">
                        {visibleMoves.map(m => {
                            const id = getId(m.url);
                            const details = moveDetailsCache[m.name];
                            const hasType = details && details.type;
                            return (
                                <div 
                                    key={m.name} 
                                    onClick={() => onSelectMove(m.name)}
                                    className="px-4 py-3 bg-white/5 border border-transparent hover:border-[var(--accent-color)] hover:bg-white/10 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-4"
                                >
                                    <span className="text-xs font-mono opacity-50 w-12">#{id}</span>
                                    <span className="font-medium w-40 truncate">{capitalize(m.name)}</span>
                                    {details && (
                                        <div className="flex-grow flex justify-end gap-2 items-center">
                                            {details.damage_class && <DamageClassIcon damageClass={details.damage_class.name} showLabel={false} />}
                                            {sortBy === 'type' && hasType && <Badge color={TYPE_COLORS[details.type.name]}>{capitalize(details.type.name)}</Badge>}
                                            {sortBy === 'power' && <span className="font-mono text-sm">{details.power || '-'}</span>}
                                            {sortBy === 'accuracy' && <span className="font-mono text-sm">{details.accuracy || '-'}%</span>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="p-2 text-center text-xs opacity-40 border-t border-white/10">
                Showing {visibleMoves.length} of {filteredMoves.length} moves
            </div>
        </Card>
      )}
    </div>
  );
};

// --- Move Details Components ---

const PokemonLearnCard: React.FC<{ 
    name: string; 
    url: string; 
    moveName: string;
    version: string;
    onClick: (n: string) => void; 
}> = ({ name, url, moveName, version, onClick }) => {
    const id = url.split('/')[6];
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    
    const [method, setMethod] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        fetchPokemonMoves(name).then(data => {
            if (!mounted) return;
            // Find the move in the pokemon's data. Check if moves exists.
            const moveEntry = data.moves?.find(m => m.move.name === moveName);
            if (moveEntry) {
                // Find version details. Check if version_group_details exists.
                const vDetail = moveEntry.version_group_details?.find(d => d.version_group?.name === version);
                if (vDetail) {
                    const method = vDetail.move_learn_method?.name;
                    const level = vDetail.level_learned_at;
                    setMethod(`${capitalize(method?.replace('-', ' ') || '')}${level > 0 ? ` (Lvl ${level})` : ''}`);
                } else {
                    setMethod('Not in this version');
                }
            } else {
                setMethod('Unavailable');
            }
        }).catch(() => { if(mounted) setMethod('Error'); });
        return () => { mounted = false; };
    }, [name, moveName, version]);

    return (
        <div 
            className="bg-white/5 hover:bg-white/10 rounded-xl p-3 flex flex-col items-center cursor-pointer transition text-center group relative overflow-hidden"
            onClick={() => onClick(name)}
        >
            <img 
                src={imgUrl} 
                alt={name} 
                className="w-16 h-16 object-contain mb-2 group-hover:scale-110 transition-transform"
                loading="lazy"
            />
            <div className="text-sm font-medium leading-tight">{capitalize(name)}</div>
            <div className="text-[10px] opacity-50 mt-1">#{id}</div>
            
            <div className="mt-2 text-[10px] bg-black/30 px-2 py-1 rounded w-full truncate">
                {method || <div className="w-10 h-2 bg-white/10 rounded animate-pulse mx-auto"></div>}
            </div>
        </div>
    );
};

interface MoveDetailsProps {
    move: MoveDetails | null;
    loading: boolean;
    onBack: () => void;
    onPokemonClick: (name: string) => void;
}

export const MoveDetailsPage: React.FC<MoveDetailsProps> = ({ move, loading, onBack, onPokemonClick }) => {
    const [pokemonLimit, setPokemonLimit] = useState(24);
    const [selectedVersion, setSelectedVersion] = useState('scarlet-violet');

    // Reset limit when move changes
    useEffect(() => {
        setPokemonLimit(24);
    }, [move]);

    if (loading || !move) return <div className="flex justify-center pt-20"><Loader /></div>;

    // Resolve stats based on version. Note: versionStats could be MoveDetails (current) or a partial MovePastValue
    // Use checking to prevent accessing undefined properties
    const versionStats = move.past_values?.find(pv => pv.version_group?.name === selectedVersion) || move;
    
    const displayPower = versionStats.power ?? move.power;
    const displayAccuracy = versionStats.accuracy ?? move.accuracy;
    const displayPP = versionStats.pp ?? move.pp;
    
    // Check type carefully. versionStats.type can be null in MovePastValue
    const displayType = (versionStats.type ? versionStats.type.name : move.type?.name) || 'normal';

    /* Fix: Added safe navigation with optional chaining when accessing flavor_text and effect properties */
    const flavorText = move.flavor_text_entries?.find(e => e.language?.name === 'en' && e.version?.name === selectedVersion)?.flavor_text?.replace(/\n|\f/g, ' ') 
        || move.flavor_text_entries?.find(e => e.language?.name === 'en')?.flavor_text?.replace(/\n|\f/g, ' ') 
        || 'No description available.';

    const effectText = move.effect_entries?.find(e => e.language?.name === 'en')?.effect?.replace(/\$effect_chance%/, String(move.effect_entries?.[0]?.effect || '')) || 'No effect details available.';

    const learnablePokemon = move.learned_by_pokemon || [];
    const visiblePokemon = learnablePokemon.slice(0, pokemonLimit);

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-10">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={onBack} variant="secondary">← Back</Button>
                <select 
                   value={selectedVersion}
                   onChange={(e) => setSelectedVersion(e.target.value)}
                   className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--accent-color)] text-[var(--text-color)]"
                >
                   {VERSION_GROUPS.map(v => <option key={v.value} value={v.value} className="bg-[var(--bg-color)] text-[var(--text-color)]">{v.label}</option>)}
                </select>
            </div>
            
            <Card className="overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-white/5 to-transparent p-8 border-b border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{capitalize(move.name)}</h1>
                            <div className="flex items-center gap-3">
                                <Badge color={TYPE_COLORS[displayType]}>{capitalize(displayType)}</Badge>
                                {move.damage_class && (
                                    <div className="flex items-center gap-1">
                                        <DamageClassIcon damageClass={move.damage_class.name} />
                                    </div>
                                )}
                                <Badge color="#333" className="opacity-60">{capitalize((move.generation?.name || '').replace('-', ' '))}</Badge>
                            </div>
                        </div>
                        <div className="text-right hidden md:block opacity-50 text-sm">
                            ID: #{move.id}
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold border-b border-white/10 pb-2 mb-4">Stats ({VERSION_GROUPS.find(v => v.value === selectedVersion)?.label.split('(')[0].trim() || 'Selected'})</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                <span className="opacity-70">Power</span>
                                <span className="font-bold text-xl">{displayPower || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                <span className="opacity-70">Accuracy</span>
                                <span className="font-bold text-xl">{displayAccuracy ? displayAccuracy + '%' : '—'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                <span className="opacity-70">PP</span>
                                <span className="font-bold text-xl">{displayPP}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                <span className="opacity-70">Priority</span>
                                <span className="font-bold text-xl">{move.priority > 0 ? '+' + move.priority : move.priority}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                <span className="opacity-70">Target</span>
                                <span className="font-medium">{capitalize((move.target?.name || '').replace(/-/g, ' '))}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold border-b border-white/10 pb-2 mb-4">Description</h3>
                        <div className="bg-white/5 p-4 rounded-xl text-lg italic mb-6 leading-relaxed border-l-4 border-[var(--accent-color)]">
                            "{flavorText}"
                        </div>
                        
                        <h3 className="font-bold border-b border-white/10 pb-2 mb-4">Effect Details</h3>
                        <div className="text-sm opacity-80 leading-relaxed bg-black/20 p-4 rounded-xl">
                            {/* Fix: Added safe navigation with optional chaining when accessing flavor_text and effect properties */}
                            {move.effect_entries?.length > 0 ? 
                                move.effect_entries.find(e => e.language?.name === 'en')?.effect?.replace(/\$effect_chance/g, '') || effectText
                                : 'No detailed effect information.'
                            }
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader title={`Learned by Pokémon (${learnablePokemon.length})`} />
                <div className="p-6">
                    {visiblePokemon.length === 0 ? <p className="opacity-50 text-center">No Pokémon learn this move.</p> : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {visiblePokemon.map(p => (
                                <PokemonLearnCard 
                                    key={p.name}
                                    name={p.name}
                                    url={p.url}
                                    moveName={move.name}
                                    version={selectedVersion}
                                    onClick={onPokemonClick}
                                />
                            ))}
                        </div>
                    )}
                    {visiblePokemon.length < learnablePokemon.length && (
                        <div className="mt-6 text-center">
                            <Button variant="outline" onClick={() => setPokemonLimit(prev => prev + 24)}>Load More</Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};