package com.example.demo.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.Pokemon;
import com.example.demo.repository.PokemonRepository;

@Service
public class PokemonService {

    private final PokemonRepository pokemonRepository;

    public PokemonService(PokemonRepository pokemonRepository) {
        this.pokemonRepository = pokemonRepository;
    }

    public List<Pokemon> listar(String nome, String tipo) {
        if (nome != null && !nome.isBlank()) {
            return pokemonRepository.findByNameContainingIgnoreCaseOrderByIdAsc(nome.trim());
        }
        if (tipo != null && !tipo.isBlank()) {
            return pokemonRepository.findByTypesNameIgnoreCaseOrderByIdAsc(tipo.trim());
        }
        return pokemonRepository.findAll(Sort.by("id"));
    }

    public Pokemon buscarPorId(Integer id) {
        return pokemonRepository.findById(id)
                .orElseThrow(() -> naoEncontrado(id));
    }

    public Pokemon criar(Pokemon pokemon) {
        validar(pokemon);
        if (pokemon.getId() == null) {
            pokemon.setId(proximoId());
        } else if (pokemonRepository.existsById(pokemon.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um Pokémon com o ID " + pokemon.getId());
        }
        return pokemonRepository.save(pokemon);
    }

    public Pokemon atualizar(Integer id, Pokemon pokemon) {
        if (!pokemonRepository.existsById(id)) {
            throw naoEncontrado(id);
        }
        validar(pokemon);
        pokemon.setId(id);
        return pokemonRepository.save(pokemon);
    }

    public void excluir(Integer id) {
        if (!pokemonRepository.existsById(id)) {
            throw naoEncontrado(id);
        }
        pokemonRepository.deleteById(id);
    }

    private void validar(Pokemon pokemon) {
        if (pokemon.getName() == null || pokemon.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome do Pokémon é obrigatório");
        }
        if (pokemon.getStats() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Os atributos do Pokémon são obrigatórios");
        }
        if (pokemon.getTypes() == null || pokemon.getTypes().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe pelo menos um tipo");
        }
    }

    private Integer proximoId() {
        return pokemonRepository.findTopByOrderByIdDesc()
                .map(ultimo -> ultimo.getId() + 1)
                .orElse(1);
    }

    private ResponseStatusException naoEncontrado(Integer id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Pokémon não encontrado: " + id);
    }
}