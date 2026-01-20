
import React, { useEffect, useState, useMemo } from 'react';
import { PokemonData, SpeciesData, EvolutionChainNode, MoveDetails } from '../types';
import { Card, CardHeader, Badge, Loader, DamageClassIcon } from './UI';
import { STAT_COLORS, STAT_NAMES, capitalize, calculateTypeEffectiveness, getRecommendedEVs, getRecommendedIVs, TYPE_COLORS, VERSION_GROUPS, NATURES, getRecommendedNature } from '../utils';

interface PanelProps {
  pokemon: PokemonData;
  species: SpeciesData;
  onSearch: (name: string) => void;
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP", attack: "Atk", defense: "Def",
  "special-attack": "SpA", "special-defense": "SpD", speed: "Spd"
};

const StatRow: React.FC<{ label: string, value: number, color: string, max?: number }> = ({ label, value, color, max = 255 }) => (
  <div className="grid grid-cols-[70px_1fr_40px] gap-4 items-center mb-3 text-sm">
    <span className="text-right font-medium opacity-70">{label}</span>
    <div className="h-3 bg-gray-700/20 rounded-full overflow-hidden shadow-inner">
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
    <span className="font-bold text-right">{value}</span>
  </div>
);

export const StatsPanel: React.FC<{ stats: PokemonData['stats'] }> = ({ stats }) => (
  <Card delay={0.2}>
    <CardHeader title="Base Stats" />
    <div className="p-5">
      {stats.map(s => (
        <StatRow 
          key={s.stat.name} 
          label={STAT_NAMES[s.stat.name]} 
          value={s.base_stat} 
          color={STAT_COLORS[s.stat.name]} 
        />
      ))}
    </div>
  </Card>
);

export const EffectivenessPanel: React.FC<{ types: string[] }> = ({ types }) => {
  const effectiveness = calculateTypeEffectiveness(types);
  const groups: Record<string, string[]> = { '4x': [], '2x': [], '0.5x': [], '0.25x': [], '0x': [] };

  Object.entries(effectiveness).forEach(([type, mult]) => {
    if (mult === 4) groups['4x'].push(type);
    else if (mult === 2) groups['2x'].push(type);
    else if (mult === 0.5) groups['0.5x'].push(type);
    else if (mult === 0.25) groups['0.25x'].push(type);
    else if (mult === 0) groups['0x'].push(type);
  });

  if (Object.values(groups).every(g => g.length === 0)) return null;

  return (
    <Card delay={0}>
      <CardHeader title="Type Effectiveness" />
      <div className="p-5 space-y-4">
        {groups['4x'].length > 0 && <div><div className="text-sm font-bold opacity-60 mb-2">Weak to (4×)</div><div className="flex flex-wrap gap-2">{groups['4x'].map(t => <Badge key={t} color={TYPE_COLORS[t]}>{capitalize(t)}</Badge>)}</div></div>}
        {groups['2x'].length > 0 && <div><div className="text-sm font-bold opacity-60 mb-2">Weak to (2×)</div><div className="flex flex-wrap gap-2">{groups['2x'].map(t => <Badge key={t} color={TYPE_COLORS[t]}>{capitalize(t)}</Badge>)}</div></div>}
        {groups['0.5x'].length > 0 && <div><div className="text-sm font-bold opacity-60 mb-2">Resists (½×)</div><div className="flex flex-wrap gap-2">{groups['0.5x'].map(t => <Badge key={t} color={TYPE_COLORS[t]}>{capitalize(t)}</Badge>)}</div></div>}
        {groups['0.25x'].length > 0 && <div><div className="text-sm font-bold opacity-60 mb-2">Resists (¼×)</div><div className="flex flex-wrap gap-2">{groups['0.25x'].map(t => <Badge key={t} color={TYPE_COLORS[t]}>{capitalize(t)}</Badge>)}</div></div>}
        {groups['0x'].length > 0 && <div><div className="text-sm font-bold opacity-60 mb-2">Immune to (0×)</div><div className="flex flex-wrap gap-2">{groups['0x'].map(t => <Badge key={t} color={TYPE_COLORS[t]}>{capitalize(t)}</Badge>)}</div></div>}
      </div>
    </Card>
  );
};

