package com.example.demo.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Pokemon;
import com.example.demo.service.PokemonService;

@RestController
@RequestMapping("/api/pokemons")
public class PokemonController {

    private final PokemonService pokemonService;

    public PokemonController(PokemonService pokemonService) {
        this.pokemonService = pokemonService;
    }

    @GetMapping
    public List<Pokemon> listar(@RequestParam(required = false) String nome,
                                @RequestParam(required = false) String tipo) {
        return pokemonService.listar(nome, tipo);
    }

    @GetMapping("/{id}")
    public Pokemon buscarPorId(@PathVariable Integer id) {
        return pokemonService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Pokemon> criar(@RequestBody Pokemon pokemon) {
        Pokemon criado = pokemonService.criar(pokemon);
        return ResponseEntity.created(URI.create("/api/pokemons/" + criado.getId())).body(criado);
    }

    @PutMapping("/{id}")
    public Pokemon atualizar(@PathVariable Integer id, @RequestBody Pokemon pokemon) {
        return pokemonService.atualizar(id, pokemon);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        pokemonService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}