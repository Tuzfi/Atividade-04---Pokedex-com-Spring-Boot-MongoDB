export interface PokemonStats {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}

export interface PokemonType {
  id: number
  name: string
}

export interface Pokemon {
  id: number
  name: string
  stats: PokemonStats
  types: PokemonType[]
}

export interface Trainer {
  id: number
  name: string
  badges: number
  pokemonIds: number[]
}

export type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'hp-desc' | 'attack-desc'