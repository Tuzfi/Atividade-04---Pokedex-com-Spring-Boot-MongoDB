import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BentoGrid } from './components/ui/bento-grid'
import { PokemonCard } from './components/PokemonCard'
import { PokemonDetails } from './components/PokemonDetails'
import { PokemonCompare } from './components/PokemonCompare'
import { TrainersModal } from './components/TrainersModal'
import { AppleSpotlight } from './components/AppleSpotlight'
import { PokemonForm } from './components/PokemonForm'
import { useFavorites } from './hooks/useFavorites'
import { useTheme } from './hooks/useTheme'
import {
  listarPokemons,
  buscarPokemon,
  criarPokemon,
  atualizarPokemon,
  excluirPokemon,
  type PokemonInput,
} from './services/api'
import { sortPokemon, normalizeSearchTerm } from './utils/pokemon'
import type { Pokemon, SortOption } from './types/pokemon'
import './App.css'

function App() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('id-asc')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [comparePair, setComparePair] = useState<[Pokemon, Pokemon] | null>(null)
  const [isTrainersOpen, setIsTrainersOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formPokemon, setFormPokemon] = useState<Pokemon | null>(null)

  const { theme, toggleTheme } = useTheme()
  const { favorites, isFavorite, toggleFavorite } = useFavorites()

  useEffect(() => {
    let ativo = true

    listarPokemons()
      .then((dados) => {
        if (ativo) setAllPokemon(dados)
      })
      .catch((erro: Error) => {
        if (ativo) setLoadError(erro.message)
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [reloadKey])

  const filteredPokemon = useMemo(() => {
    const term = normalizeSearchTerm(searchTerm)

    const filtered = allPokemon.filter((pokemon) => {
      const matchesSearch =
        term === '' ||
        pokemon.name.toLowerCase().includes(term) ||
        String(pokemon.id).includes(term)

      const matchesType =
        selectedType === null ||
        pokemon.types.some((type) => type.name.toLowerCase() === selectedType.toLowerCase())

      const matchesFavorites = !onlyFavorites || isFavorite(pokemon.id)

      return matchesSearch && matchesType && matchesFavorites
    })

    return sortPokemon(filtered, sortBy)
  }, [allPokemon, searchTerm, selectedType, onlyFavorites, isFavorite, sortBy])

  const activeNavigationList = useMemo(() => {
    if (selectedPokemon && filteredPokemon.some((p) => p.id === selectedPokemon.id)) {
      return filteredPokemon
    }
    return allPokemon
  }, [allPokemon, filteredPokemon, selectedPokemon])

  const selectedIndex = selectedPokemon
    ? activeNavigationList.findIndex((p) => p.id === selectedPokemon.id)
    : -1

  const hasPrevious = selectedIndex > 0
  const hasNext = selectedIndex >= 0 && selectedIndex < activeNavigationList.length - 1

  const handleRetry = () => {
    setIsLoading(true)
    setLoadError(null)
    setReloadKey((key) => key + 1)
  }

  const handleSelectPokemon = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon)

    buscarPokemon(pokemon.id)
      .then((atualizado) => {
        setSelectedPokemon((atual) => (atual?.id === atualizado.id ? atualizado : atual))
      })
      .catch(() => {})
  }

  const handlePrevious = () => {
    if (hasPrevious) {
      setSelectedPokemon(activeNavigationList[selectedIndex - 1])
    }
  }

  const handleNext = () => {
    if (hasNext) {
      setSelectedPokemon(activeNavigationList[selectedIndex + 1])
    }
  }

  const handleRandomSelect = () => {
    if (allPokemon.length === 0) return
    const randomIndex = Math.floor(Math.random() * allPokemon.length)
    const randomPokemon = allPokemon[randomIndex]
    setSearchTerm(randomPokemon.name)
    setSelectedType(null)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedType(null)
    setOnlyFavorites(false)
    setSortBy('id-asc')
  }

  const handleOpenCompare = (pokemon: Pokemon) => {
    if (allPokemon.length < 2) return
    let opponent = allPokemon.find((p) => p.id !== pokemon.id) ?? allPokemon[0]
    if (pokemon.id === 1) opponent = allPokemon.find((p) => p.id === 4) ?? opponent
    else if (pokemon.id === 4) opponent = allPokemon.find((p) => p.id === 7) ?? opponent
    else if (pokemon.id === 7) opponent = allPokemon.find((p) => p.id === 1) ?? opponent

    setComparePair([pokemon, opponent])
    setSelectedPokemon(null)
  }

  const handleSpotlightCompare = () => {
    if (allPokemon.length < 2) return
    const p1 = allPokemon[0]
    const p2 = allPokemon[3] ?? allPokemon[1]
    setComparePair([p1, p2])
  }

  const handleOpenCreate = () => {
    setFormPokemon(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (pokemon: Pokemon) => {
    setSelectedPokemon(null)
    setFormPokemon(pokemon)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  const handleSavePokemon = async (dados: PokemonInput) => {
    const salvo = formPokemon
      ? await atualizarPokemon(formPokemon.id, dados)
      : await criarPokemon(dados)

    setAllPokemon((lista) =>
      lista.some((p) => p.id === salvo.id)
        ? lista.map((p) => (p.id === salvo.id ? salvo : p))
        : [...lista, salvo]
    )
    setIsFormOpen(false)
    setSelectedPokemon(salvo)
  }

  const handleDeletePokemon = async (pokemon: Pokemon) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${pokemon.name}?`)) return

    try {
      await excluirPokemon(pokemon.id)
      setAllPokemon((lista) => lista.filter((p) => p.id !== pokemon.id))
      setSelectedPokemon(null)
      if (isFavorite(pokemon.id)) toggleFavorite(pokemon.id)
    } catch (erro) {
      window.alert(erro instanceof Error ? erro.message : 'Não foi possível excluir o Pokémon.')
    }
  }

  return (
    <main className="pokedex">
      <AppleSpotlight
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenCompare={handleSpotlightCompare}
        onOpenCreate={handleOpenCreate}
        onOpenTrainers={() => setIsTrainersOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
        onRandomSelect={handleRandomSelect}
        onlyFavorites={onlyFavorites}
        onToggleFavorites={() => setOnlyFavorites((prev) => !prev)}
        favoritesCount={favorites.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCount={allPokemon.length}
        resultCount={filteredPokemon.length}
      />

      {isLoading ? (
        <div className="empty-state">
          <p className="empty-title">Carregando Pokémon...</p>
          <p className="empty-description">Buscando os dados na API.</p>
        </div>
      ) : loadError ? (
        <div className="empty-state">
          <p className="empty-title">Não foi possível carregar os Pokémon</p>
          <p className="empty-description">{loadError}</p>
          <button type="button" onClick={handleRetry} className="empty-button">
            Tentar novamente
          </button>
        </div>
      ) : filteredPokemon.length > 0 ? (
        <BentoGrid aria-label="Lista de Pokémon">
          {filteredPokemon.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              onClick={() => handleSelectPokemon(pokemon)}
              isFavorite={isFavorite(pokemon.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </BentoGrid>
      ) : (
        <div className="empty-state">
          <p className="empty-title">Nenhum Pokémon encontrado</p>
          <p className="empty-description">
            Tente buscar por outro nome ou número, ou redefina os filtros.
          </p>
          <button type="button" onClick={handleClearFilters} className="empty-button">
            Limpar filtros
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedPokemon && (
          <PokemonDetails
            pokemon={selectedPokemon}
            onClose={() => setSelectedPokemon(null)}
            onPrevious={handlePrevious}
            onNext={handleNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            isFavorite={isFavorite(selectedPokemon.id)}
            onToggleFavorite={() => toggleFavorite(selectedPokemon.id)}
            onCompare={handleOpenCompare}
            onEdit={handleOpenEdit}
            onDelete={handleDeletePokemon}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {comparePair && (
          <PokemonCompare
            pokemon1={comparePair[0]}
            pokemon2={comparePair[1]}
            allPokemon={allPokemon}
            onClose={() => setComparePair(null)}
            onSelectPokemon1={(p) => setComparePair([p, comparePair[1]])}
            onSelectPokemon2={(p) => setComparePair([comparePair[0], p])}
            onSwap={() => setComparePair([comparePair[1], comparePair[0]])}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormOpen && (
          <PokemonForm pokemon={formPokemon} onClose={handleCloseForm} onSave={handleSavePokemon} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTrainersOpen && (
          <TrainersModal
            allPokemon={allPokemon}
            onClose={() => setIsTrainersOpen(false)}
            onSelectPokemon={(pokemon) => {
              setIsTrainersOpen(false)
              handleSelectPokemon(pokemon)
            }}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

export default App