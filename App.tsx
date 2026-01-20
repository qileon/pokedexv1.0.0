
import React, { useState, useEffect } from 'react';
import { Search } from './components/Search';
import { PokemonShowcase } from './components/PokemonShowcase';
import { StatsPanel, EffectivenessPanel, EvolutionPanel, BreedingPanel, TrainingPanel, MovesetPanel, NaturePanel, AbilitiesPanel } from './components/InfoPanels';
import { ComparisonView } from './components/ComparisonView';
import { FavoritesModal, FilterModal, ThemeModal } from './components/Modals';
import { MoveListPage, MoveDetailsPage } from './components/MovePages';
import { NatureListPage } from './components/NaturePage';
import { AbilityDetailsPage } from './components/AbilityPage';
import { loadAllPokemonList, fetchPokemonData, loadAllMovesList, fetchMoveDetails, fetchAbilityDetails, capitalize, LEGENDARIES_AND_MYTHICALS } from './utils';
import { PokemonData, SpeciesData, PokemonListEntry, Theme, MoveListEntry, MoveDetails, AbilityDetails } from './types';

const App: React.FC = () => {
  // State
  const [pokemonList, setPokemonList] = useState<{ species: PokemonListEntry[], forms: PokemonListEntry[] }>({ species: [], forms: [] });
  const [currentPokemon, setCurrentPokemon] = useState<{ data: PokemonData, species: SpeciesData } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  // Moves State
  const [moveList, setMoveList] = useState<MoveListEntry[]>([]);
  const [currentMove, setCurrentMove] = useState<MoveDetails | null>(null);

  // Abilities State
  const [currentAbility, setCurrentAbility] = useState<AbilityDetails | null>(null);
  
  // UI State
  const [isShiny, setIsShiny] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [view, setView] = useState<'main' | 'compare' | 'filter-results' | 'moves' | 'move-details' | 'natures' | 'ability-details'>('main');
  const [previousView, setPreviousView] = useState<'main' | 'compare' | 'filter-results' | 'moves' | 'natures' | 'ability-details'>('main');
  const [activeModal, setActiveModal] = useState<'none' | 'favorites' | 'filter' | 'theme'>('none');
  const [filteredResults, setFilteredResults] = useState<any[]>([]); // Simplified for grid

  // Preferences
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('pokedexFavorites') || '[]'));
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('pokedexTheme') as Theme) || 'dark');

  // Init
  useEffect(() => {
    loadAllPokemonList().then(setPokemonList).catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('pokedexFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('pokedexTheme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--bg-color', '#f8f9fa');
      root.style.setProperty('--card-bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#212529');
      root.style.setProperty('--subtle-text-color', '#6c757d');
      root.style.setProperty('--accent-color', '#007bff');
      root.style.setProperty('--border-color', '#dee2e6');
    } else if (theme === 'fire') {
      root.style.setProperty('--bg-color', '#2c1a1a');
      root.style.setProperty('--card-bg-color', 'rgba(60, 30, 30, 0.6)');
      root.style.setProperty('--text-color', '#fde0d0');
      root.style.setProperty('--subtle-text-color', 'rgba(253, 224, 208, 0.7)');
      root.style.setProperty('--accent-color', '#ff7b00');
      root.style.setProperty('--border-color', 'rgba(255, 100, 50, 0.2)');
    } else {
      // Dark default
      root.style.setProperty('--bg-color', '#1a1c20');
      root.style.setProperty('--card-bg-color', 'rgba(45, 47, 51, 0.6)');
      root.style.setProperty('--text-color', '#f0f0f0');
      root.style.setProperty('--subtle-text-color', 'rgba(240, 240, 240, 0.7)');
      root.style.setProperty('--accent-color', '#ff3333');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
    }
  }, [theme]);

  // Actions
  const handleSearch = async (term: string, isBackNav = false) => {
    if (!isBackNav && currentPokemon) setHistory(prev => [...prev, currentPokemon.data.name]);
    setLoading(true);
    setError(null);
    setView('main');
    setFilteredResults([]);

    try {
      const { pokemonData, speciesData } = await fetchPokemonData(term, pokemonList.species);
      setCurrentPokemon({ data: pokemonData, species: speciesData });
    } catch (err: any) {
      setError(err.message || "Failed to load Pokemon");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (view === 'move-details' || view === 'ability-details') {
        setView(previousView);
        return;
    }
    
    // Default Pokemon History Back
    const last = history[history.length - 1];
    if (last) {
      setHistory(prev => prev.slice(0, -1));
      handleSearch(last, true);
    } else if (view !== 'main') {
        setView('main');
    }
  };

  const resetToHome = () => {
    setCurrentPokemon(null);
    setView('main');
    setHistory([]);
    setError(null);
    setFilteredResults([]);
  };

  const toggleFavorite = () => {
    if (!currentPokemon) return;
    const name = currentPokemon.data.name;
    setFavorites(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
  };

  const handleFilterApply = async (types: string[], gen: string | null, isLegendary: boolean) => {
    setLoading(true);
    setView('filter-results');
    try {
        let list = pokemonList.species.map(p => ({ ...p, id: p.id })); // Start with all
        
        if (gen) {
             const res = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
             const data = await res.json();
             const genNames = new Set(data.pokemon_species.map((p: any) => p.name));
             list = list.filter(p => genNames.has(p.name));
        }

        if (types.length > 0) {
            const typeData = await Promise.all(types.map(t => fetch(`https://pokeapi.co/api/v2/type/${t}`).then(r => r.json())));
            const typeSets = typeData.map(d => new Set(d.pokemon.map((p: any) => p.pokemon.name)));
            // Intersection
            const allowedNames = typeSets.reduce((a, b) => new Set([...a].filter(x => b.has(x))));
            list = list.filter(p => allowedNames.has(p.name));
        }

        if (isLegendary) {
            list = list.filter(p => LEGENDARIES_AND_MYTHICALS.has(p.name));
        }
        
        list.sort((a, b) => a.id - b.id);
        setFilteredResults(list);
    } catch (e) {
        setError("Filter failed");
    } finally {
        setLoading(false);
    }
  };

  const handleOpenMoves = async () => {
    setView('moves');
    if (moveList.length === 0) {
        setLoading(true);
        try {
            const moves = await loadAllMovesList();
            setMoveList(moves);
        } catch (e) {
            setError("Failed to load moves");
        } finally {
            setLoading(false);
        }
    }
  };

  const handleSelectMove = async (name: string) => {
      // If coming from main/moves, set current view as previous view
      if (view !== 'move-details') {
          setPreviousView(view as any);
      }
      
      setView('move-details');
      setLoading(true);
      try {
          const details = await fetchMoveDetails(name);
          setCurrentMove(details);
      } catch (e) {
          setError("Failed to load move details");
      } finally {
          setLoading(false);
      }
  };

  const handleSelectAbility = async (name: string) => {
    if (view !== 'ability-details') {
        setPreviousView(view as any);
    }
    
    setView('ability-details');
    setLoading(true);
    try {
        const details = await fetchAbilityDetails(name);
        setCurrentAbility(details);
    } catch (e) {
        setError("Failed to load ability details");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="mb-8 animate-fade-in relative z-50">
        <h1 
          className="text-4xl font-bold flex items-center gap-3 mb-6 tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
          onClick={resetToHome}
        >
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" alt="icon" className="w-10 h-10" />
            Pokédex
        </h1>
        
        <Search 
          onSearch={handleSearch}
          onBack={handleBack}
          canGoBack={history.length > 0 || view !== 'main'}
          isLoading={loading}
          pokemonList={pokemonList.species}
          onOpenFavorites={() => setActiveModal('favorites')}
          onOpenFilter={() => setActiveModal('filter')}
          onOpenCompare={() => setView('compare')}
          onOpenTheme={() => setActiveModal('theme')}
          onOpenMoves={handleOpenMoves}
          onOpenNatures={() => setView('natures')}
        />

        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6 text-center">
                {error}
            </div>
        )}
      </header>

      <main>
        {/* View: Compare */}
        {view === 'compare' && (
            <ComparisonView pokemonList={pokemonList.forms} onExit={() => setView('main')} />
        )}

        {/* View: Natures */}
        {view === 'natures' && (
            <NatureListPage onBack={() => setView('main')} />
        )}

        {/* View: Move List */}
        {view === 'moves' && (
            <MoveListPage moves={moveList} onSelectMove={handleSelectMove} isLoading={loading} />
        )}

        {/* View: Move Details */}
        {view === 'move-details' && (
            <MoveDetailsPage 
                move={currentMove} 
                loading={loading} 
                onBack={handleBack} 
                onPokemonClick={(name) => handleSearch(name)}
            />
        )}

        {/* View: Ability Details */}
        {view === 'ability-details' && (
            <AbilityDetailsPage 
                ability={currentAbility} 
                loading={loading} 
                onBack={handleBack} 
                onPokemonClick={(name) => handleSearch(name)}
            />
        )}

        {/* View: Filter Grid */}
        {view === 'filter-results' && (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Filtered Results ({filteredResults.length})</h2>
                    <button onClick={() => setView('main')} className="text-[var(--accent-color)] underline">Back to Search</button>
                </div>
                {filteredResults.length === 0 ? <p>No Pokémon found.</p> : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                         {filteredResults.map(p => (
                             <div key={p.name} onClick={() => handleSearch(p.name)} className="bg-[var(--card-bg-color)] border border-white/10 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition">
                                 <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`} alt={p.name} className="w-24 h-24 object-contain mx-auto mb-2" loading="lazy" />
                                 <div className="font-bold">{capitalize(p.name)}</div>
                                 <div className="text-xs opacity-50">#{String(p.id).padStart(4, '0')}</div>
                             </div>
                         ))}
                    </div>
                )}
            </div>
        )}

        {/* View: Main Showcase */}
        {view === 'main' && currentPokemon && (
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
                <PokemonShowcase 
                    pokemon={currentPokemon.data}
                    species={currentPokemon.species}
                    isShiny={isShiny}
                    isAnimated={isAnimated}
                    isFavorite={favorites.includes(currentPokemon.data.name)}
                    onToggleShiny={() => setIsShiny(!isShiny)}
                    onToggleAnimated={() => setIsAnimated(!isAnimated)}
                    onToggleFavorite={toggleFavorite}
                    onFormChange={(name) => handleSearch(name)}
                />
                
                <div className="flex flex-col gap-6">
                    <EffectivenessPanel types={currentPokemon.data.types.map(t => t.type.name)} />
                    <AbilitiesPanel abilities={currentPokemon.data.abilities} onAbilityClick={handleSelectAbility} />
                    <NaturePanel stats={currentPokemon.data.stats} />
                    <BreedingPanel species={currentPokemon.species} />
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <EvolutionPanel url={currentPokemon.species.evolution_chain.url} onSearch={handleSearch} />
                        </div>
                        <div className="flex-1">
                            <StatsPanel stats={currentPokemon.data.stats} />
                        </div>
                    </div>
                    <TrainingPanel stats={currentPokemon.data.stats} />
                    <MovesetPanel moves={currentPokemon.data.moves} onMoveClick={handleSelectMove} />
                </div>
            </div>
        )}
        
        {view === 'main' && !currentPokemon && !loading && (
             <div className="text-center py-20 opacity-50">
                 <div className="text-6xl mb-4">🔍</div>
                 <h2 className="text-2xl font-bold">Ready to research</h2>
                 <p>Search for a Pokémon to begin your analysis.</p>
             </div>
        )}
      </main>

      {/* Modals */}
      {activeModal === 'favorites' && (
          <FavoritesModal 
             favorites={favorites} 
             onClose={() => setActiveModal('none')} 
             onSelect={handleSearch} 
          />
      )}
      {activeModal === 'filter' && (
          <FilterModal 
             onClose={() => setActiveModal('none')} 
             onApply={handleFilterApply} 
          />
      )}
      {activeModal === 'theme' && (
          <ThemeModal 
             onClose={() => setActiveModal('none')} 
             onSetTheme={setTheme} 
          />
      )}
    </div>
  );
};

export default App;
