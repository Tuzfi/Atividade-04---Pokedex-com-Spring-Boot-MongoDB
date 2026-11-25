package com.example.demo.service;

import org.springframework.stereotype.Service;
import com.example.demo.model.Pokemon;
import com.example.demo.repository.PokemonRepository;

@Service 

public class PokemonService {


    private final PokemonRepository pokemonRepository;

    public PokemonService(PokemonRepository pokemonRepository){
        this.pokemonRepository = pokemonRepository;
    }




        public void excluir(String Pokemon) {
        if (!pokemonRepository.existsById(Pokemon)) {
            throw new IllegalArgumentException(Pokemon);
        }
        pokemonRepository.deleteById(Pokemon);
    }

}
