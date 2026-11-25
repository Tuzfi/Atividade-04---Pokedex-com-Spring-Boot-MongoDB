package com.example.demo.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.service.PokemonService;
@RestController 
@RequestMapping ("/api/Pokemons")


public class PokemonController {
    private final PokemonService pokemonService;
        public PokemonController(PokemonService pokemonService){
        this.pokemonService = pokemonService;   
    }
        
}
