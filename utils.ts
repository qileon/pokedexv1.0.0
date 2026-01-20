
import { PokemonData, SpeciesData, PokemonListEntry, MoveListEntry, MoveDetails, AbilityDetails } from './types';

// --- Constants ---

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
  ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
  psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35F1',
  dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD'
};

export const DAMAGE_CLASS_COLORS: Record<string, string> = {
  physical: '#C92112',
  special: '#4F5870',
  status: '#8C888C'
};

export const ULTRA_BEASTS = new Set(['nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord', 'poipole', 'naganadel', 'stakataka', 'blacephalon']);

export const LEGENDARIES_AND_MYTHICALS = new Set([
  'articuno', 'zapdos', 'moltres', 'mewtwo', 'mew', 
  'raikou', 'entei', 'suicune', 'lugia', 'ho-oh', 'celebi',
  'regirock', 'regice', 'registeel', 'latias', 'latios', 'kyogre', 'groudon', 'rayquaza', 'jirachi', 'deoxys',
  'uxie', 'mesprit', 'azelf', 'dialga', 'palkia', 'heatran', 'regigigas', 'giratina', 'cresselia', 'phione', 'manaphy', 'darkrai', 'shaymin', 'arceus',
  'victini', 'cobalion', 'terrakion', 'virizion', 'tornadus', 'thundurus', 'reshiram', 'zekrom', 'landorus', 'kyurem', 'keldeo', 'meloetta', 'genesect',
  'xerneas', 'yveltal', 'zygarde', 'diancie', 'hoopa', 'volcanion',
  'type-null', 'silvally', 'tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini', 'cosmog', 'cosmoem', 'solgaleo', 'lunala', 'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord', 'necrozma', 'magearna', 'marshadow', 'poipole', 'naganadel', 'stakataka', 'blacephalon', 'zeraora', 'meltan', 'melmetal',
  'zacian', 'zamazenta', 'eternatus', 'kubfu', 'urshifu', 'zarude', 'regieleki', 'regidrago', 'glastrier', 'spectrier', 'calyrex', 'enamorus',
  'wo-chien', 'chien-pao', 'ting-lu', 'chi-yu', 'koraidon', 'miraidon', 'walking-wake', 'iron-leaves', 'dipplin', 'okidogi', 'munkidori', 'fezandipiti', 'ogerpon', 'terapagos', 'pecharunt'
]);

export const GENERATIONS: Record<number, string> = {
  1: "Generation I", 2: "Generation II", 3: "Generation III", 4: "Generation IV", 5: "Generation V",
  6: "Generation VI", 7: "Generation VIII", 8: "Generation VIII", 9: "Generation IX"
};

export const VERSION_GROUP_TO_GEN: Record<string, number> = {
  'red-blue': 1, 'yellow': 1,
  'gold-silver': 2, 'crystal': 2,
  'ruby-sapphire': 3, 'emerald': 3, 'firered-leafgreen': 3,
  'diamond-pearl': 4, 'platinum': 4, 'heartgold-soulsilver': 4,
  'black-white': 5, 'black-2-white-2': 5,
  'x-y': 6, 'omega-ruby-alpha-sapphire': 6,
  'sun-moon': 7, 'ultra-sun-ultra-moon': 7,
  'sword-shield': 8,
  'scarlet-violet': 9
};

