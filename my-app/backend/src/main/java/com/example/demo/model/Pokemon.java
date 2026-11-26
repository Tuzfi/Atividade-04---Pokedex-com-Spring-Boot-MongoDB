package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "pokemons")

public class Pokemon {

    @Id 
    Integer id;

    String name;

    Stats stats;

    List<PokemonType> types;


    public Pokemon() {
    }


    public Integer getId() {
        return id;
    }


    public void setId(Integer id) {
        this.id = id;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public Stats getStats() {
        return stats;
    }


    public void setStats(Stats stats) {
        this.stats = stats;
    }


    public List<PokemonType> getTypes() {
        return types;
    }


    public void setTypes(List<PokemonType> types) {
        this.types = types;
    }

    

}