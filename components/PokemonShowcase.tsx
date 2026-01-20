import React from 'react';
import { PokemonData, SpeciesData } from '../types';
import { capitalize, TYPE_COLORS, darkenColor, ULTRA_BEASTS } from '../utils';
import { Badge, Button } from './UI';

interface ShowcaseProps {
  pokemon: PokemonData;
  species: SpeciesData;
  isShiny: boolean;
  isAnimated: boolean;
  isFavorite: boolean;
  onToggleShiny: () => void;
  onToggleAnimated: () => void;
  onToggleFavorite: () => void;
  onFormChange: (name: string) => void;
}

export const PokemonShowcase: React.FC<ShowcaseProps> = ({
  pokemon, species, isShiny, isAnimated, isFavorite,
  onToggleShiny, onToggleAnimated, onToggleFavorite, onFormChange
}) => {
  
  const primaryType = pokemon.types[0].type.name;
  const secondaryType = pokemon.types[1]?.type.name;
  const color1 = TYPE_COLORS[primaryType];
  const color2 = secondaryType ? TYPE_COLORS[secondaryType] : darkenColor(color1, 40);
  
  const spriteUrl = isAnimated 
    ? (isShiny ? pokemon.sprites.versions?.['generation-v']['black-white'].animated.front_shiny : pokemon.sprites.versions?.['generation-v']['black-white'].animated.front_default) || (isShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default)
    : (pokemon.sprites.other['official-artwork'][isShiny ? 'front_shiny' : 'front_default'] || (isShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default));

  // Status Icons
  let statusIcon = null;
  if (species.is_legendary) statusIcon = <span className="text-2xl font-bold animate-pulse text-yellow-400" title="Legendary">L</span>;
  else if (species.is_mythical) statusIcon = <span className="text-2xl font-bold animate-pulse text-pink-400" title="Mythical">M</span>;
  else if (ULTRA_BEASTS.has(species.name)) statusIcon = <span className="text-2xl font-bold animate-pulse text-cyan-400" title="Ultra Beast">U</span>;

  const description = species.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text.replace(/\n|\f/g, ' ') || 'No description available.';

  return (
    <div 
      className="w-full rounded-[20px] p-8 text-center shadow-inner transition-all duration-500 flex flex-col items-center animate-fade-in relative lg:sticky lg:top-5"
      style={{ background: `linear-gradient(145deg, ${color1}88 0%, ${color2}88 100%)`, boxShadow: 'inset 0 0 100px 50px rgba(0,0,0,0.3)' }}
    >
      <div className="w-[220px] h-[220px] rounded-full bg-black/10 flex items-center justify-center mb-5 relative shadow-inner">
        <img 
          src={spriteUrl} 
          alt={pokemon.name} 
          className={`w-[200px] h-[200px] object-contain filter drop-shadow-2xl transition-all duration-300 ${isAnimated ? 'image-pixelated' : ''}`}
        />
      </div>

      {species.varieties.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {species.varieties.map(v => {
             const formName = v.pokemon.name;
             const label = v.is_default ? 'Default' : capitalize(formName.replace(species.name + '-', '').replace('-', ' '));
             const isActive = formName === pokemon.name;
             return (
               <Button 
                key={formName} 
                variant={isActive ? 'primary' : 'outline'} 
                onClick={() => onFormChange(formName)}
                className="text-xs py-1 px-2"
               >
                 {label}
               </Button>
             )
          })}
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-4xl font-bold drop-shadow-md">{capitalize(pokemon.name)}</h2>
        {statusIcon}
        <button 
          onClick={onToggleFavorite}
          className={`text-3xl transition-transform transform active:scale-125 ${isFavorite ? 'text-yellow-400 scale-110' : 'text-gray-400 hover:text-yellow-200'}`}
        >
          ★
        </button>
      </div>
      
      <h3 className="text-2xl text-[var(--subtle-text-color)] font-light mb-1">#{String(species.id).padStart(4, '0')}</h3>
      <p className="text-sm font-medium opacity-70 mb-4 uppercase tracking-wide">{species.generation.name.replace('-', ' ')}</p>

      {pokemon.abilities.find(a => a.is_hidden) && (
        <div className="bg-black/20 px-4 py-2 rounded-lg border border-white/10 text-sm mb-4">
            <span className="text-[var(--accent-color)] font-bold">Hidden Ability: </span>
            {capitalize(pokemon.abilities.find(a => a.is_hidden)!.ability.name)}
        </div>
      )}

      <div className="flex gap-2 justify-center mb-6">
        {pokemon.types.map(t => (
          <Badge key={t.type.name} color={TYPE_COLORS[t.type.name]}>{capitalize(t.type.name)}</Badge>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
         <Button onClick={onToggleShiny} variant="secondary" className="text-xs">{isShiny ? 'Shiny' : 'Normal'}</Button>
         <Button onClick={onToggleAnimated} variant="secondary" className="text-xs">{isAnimated ? 'Animated' : 'Static'}</Button>
      </div>

      <div className="bg-black/10 p-4 rounded-xl text-sm leading-relaxed text-[var(--subtle-text-color)]">
        {description}
      </div>
    </div>
  );
};