export const VERSION_GROUPS = [
  { value: 'scarlet-violet', label: 'Scarlet & Violet (Gen 9)' },
  { value: 'sword-shield', label: 'Sword & Shield (Gen 8)' },
  { value: 'ultra-sun-ultra-moon', label: 'Ultra Sun & Moon (Gen 7)' },
  { value: 'sun-moon', label: 'Sun & Moon (Gen 7)' },
  { value: 'omega-ruby-alpha-sapphire', label: 'Omega Ruby & Alpha Sapphire (Gen 6)' },
  { value: 'x-y', label: 'X & Y (Gen 6)' },
  { value: 'black-2-white-2', label: 'Black 2 & White 2 (Gen 5)' },
  { value: 'black-white', label: 'Black & White (Gen 5)' },
  { value: 'heartgold-soulsilver', label: 'HeartGold & SoulSilver (Gen 4)' },
  { value: 'platinum', label: 'Platinum (Gen 4)' },
  { value: 'diamond-pearl', label: 'Diamond & Pearl (Gen 4)' },
  { value: 'emerald', label: 'Emerald (Gen 3)' },
  { value: 'firered-leafgreen', label: 'FireRed & LeafGreen (Gen 3)' },
  { value: 'ruby-sapphire', label: 'Ruby & Sapphire (Gen 3)' },
  { value: 'crystal', label: 'Crystal (Gen 2)' },
  { value: 'gold-silver', label: 'Gold & Silver (Gen 2)' },
  { value: 'yellow', label: 'Yellow (Gen 1)' },
  { value: 'red-blue', label: 'Red & Blue (Gen 1)' },
];

export const STAT_COLORS: Record<string, string> = {
  hp: '#ff5959', attack: '#f5ac78', defense: '#fae078',
  'special-attack': '#9db7f5', 'special-defense': '#a7db8d', speed: '#fa92b2'
};

export const STAT_NAMES: Record<string, string> = {
  hp: "HP", attack: "Attack", defense: "Defense",
  "special-attack": "Sp. Atk", "special-defense": "Sp. Def", speed: "Speed"
};

export const NATURES = [
    { name: 'adamant', increased: 'attack', decreased: 'special-attack' },
    { name: 'bashful', increased: null, decreased: null },
    { name: 'bold', increased: 'defense', decreased: 'attack' },
    { name: 'brave', increased: 'attack', decreased: 'speed' },
    { name: 'calm', increased: 'special-defense', decreased: 'attack' },
    { name: 'careful', increased: 'special-defense', decreased: 'special-attack' },
    { name: 'docile', increased: null, decreased: null },
    { name: 'gentle', increased: 'special-defense', decreased: 'defense' },
    { name: 'hardy', increased: null, decreased: null },
    { name: 'hasty', increased: 'speed', decreased: 'defense' },
    { name: 'impish', increased: 'defense', decreased: 'special-attack' },
    { name: 'jolly', increased: 'speed', decreased: 'special-attack' },
    { name: 'lax', increased: 'defense', decreased: 'special-defense' },
    { name: 'lonely', increased: 'attack', decreased: 'defense' },
    { name: 'mild', increased: 'special-attack', decreased: 'defense' },
    { name: 'modest', increased: 'special-attack', decreased: 'attack' },
    { name: 'naive', increased: 'speed', decreased: 'special-defense' },
    { name: 'naughty', increased: 'attack', decreased: 'special-defense' },
    { name: 'quiet', increased: 'special-attack', decreased: 'speed' },
    { name: 'quirky', increased: null, decreased: null },
    { name: 'rash', increased: 'special-attack', decreased: 'special-defense' },
    { name: 'relaxed', increased: 'defense', decreased: 'speed' },
    { name: 'sassy', increased: 'special-defense', decreased: 'speed' },
    { name: 'serious', increased: null, decreased: null },
    { name: 'timid', increased: 'speed', decreased: 'attack' },
];

// --- Helpers ---

export const capitalize = (str: string) => {
  if (!str) return '';
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const darkenColor = (hex: string, percent: number) => {
  let num = parseInt(hex.replace("#", ""), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) - amt;
  let B = ((num >> 8) & 0x00FF) - amt;
  let G = (num & 0x0000FF) - amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
    (G < 255 ? (G < 1 ? 0 : G) : 255)
  ).toString(16).slice(1);
};

