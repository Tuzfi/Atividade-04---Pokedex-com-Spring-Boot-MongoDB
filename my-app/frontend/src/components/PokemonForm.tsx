import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Pokemon, PokemonStats, PokemonType } from '../types/pokemon'
import type { PokemonInput } from '../services/api'
import {
  ALL_POKEMON_TYPES,
  MAX_POKEMON_STAT_VALUE,
  POKEMON_STATS_DEFINITIONS,
} from '../utils/pokemon'

const TIPOS_DISPONIVEIS: PokemonType[] = [
  { id: 1, name: 'Normal' },
  { id: 2, name: 'Fire' },
  { id: 3, name: 'Water' },
  { id: 4, name: 'Grass' },
  { id: 5, name: 'Electric' },
  { id: 6, name: 'Ice' },
  { id: 7, name: 'Fighting' },
  { id: 8, name: 'Poison' },
  { id: 9, name: 'Ground' },
  { id: 10, name: 'Flying' },
  { id: 11, name: 'Psychic' },
  { id: 12, name: 'Bug' },
  { id: 13, name: 'Rock' },
  { id: 14, name: 'Ghost' },
  { id: 15, name: 'Dark' },
  { id: 16, name: 'Dragon' },
  { id: 17, name: 'Steel' },
]

type StatsTexto = Record<keyof PokemonStats, string>

const STATS_INICIAIS: StatsTexto = {
  hp: '50',
  attack: '50',
  defense: '50',
  specialAttack: '50',
  specialDefense: '50',
  speed: '50',
}

const CAMPO =
  'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:opacity-60 transition'

const ROTULO = 'block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1'

function rotuloDoTipo(nome: string): string {
  return ALL_POKEMON_TYPES.find((tipo) => tipo.id === nome)?.label ?? nome
}

function statsParaTexto(stats: PokemonStats): StatsTexto {
  return {
    hp: String(stats.hp),
    attack: String(stats.attack),
    defense: String(stats.defense),
    specialAttack: String(stats.specialAttack),
    specialDefense: String(stats.specialDefense),
    speed: String(stats.speed),
  }
}

export interface PokemonFormProps {
  pokemon: Pokemon | null
  onClose: () => void
  onSave: (dados: PokemonInput) => Promise<void>
}

export function PokemonForm({ pokemon, onClose, onSave }: PokemonFormProps) {
  const isEdicao = pokemon !== null

  const [idTexto, setIdTexto] = useState(pokemon ? String(pokemon.id) : '')
  const [nome, setNome] = useState(pokemon?.name ?? '')
  const [stats, setStats] = useState<StatsTexto>(pokemon ? statsParaTexto(pokemon.stats) : STATS_INICIAIS)
  const [tipoPrincipal, setTipoPrincipal] = useState(pokemon?.types[0]?.name ?? 'Normal')
  const [tipoSecundario, setTipoSecundario] = useState(pokemon?.types[1]?.name ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nomeLimpo = nome.trim()
    if (!nomeLimpo) {
      setErro('Informe o nome do Pokémon.')
      return
    }

    let id: number | undefined = pokemon?.id
    if (!isEdicao && idTexto.trim() !== '') {
      id = Number(idTexto)
      if (!Number.isInteger(id) || id < 1) {
        setErro('O número deve ser um inteiro maior que zero.')
        return
      }
    }

    const statsNumericos: Partial<PokemonStats> = {}
    for (const stat of POKEMON_STATS_DEFINITIONS) {
      const texto = stats[stat.key].trim()
      const valor = Number(texto)
      if (texto === '' || !Number.isInteger(valor) || valor < 1 || valor > MAX_POKEMON_STAT_VALUE) {
        setErro(`${stat.label} deve ser um número inteiro entre 1 e ${MAX_POKEMON_STAT_VALUE}.`)
        return
      }
      statsNumericos[stat.key] = valor
    }

    if (tipoSecundario === tipoPrincipal) {
      setErro('O tipo secundário deve ser diferente do tipo principal.')
      return
    }

    const tipos = TIPOS_DISPONIVEIS.filter((tipo) => tipo.name === tipoPrincipal)
    const secundario = TIPOS_DISPONIVEIS.find((tipo) => tipo.name === tipoSecundario)
    if (secundario) {
      tipos.push(secundario)
    }

    setErro(null)
    setSalvando(true)

    try {
      await onSave({ id, name: nomeLimpo, stats: statsNumericos as PokemonStats, types: tipos })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível salvar o Pokémon.')
      setSalvando(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pokemon-form-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden my-auto"
      >
        <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 sm:px-6 py-4">
          <div>
            <h2 id="pokemon-form-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEdicao ? `Editar ${pokemon.name}` : 'Novo Pokémon'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isEdicao ? 'Altere os dados e salve para atualizar no banco.' : 'Preencha os dados para cadastrar no banco.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate className="px-5 sm:px-6 py-5 space-y-5">
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <div>
              <label htmlFor="pokemon-id" className={ROTULO}>
                Número
              </label>
              <input
                id="pokemon-id"
                type="number"
                min={1}
                value={idTexto}
                onChange={(e) => setIdTexto(e.target.value)}
                disabled={isEdicao}
                placeholder="Auto"
                className={CAMPO}
              />
            </div>
            <div>
              <label htmlFor="pokemon-name" className={ROTULO}>
                Nome
              </label>
              <input
                id="pokemon-name"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Pikachu"
                autoFocus
                className={CAMPO}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pokemon-type-1" className={ROTULO}>
                Tipo principal
              </label>
              <select
                id="pokemon-type-1"
                value={tipoPrincipal}
                onChange={(e) => setTipoPrincipal(e.target.value)}
                className={CAMPO}
              >
                {TIPOS_DISPONIVEIS.map((tipo) => (
                  <option key={tipo.id} value={tipo.name}>
                    {rotuloDoTipo(tipo.name)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pokemon-type-2" className={ROTULO}>
                Tipo secundário
              </label>
              <select
                id="pokemon-type-2"
                value={tipoSecundario}
                onChange={(e) => setTipoSecundario(e.target.value)}
                className={CAMPO}
              >
                <option value="">Nenhum</option>
                {TIPOS_DISPONIVEIS.map((tipo) => (
                  <option key={tipo.id} value={tipo.name}>
                    {rotuloDoTipo(tipo.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-2">
              Atributos (1 a {MAX_POKEMON_STAT_VALUE})
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {POKEMON_STATS_DEFINITIONS.map((stat) => (
                <div key={stat.key}>
                  <label htmlFor={`pokemon-stat-${stat.key}`} className={ROTULO}>
                    {stat.label}
                  </label>
                  <input
                    id={`pokemon-stat-${stat.key}`}
                    type="number"
                    min={1}
                    max={MAX_POKEMON_STAT_VALUE}
                    value={stats[stat.key]}
                    onChange={(e) => setStats((atual) => ({ ...atual, [stat.key]: e.target.value }))}
                    className={CAMPO}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {erro && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {erro}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white disabled:opacity-60 transition-colors"
            >
              {salvando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}