export const EvolutionPanel: React.FC<{ url: string, onSearch: (n: string) => void }> = ({ url, onSearch }) => {
  const [chain, setChain] = useState<EvolutionChainNode | null>(null);

  useEffect(() => {
    fetch(url).then(res => res.json()).then(data => setChain(data.chain)).catch(console.error);
  }, [url]);

  const formatEvolution = (details: any[]) => {
    if (!details || details.length === 0) return null;
    const d = details[0]; // Usually first entry is the main trigger
    const parts: string[] = [];

    switch (d.trigger?.name) {
      case 'level-up':
        if (d.min_level) parts.push(`Lvl ${d.min_level}`);
        if (d.min_happiness) parts.push('Friendship');
        if (d.min_affection) parts.push('Affection');
        if (d.min_beauty) parts.push('Beauty');
        if (d.known_move) parts.push(`Know ${capitalize(d.known_move.name)}`);
        if (d.known_move_type) parts.push(`${capitalize(d.known_move_type.name)} Move`);
        if (d.location) parts.push(`at ${capitalize(d.location.name)}`);
        if (d.time_of_day) parts.push(capitalize(d.time_of_day));
        if (d.held_item) parts.push(`Hold ${capitalize(d.held_item.name)}`);
        if (d.needs_overworld_rain) parts.push('Rain');
        if (d.turn_upside_down) parts.push('Upside Down');
        if (d.party_species) parts.push(`With ${capitalize(d.party_species.name)}`);
        if (d.party_type) parts.push(`With ${capitalize(d.party_type.name)} Type`);
        if (parts.length === 0) parts.push('Level Up');
        break;
      case 'use-item':
        parts.push(`Use ${capitalize(d.item.name)}`);
        break;
      case 'trade':
        parts.push('Trade');
        if (d.held_item) parts.push(`Hold ${capitalize(d.held_item.name)}`);
        if (d.trade_species) parts.push(`for ${capitalize(d.trade_species.name)}`);
        break;
      case 'shed':
        parts.push('Shed (Empty slot)');
        break;
      case 'spin':
        parts.push('Spin');
        break;
      case 'tower-of-darkness':
        parts.push('Tower of Darkness');
        break;
      case 'tower-of-waters':
        parts.push('Tower of Waters');
        break;
      case 'three-critical-hits':
        parts.push('3 Crits in 1 Battle');
        break;
      case 'take-damage':
        parts.push('Take Damage');
        break;
      default:
        parts.push(capitalize(d.trigger?.name || 'Special'));
    }

    return parts.join(' + ');
  };

  const renderNode = (node: EvolutionChainNode, details: any[] = []) => {
      const id = node.species.url.split('/')[6];
      const name = node.species.name;
      const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      const requirement = formatEvolution(details);

      return (
          <div className="flex flex-col items-center" key={name}>
             {requirement && (
                 <div className="flex flex-col items-center py-2 animate-fade-in">
                    <div className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-[9px] font-black uppercase text-[var(--accent-color)] mb-1 shadow-sm">
                        {requirement}
                    </div>
                    <div className="text-gray-500 opacity-40 text-xs">▼</div>
                 </div>
             )}

             <div 
                className="group flex flex-col items-center cursor-pointer p-2 rounded-xl hover:bg-white/5 transition"
                onClick={() => onSearch(name)}
             >
                <img src={img} alt={name} className="w-20 h-20 object-contain group-hover:-translate-y-1 transition-transform" />
                <span className="font-medium text-sm mt-1">{capitalize(name)}</span>
             </div>

             {node.evolves_to.length > 0 && (
                 <div className="flex flex-wrap justify-center gap-x-12 items-start mt-2">
                     {node.evolves_to.map(child => renderNode(child, child.evolution_details))}
                 </div>
             )}
          </div>
      );
  }

  return (
    <Card delay={0.1}>
      <CardHeader title="Evolution Chain" />
      <div className="p-5 flex justify-center overflow-x-auto custom-scrollbar">
          {chain ? renderNode(chain) : <Loader />}
      </div>
    </Card>
  );
};