export const getRecommendedEVs = (stats: { base_stat: number, stat: { name: string } }[]) => {
  const statMap: Record<string, number> = {};
  stats.forEach(s => { statMap[s.stat.name] = s.base_stat; });

  const primaryOffense = statMap['attack'] > statMap['special-attack'] ? 'attack' : 'special-attack';
  const primaryDefense = statMap['defense'] > statMap['special-defense'] ? 'defense' : 'special-defense';

  let recommendations: Record<string, number> = { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 };
  if (statMap['speed'] >= 70) {
    recommendations[primaryOffense] = 252;
    recommendations['speed'] = 252;
    recommendations[primaryOffense === 'attack' ? 'special-defense' : 'defense'] = 4;
  } else {
    recommendations['hp'] = 252;
    recommendations[primaryOffense] = 252;
    recommendations[primaryDefense] = 4;
  }
  return recommendations;
};

export const getRecommendedIVs = (stats: { base_stat: number, stat: { name: string } }[]) => {
  const statMap: Record<string, number> = {};
  stats.forEach(s => { statMap[s.stat.name] = s.base_stat; });

  let ivs: Record<string, number> = { hp: 31, attack: 31, defense: 31, 'special-attack': 31, 'special-defense': 31, speed: 31 };

  if (statMap['special-attack'] > statMap['attack'] + 15) { ivs.attack = 0; }
  if (statMap['attack'] > statMap['special-attack'] + 15) { ivs['special-attack'] = 0; }
  if (statMap['speed'] < 50) { ivs.speed = 0; }
  return ivs;
};

export const getRecommendedNature = (stats: { base_stat: number, stat: { name: string } }[]) => {
    const s: Record<string, number> = {};
    stats.forEach(stat => { s[stat.stat.name] = stat.base_stat; });

    // Determine offensive bias
    if (s.attack > s['special-attack'] + 10) {
        return s.speed > 80 ? 'jolly' : 'adamant';
    } else if (s['special-attack'] > s.attack + 10) {
        return s.speed > 80 ? 'timid' : 'modest';
    } else {
        // Balanced or defensive biases
        if (s.speed > 100) return 'hasty';
        if (s.defense > s['special-defense']) return 'impish';
        if (s['special-defense'] > s.defense) return 'careful';
    }
    return 'serious'; // Fallback
};

export const calculateTypeEffectiveness = (types: string[]) => {
  const typeChart: Record<string, Record<string, number>> = {
    normal: { fighting: 2, ghost: 0 },
    fire: { water: 2, ground: 2, rock: 2, fire: .5, grass: .5, ice: .5, bug: .5, steel: .5, fairy: .5 },
    water: { electric: 2, grass: 2, fire: .5, water: .5, ice: .5, steel: .5 },
    electric: { ground: 2, electric: .5, flying: .5, steel: .5 },
    grass: { fire: 2, ice: 2, poison: 2, flying: 2, bug: 2, water: .5, electric: .5, grass: .5, ground: .5 },
    ice: { fire: 2, fighting: 2, rock: 2, steel: 2, ice: .5 },
    fighting: { flying: 2, psychic: 2, fairy: 2, bug: .5, rock: .5, dark: .5 },
    poison: { ground: 2, psychic: 2, grass: .5, fighting: .5, poison: .5, bug: .5, fairy: .5 },
    ground: { water: 2, grass: 2, ice: 2, poison: .5, rock: .5, electric: 0 },
    flying: { electric: 2, ice: 2, rock: 2, grass: .5, fighting: .5, bug: .5, ground: 0 },
    psychic: { bug: 2, ghost: 2, dark: 2, fighting: .5, psychic: .5 },
    bug: { fire: 2, flying: 2, rock: 2, grass: .5, fighting: .5, ground: .5 },
    rock: { water: 2, grass: 2, fighting: 2, ground: 2, steel: 2, normal: .5, fire: .5, poison: .5, flying: .5 },
    ghost: { ghost: 2, dark: 2, poison: .5, bug: .5, normal: 0, fighting: 0 },
    dragon: { ice: 2, dragon: 2, fairy: 2, fire: .5, water: .5, electric: .5, grass: .5 },
    dark: { fighting: 2, bug: 2, fairy: 2, ghost: .5, dark: .5, psychic: 0 },
    steel: { fire: 2, fighting: 2, ground: 2, normal: .5, grass: .5, ice: .5, flying: .5, psychic: .5, bug: .5, rock: .5, dragon: .5, steel: .5, fairy: .5, poison: 0 },
    fairy: { poison: 2, steel: 2, fighting: .5, bug: .5, dark: .5, dragon: 0 }
  };

  const effectiveness: Record<string, number> = {};
  Object.keys(typeChart).forEach(attackType => {
    let multiplier = 1;
    types.forEach(defenseType => {
      multiplier *= typeChart[defenseType]?.[attackType] ?? 1;
    });
    effectiveness[attackType] = multiplier;
  });
  return effectiveness;
};

