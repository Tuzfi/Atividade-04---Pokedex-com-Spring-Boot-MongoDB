import type { Pokemon, Trainer } from '../types/pokemon'

const API_URL = '/api'
const MENSAGEM_SEM_CONEXAO = 'Não foi possível conectar à API. Verifique se o backend está rodando.'

export type PokemonInput = Omit<Pokemon, 'id'> & { id?: number }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    throw new Error(MENSAGEM_SEM_CONEXAO)
  }

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    if (erro?.message) {
      throw new Error(erro.message)
    }
    throw new Error(response.status >= 500 ? MENSAGEM_SEM_CONEXAO : `Erro ${response.status} ao acessar a API.`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function listarPokemons(): Promise<Pokemon[]> {
  return request<Pokemon[]>('/pokemons')
}

export function buscarPokemon(id: number): Promise<Pokemon> {
  return request<Pokemon>(`/pokemons/${id}`)
}

export function criarPokemon(pokemon: PokemonInput): Promise<Pokemon> {
  return request<Pokemon>('/pokemons', {
    method: 'POST',
    body: JSON.stringify(pokemon),
  })
}

export function atualizarPokemon(id: number, pokemon: PokemonInput): Promise<Pokemon> {
  return request<Pokemon>(`/pokemons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pokemon),
  })
}

export function excluirPokemon(id: number): Promise<void> {
  return request<void>(`/pokemons/${id}`, { method: 'DELETE' })
}

export function listarTreinadores(): Promise<Trainer[]> {
  return request<Trainer[]>('/trainers')
}