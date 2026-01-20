
import React, { useState, useRef, useEffect } from 'react';
import { Button, Loader } from './UI';
import { PokemonListEntry } from '../types';
import { capitalize } from '../utils';

interface SearchProps {
  onSearch: (term: string) => void;
  onBack: () => void;
  canGoBack: boolean;
  isLoading: boolean;
  pokemonList: PokemonListEntry[];
  onOpenFavorites: () => void;
  onOpenFilter: () => void;
  onOpenCompare: () => void;
  onOpenTheme: () => void;
  onOpenMoves: () => void;
  onOpenNatures: () => void;
}

export const Search: React.FC<SearchProps> = ({ 
  onSearch, onBack, canGoBack, isLoading, pokemonList, 
  onOpenFavorites, onOpenFilter, onOpenCompare, onOpenTheme, onOpenMoves, onOpenNatures
}) => {
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
    if (val.length > 1) {
      const lower = val.toLowerCase();
      const matches = pokemonList.filter(p => p.name.startsWith(lower) || p.name.includes(lower)).slice(0, 8);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = () => {
    onSearch(inputValue);
    setShowSuggestions(false);
  };

  return (
    <div className="mb-6 relative z-50" ref={wrapperRef}>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-grow max-w-md">
          <input
            value={inputValue}
            onChange={handleInput}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Name, number or 'surprise me'"
            className="w-full px-4 py-3 bg-black/20 border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card-bg-color)] border border-[var(--border-color)] rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl z-50 custom-scrollbar">
              {suggestions.map(p => (
                <div 
                  key={p.name} 
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0"
                  onClick={() => {
                    setInputValue(capitalize(p.name));
                    onSearch(p.name);
                    setShowSuggestions(false);
                  }}
                >
                  <span>{capitalize(p.name)}</span>
                  <span className="text-xs opacity-50">#{String(p.id).padStart(4, '0')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button onClick={handleSubmit} disabled={isLoading} className="min-w-[100px]">
          {isLoading ? <Loader /> : 'Search'}
        </Button>
        <Button onClick={onBack} disabled={!canGoBack} variant="secondary" className="flex items-center gap-2">
            <span>←</span> <span>Back</span>
        </Button>
        <div className="flex flex-wrap gap-2">
            <Button onClick={onOpenMoves} variant="outline">Moves</Button>
            <Button onClick={onOpenNatures} variant="outline">Natures</Button>
            <Button onClick={onOpenCompare} variant="outline">Compare</Button>
            <Button onClick={onOpenFavorites} variant="outline">Favorites</Button>
            <Button onClick={onOpenFilter} variant="outline">Filter</Button>
            <Button onClick={onOpenTheme} variant="outline" className="px-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 fill-current"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9.9 15.9-19.4 15.9H181.8c-9.5 0-17.4-6.8-19.4-15.9l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L49.7 416.7c-8.8 2.8-18.6 .4-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C50.6 273.1 50 264.6 50 256s.6-17.1 1.7-25.4L7.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9.9-15.9 19.4-15.9h148.5c9.5 0 17.4 6.8 19.4 15.9l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.4 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 337.6c45 0 81.6-36.6 81.6-81.6s-36.6-81.6-81.6-81.6s-81.6 36.6-81.6 81.6s36.6 81.6 81.6 81.6z"/></svg>
            </Button>
        </div>
      </div>
    </div>
  );
};