// --- API Logic ---

export const loadAllPokemonList = async (): Promise<{ species: PokemonListEntry[], forms: PokemonListEntry[] }> => {
  const [speciesRes, formsRes] = await Promise.all([
    fetch('https://pokeapi.co/api/v2/pokemon-species?limit=2000'),
    fetch('https://pokeapi.co/api/v2/pokemon?limit=3000')
  ]);
  const speciesData = await speciesRes.json();
  const formsData = await formsRes.json();

  const species = speciesData.results.map((p: any) => {
    const urlParts = p.url.split('/');
    const id = parseInt(urlParts[urlParts.length - 2]);
    return { name: p.name, id, url: p.url };
  });

  const forms = formsData.results.map((p: any) => {
    const urlParts = p.url.split('/');
    const id = parseInt(urlParts[urlParts.length - 2]);
    return { name: p.name, id, url: p.url };
  });

  return { species, forms };
};

export const loadAllMovesList = async (): Promise<MoveListEntry[]> => {
  const res = await fetch('https://pokeapi.co/api/v2/move?limit=1000');
  const data = await res.json();
  return data.results;
};

export const fetchPokemonData = async (term: string, nameList: PokemonListEntry[]) => {
  let normalizedTerm = term.toLowerCase().replace(/\s+/g, '-').split(' #')[0];
  if (normalizedTerm === 'surprise me' && nameList.length) {
    normalizedTerm = nameList[Math.floor(Math.random() * nameList.length)].name;
  }

  let pokemonData: PokemonData;
  let speciesData: SpeciesData;

  try {
    const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalizedTerm}`);
    if (!pokemonRes.ok) throw new Error();
    pokemonData = await pokemonRes.json();
    const speciesRes = await fetch(pokemonData.species.url);
    speciesData = await speciesRes.json();
  } catch (e) {
    // Fallback search
    const exactMatch = nameList.find(p => p.name === normalizedTerm || String(p.id) === normalizedTerm);
    const match = exactMatch || nameList.find(p => p.name.startsWith(normalizedTerm)) || nameList.find(p => p.name.includes(normalizedTerm));
    
    if (!match) throw new Error(`Pokémon "${term}" not found.`);
    
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${match.name}`);
    speciesData = await speciesRes.json();
    const defaultVarietyUrl = speciesData.varieties.find(v => v.is_default)?.pokemon.url || speciesData.varieties[0].pokemon.url;
    const pokemonRes = await fetch(defaultVarietyUrl);
    pokemonData = await pokemonRes.json();
  }

  return { pokemonData, speciesData };
};

export const fetchMoveDetails = async (name: string): Promise<MoveDetails> => {
   const res = await fetch(`https://pokeapi.co/api/v2/move/${name}`);
   if (!res.ok) throw new Error('Move not found');
   return res.json();
};

export const fetchAbilityDetails = async (nameOrId: string | number): Promise<AbilityDetails> => {
    const res = await fetch(`https://pokeapi.co/api/v2/ability/${nameOrId}`);
    if (!res.ok) throw new Error('Ability not found');
    return res.json();
};

export const fetchPokemonMoves = async (name: string): Promise<PokemonData> => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error('Pokemon not found');
    return res.json();
};
