package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Pokemon;

@Repository
public interface PokemonRepository extends MongoRepository<Pokemon, Integer> {

    List<Pokemon> findByNameContainingIgnoreCaseOrderByIdAsc(String name);

    List<Pokemon> findByTypesNameIgnoreCaseOrderByIdAsc(String typeName);

    Optional<Pokemon> findTopByOrderByIdDesc();
}