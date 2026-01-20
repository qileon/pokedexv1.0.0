

export interface PokemonListEntry {
  name: string;
  id: number;
  url: string;
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonSprite {
  front_default: string;
  front_shiny: string;
  other: {
    'official-artwork': {
      front_default: string;
      front_shiny: string;
    };
  };
  versions?: {
    'generation-v': {
      'black-white': {
        animated: {
          front_default: string;
          front_shiny: string;
        };
      };
    };
  };
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: {
      name: string;
    };
    version_group: {
      name: string;
    };
  }[];
}

export interface PokemonAbility {
  is_hidden: boolean;
  ability: {
    name: string;
    url: string;
  };
}

export interface PokemonData {
  id: number;
  name: string;
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: PokemonSprite;
  moves: PokemonMove[];
  abilities: PokemonAbility[];
  species: {
    url: string;
  };
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: { name: string };
  version: { name: string };
}

export interface Variety {
  is_default: boolean;
  pokemon: {
    name: string;
    url: string;
  };
}

export interface SpeciesData {
  id: number;
  name: string;
  generation: { name: string };
  is_legendary: boolean;
  is_mythical: boolean;
  flavor_text_entries: FlavorTextEntry[];
  varieties: Variety[];
  evolution_chain: { url: string };
  gender_rate: number;
  egg_groups: { name: string }[];
}

export interface EvolutionChainNode {
  species: { name: string; url: string };
  evolves_to: EvolutionChainNode[];
  evolution_details: any[];
}

export interface MoveListEntry {
  name: string;
  url: string;
}

export interface MovePastValue {
  accuracy: number | null;
  effect_chance: number | null;
  effect_entries: any[];
  power: number | null;
  pp: number | null;
  type: { name: string } | null;
  version_group: { name: string };
}

export interface MoveDetails {
  id: number;
  name: string;
  type: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  damage_class: { name: string };
  /* Fix: Added language property to effect_entries for MoveDetails */
  effect_entries: { effect: string, short_effect: string, language: { name: string } }[];
  flavor_text_entries: FlavorTextEntry[];
  target: { name: string };
  generation: { name: string };
  machines: { machine: { url: string }, version_group: { name: string } }[];
  learned_by_pokemon: { name: string, url: string }[];
  past_values: MovePastValue[];
}

export interface AbilityPokemon {
  is_hidden: boolean;
  pokemon: {
    name: string;
    url: string;
  };
}

export interface AbilityDetails {
  id: number;
  name: string;
  effect_entries: { effect: string, short_effect: string, language: { name: string } }[];
  flavor_text_entries: FlavorTextEntry[];
  generation: { name: string };
  pokemon: AbilityPokemon[];
}

export type Theme = 'dark' | 'light' | 'fire';