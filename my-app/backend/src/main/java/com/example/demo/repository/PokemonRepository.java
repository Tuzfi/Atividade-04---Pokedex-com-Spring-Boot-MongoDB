package com.example.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.model.Pokemon;
import java.util.List;

@Repository 

public interface PokemonRepository extends MongoRepository<Pokemon, String>{
    
  // O Spring Data monta a consulta a partir do nome do método:

    // produtos cujo nome contém o texto (sem diferenciar maiúsculas)
    List<Pokemon> findByNomeContainingIgnoreCaseOrderByNomeAsc(String Pokemon);

}
