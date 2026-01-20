
import React, { useState, useEffect } from 'react';
import { AbilityDetails } from '../types';
import { Card, CardHeader, Badge, Loader, Button } from './UI';
import { capitalize, fetchAbilityDetails } from '../utils';

interface AbilityPokemonCardProps {
    name: string;
    url: string;
    isHidden: boolean;
    onClick: (name: string) => void;
}

const AbilityPokemonCard: React.FC<AbilityPokemonCardProps> = ({ name, url, isHidden, onClick }) => {
    const id = url.split('/')[6];
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

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
            {isHidden && (
                <span className="mt-2 text-[8px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded uppercase font-black">Hidden</span>
            )}
        </div>
    );
};

interface AbilityDetailsProps {
    ability: AbilityDetails | null;
    loading: boolean;
    onBack: () => void;
    onPokemonClick: (name: string) => void;
}

export const AbilityDetailsPage: React.FC<AbilityDetailsProps> = ({ ability, loading, onBack, onPokemonClick }) => {
    const [pokemonLimit, setPokemonLimit] = useState(24);

    if (loading || !ability) return <div className="flex justify-center pt-20"><Loader /></div>;

    const flavorText = ability.flavor_text_entries?.find(e => e.language?.name === 'en')?.flavor_text.replace(/\n|\f/g, ' ') 
        || 'No description available.';

    const effectText = ability.effect_entries?.find(e => e.language?.name === 'en')?.effect || 'No detailed effect information.';

    const learnablePokemon = ability.pokemon || [];
    const visiblePokemon = learnablePokemon.slice(0, pokemonLimit);

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-10">
            <div className="mb-6">
                <Button onClick={onBack} variant="secondary">← Back</Button>
            </div>
            
            <Card className="overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-white/5 to-transparent p-8 border-b border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{capitalize(ability.name)}</h1>
                            <div className="flex items-center gap-2">
                                <Badge color="#333" className="opacity-60">{capitalize((ability.generation?.name || '').replace('-', ' '))}</Badge>
                            </div>
                        </div>
                        <div className="text-right hidden md:block opacity-50 text-sm">
                            ID: #{ability.id}
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold border-b border-white/10 pb-2 mb-4">Description</h3>
                        <div className="bg-white/5 p-4 rounded-xl text-lg italic mb-6 leading-relaxed border-l-4 border-[var(--accent-color)]">
                            "{flavorText}"
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold border-b border-white/10 pb-2 mb-4">Detailed Effect</h3>
                        <div className="text-sm opacity-80 leading-relaxed bg-black/20 p-4 rounded-xl">
                            {effectText}
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader title={`Pokémon with this Ability (${learnablePokemon.length})`} />
                <div className="p-6">
                    {visiblePokemon.length === 0 ? <p className="opacity-50 text-center">No Pokémon have this ability.</p> : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {visiblePokemon.map(p => (
                                <AbilityPokemonCard 
                                    key={p.pokemon.name}
                                    name={p.pokemon.name}
                                    url={p.pokemon.url}
                                    isHidden={p.is_hidden}
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