export const BreedingPanel: React.FC<{ species: SpeciesData }> = ({ species }) => {
  const genderRate = species.gender_rate;
  const femaleChance = genderRate === -1 ? 0 : (genderRate / 8) * 100;
  const maleChance = 100 - femaleChance;

  return (
    <Card delay={0.15}>
      <CardHeader title="Breeding Info" />
      <div className="p-5 space-y-4">
          <div>
              <div className="font-medium opacity-70 mb-2 text-sm">Gender Ratio</div>
              {genderRate === -1 ? <p>Genderless</p> : (
                  <>
                    <div className="h-3 flex rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full" style={{ width: `${maleChance}%` }}></div>
                        <div className="bg-pink-400 h-full" style={{ width: `${femaleChance}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1 font-mono">
                        <span>♂ {maleChance}%</span>
                        <span>♀ {femaleChance}%</span>
                    </div>
                  </>
              )}
          </div>
          <div>
              <div className="font-medium opacity-70 mb-2 text-sm">Egg Groups</div>
              <div className="flex flex-wrap gap-2">
                  {species.egg_groups.map(g => <span key={g.name} className="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/10">{capitalize(g.name)}</span>)}
              </div>
          </div>
      </div>
    </Card>
  );
};

export const NaturePanel: React.FC<{ stats: PokemonData['stats'] }> = ({ stats }) => {
    const recommendedName = getRecommendedNature(stats);
    const nature = NATURES.find(n => n.name === recommendedName);
    
    if (!nature) return null;

    const explanation = nature.increased 
        ? `This nature is ideal because it boosts ${STAT_NAMES[nature.increased]} (+10%) while reducing the less critical ${STAT_NAMES[nature.decreased || '']} (-10%), optimizing this Pokémon's natural base stat distribution for competitive play.`
        : "A neutral nature is recommended to maintain balanced growth across all stats without sacrificing defensive or offensive capabilities.";

    return (
        <Card delay={0.35}>
            <CardHeader title="Best Nature" />
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <Badge color="var(--accent-color)">{capitalize(nature.name)}</Badge>
                    <div className="flex gap-4 text-xs font-bold">
                        {nature.increased && <span className="text-green-400">↑ {STAT_NAMES[nature.increased]}</span>}
                        {nature.decreased && <span className="text-red-400">↓ {STAT_NAMES[nature.decreased]}</span>}
                        {!nature.increased && <span className="opacity-50">Neutral Effect</span>}
                    </div>
                </div>
                <div className="text-sm bg-black/10 p-4 rounded-xl italic leading-relaxed opacity-80 border-l-2 border-[var(--accent-color)]">
                    "{explanation}"
                </div>
            </div>
        </Card>
    );
};

export const AbilitiesPanel: React.FC<{ abilities: PokemonData['abilities'], onAbilityClick: (name: string) => void }> = ({ abilities, onAbilityClick }) => (
    <Card delay={0.12}>
        <CardHeader title="Abilities" />
        <div className="p-5 flex flex-wrap gap-3">
            {abilities.map(a => (
                <div 
                    key={a.ability.name}
                    onClick={() => onAbilityClick(a.ability.name)}
                    className={`px-4 py-2 rounded-xl border cursor-pointer transition flex items-center gap-2 group ${a.is_hidden ? 'bg-black/20 border-white/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                >
                    <span className="font-bold group-hover:text-[var(--accent-color)] transition-colors">{capitalize(a.ability.name)}</span>
                    {a.is_hidden && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 uppercase font-black">Hidden</span>}
                </div>
            ))}
        </div>
    </Card>
);

export const TrainingPanel: React.FC<{ stats: PokemonData['stats'] }> = ({ stats }) => {
  const evs = getRecommendedEVs(stats);
  const ivs = getRecommendedIVs(stats);

  return (
    <Card delay={0.3}>
      <CardHeader title="Competitive Training" />
      <div className="p-5 text-sm">
          <div className="mb-4">
              <h4 className="font-bold border-b border-white/10 pb-2 mb-3">Ideal IVs</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {Object.entries(ivs).map(([stat, val]) => (
                      <div key={stat} className="flex justify-between">
                          <span className="opacity-70">{STAT_NAMES[stat]}</span>
                          <span className={`font-bold ${val === 31 ? 'text-yellow-400' : val === 0 ? 'text-gray-500' : ''}`}>{val}</span>
                      </div>
                  ))}
              </div>
          </div>
          <div>
              <h4 className="font-bold border-b border-white/10 pb-2 mb-3">EV Spread Recommendation</h4>
              {Object.entries(evs).filter(([_, val]) => val > 0).map(([stat, val]) => (
                   <div key={stat} className="grid grid-cols-[80px_1fr_40px] gap-3 items-center mb-2">
                      <span className="opacity-70 text-right">{STAT_NAMES[stat]}</span>
                      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                           <div className="h-full bg-[var(--accent-color)]" style={{ width: `${(val / 252) * 100}%` }}></div>
                      </div>
                      <span className="font-bold text-right">{val}</span>
                   </div>
              ))}
          </div>
          <p className="mt-4 text-xs opacity-50 text-center bg-black/10 p-2 rounded">General recommendations only. Strategies vary.</p>
      </div>
    </Card>
  );
};

const VERSION_PRIORITY = [
  'scarlet-violet',
  'the-teal-mask',
  'the-indigo-disk',
  'sword-shield',
  'the-isle-of-armor',
  'the-crown-tundra',
  'legends-arceus',
  'brilliant-diamond-and-shining-pearl',
  'ultra-sun-ultra-moon',
  'sun-moon',
  'omega-ruby-alpha-sapphire',
  'x-y',
  'black-2-white-2',
  'black-white',
  'heartgold-soulsilver',
  'platinum',
  'diamond-pearl',
  'firered-leafgreen',
  'emerald',
  'ruby-sapphire',
  'crystal',
  'gold-silver',
  'yellow',
  'red-blue'
];

export const MovesetPanel: React.FC<{ moves: PokemonData['moves'], onMoveClick: (move: string) => void }> = ({ moves, onMoveClick }) => {
    const [activeTab, setActiveTab] = useState<'level-up' | 'machine' | 'egg'>('level-up');
    const [moveDetails, setMoveDetails] = useState<Record<string, MoveDetails>>({});
    const [loading, setLoading] = useState(false);
    const [manualVersion, setManualVersion] = useState<string | null>(null);
    
    // Determine available versions for this Pokemon
    const availableVersions = useMemo(() => {
        const sets = new Set<string>();
        // Check optional chaining for safety
        moves.forEach(m => m.version_group_details?.forEach(d => {
            if (d.version_group?.name) sets.add(d.version_group.name);
        }));
        return VERSION_GROUPS.filter(g => sets.has(g.value));
    }, [moves]);

    // Automatically find the latest version group that this Pokemon has moves for, or use manual selection
    const targetVersion = useMemo(() => {
        if (manualVersion && availableVersions.some(v => v.value === manualVersion)) {
            return manualVersion;
        }
        
        // Find the highest priority version that exists in the Pokemon's data
        return VERSION_PRIORITY.find(v => availableVersions.some(av => av.value === v)) || 'scarlet-violet';
    }, [moves, manualVersion, availableVersions]);

    // Recommended Best Moveset Logic
    // Derived from the 4 highest level-up moves available in this version
    const recommendedMoves = useMemo(() => {
        const levelMoves = moves.filter(m => 
            m.version_group_details?.some(d => d.version_group?.name === targetVersion && d.move_learn_method?.name === 'level-up')
        );
        
        // Sort by level learned descending
        return levelMoves.sort((a, b) => {
            const lvlA = a.version_group_details?.find(d => d.version_group?.name === targetVersion)?.level_learned_at || 0;
            const lvlB = b.version_group_details?.find(d => d.version_group?.name === targetVersion)?.level_learned_at || 0;
            return lvlB - lvlA;
        }).slice(0, 4);
    }, [moves, targetVersion]);

    const filteredMoves = moves.filter(m => m.version_group_details?.some(d => d.version_group?.name === targetVersion && d.move_learn_method?.name === activeTab));

    // Fetch details for both the list AND the recommended moves
    useEffect(() => {
        const movesToFetch = [...filteredMoves, ...recommendedMoves];
        if (movesToFetch.length === 0) return;
        
        const missing = movesToFetch.filter(m => !moveDetails[m.move.name]);
        if (missing.length === 0) return;

        setLoading(true);
        // Prioritize recommended moves + top 20 list moves
        const uniqueNames = Array.from(new Set(missing.map(m => m.move.name)));
        
        Promise.all(uniqueNames.slice(0, 24).map(name => fetch(`https://pokeapi.co/api/v2/move/${name}`).then(r => r.json()))) 
            .then(data => {
                setMoveDetails(prev => {
                    const next = { ...prev };
                    data.forEach((d: MoveDetails) => { if (d) next[d.name] = d; });
                    return next;
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [activeTab, filteredMoves, targetVersion, recommendedMoves]); // eslint-disable-line

    const sortedMoves = filteredMoves.sort((a, b) => {
        if (activeTab === 'level-up') {
             const lvlA = a.version_group_details?.find(d => d.version_group?.name === targetVersion)?.level_learned_at || 0;
             const lvlB = b.version_group_details?.find(d => d.version_group?.name === targetVersion)?.level_learned_at || 0;
             return lvlA - lvlB;
        }
        return a.move.name.localeCompare(b.move.name);
    });

    return (
        <Card delay={0.4}>
            <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-3 border-b border-[var(--border-color)] bg-white/5 gap-3">
                <h3 className="font-semibold text-lg">Moveset</h3>
                <select 
                    value={targetVersion} 
                    onChange={(e) => setManualVersion(e.target.value)}
                    className="bg-black/20 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-[var(--accent-color)] text-[var(--text-color)] w-full sm:w-auto"
                >
                    {availableVersions.map(v => (
                        <option key={v.value} value={v.value} className="bg-[var(--bg-color)]">
                            {v.label}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="p-4">
                {/* Recommended Moves Section */}
                {recommendedMoves.length > 0 && (
                    <div className="mb-6">
                        <div className="text-xs font-bold opacity-60 uppercase mb-3 flex items-center gap-2">
                             <span className="text-yellow-400">★</span> Recommended Endgame Moves
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {recommendedMoves.map(m => {
                                const details = moveDetails[m.move.name];
                                const hasType = details && details.type;
                                return (
                                    <div 
                                        key={m.move.name}
                                        onClick={() => onMoveClick(m.move.name)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-2 flex items-center justify-between cursor-pointer transition group"
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm truncate group-hover:text-[var(--accent-color)] transition-colors">{capitalize(m.move.name)}</span>
                                            <span className="text-xs opacity-50">{details ? `${details.power || 'Status'} Pwr` : '...'}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {hasType && <Badge color={TYPE_COLORS[details.type.name]}>{capitalize(details.type.name).substring(0,3)}</Badge>}
                                            {details?.damage_class && <DamageClassIcon damageClass={details.damage_class.name} showLabel={false} />}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {['level-up', 'machine', 'egg'].map(method => (
                        <button
                            key={method}
                            onClick={() => setActiveTab(method as any)}
                            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition ${activeTab === method ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            {method === 'level-up' ? 'Level Up' : method === 'machine' ? 'TM' : 'Egg'}
                        </button>
                    ))}
                </div>

                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {sortedMoves.length === 0 ? <p className="text-center opacity-50 py-4">No moves found for this category in this version.</p> : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs uppercase opacity-50 sticky top-0 bg-[var(--card-bg-color)] backdrop-blur z-10">
                                <tr>
                                    <th className="py-2 pl-2 w-10">{activeTab === 'level-up' ? 'Lvl' : 'TM'}</th>
                                    <th className="py-2">Name</th>
                                    <th className="py-2">Type</th>
                                    <th className="py-2 text-center">Cat</th>
                                    <th className="py-2 text-center">Pwr</th>
                                    <th className="py-2 text-center">Acc</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMoves.map(m => {
                                    const details = moveDetails[m.move.name];
                                    const learnData = m.version_group_details?.find(d => d.version_group?.name === targetVersion);
                                    const level = learnData?.level_learned_at;
                                    const hasType = details && details.type;

                                    if (!details && loading) return null; // Or skeleton

                                    return (
                                        <tr 
                                            key={m.move.name} 
                                            className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                            onClick={() => onMoveClick(m.move.name)}
                                        >
                                            <td className="py-2 pl-2 font-bold opacity-70">{level === 0 || level === undefined ? '—' : level}</td>
                                            <td className="py-2 font-medium">{capitalize(m.move.name)}</td>
                                            <td className="py-2">{hasType && <Badge color={TYPE_COLORS[details.type.name]}>{capitalize(details.type.name)}</Badge>}</td>
                                            <td className="py-2 flex justify-center">{details?.damage_class && <DamageClassIcon damageClass={details.damage_class.name} showLabel={false} />}</td>
                                            <td className="py-2 text-center opacity-80">{details?.power || '—'}</td>
                                            <td className="py-2 text-center opacity-80">{details?.accuracy || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {loading && <div className="mt-4"><Loader /></div>}
                </div>
            </div>
        </Card>
    );
};
