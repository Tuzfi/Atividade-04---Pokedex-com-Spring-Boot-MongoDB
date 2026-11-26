package com.example.demo.config;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.example.demo.model.Pokemon;
import com.example.demo.model.PokemonType;
import com.example.demo.model.Stats;
import com.example.demo.model.Trainer;
import com.example.demo.repository.PokemonRepository;
import com.example.demo.repository.TrainerRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String SCRIPT = "data/Script_Pokedex.sql";

    private final PokemonRepository pokemonRepository;
    private final TrainerRepository trainerRepository;

    public DataSeeder(PokemonRepository pokemonRepository, TrainerRepository trainerRepository) {
        this.pokemonRepository = pokemonRepository;
        this.trainerRepository = trainerRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long totalPokemons = pokemonRepository.count();
        long totalTrainers = trainerRepository.count();

        if (totalPokemons > 0 && totalTrainers > 0) {
            System.out.println("Banco já populado com " + totalPokemons + " Pokémon e " + totalTrainers + " treinadores.");
            return;
        }

        String sql = new ClassPathResource(SCRIPT).getContentAsString(StandardCharsets.UTF_8);

        if (totalPokemons == 0) {
            List<Pokemon> pokemons = montarPokemons(sql);
            pokemonRepository.insert(pokemons);
            System.out.println(pokemons.size() + " Pokémon inseridos a partir do Script_Pokedex.sql.");
        }

        if (totalTrainers == 0) {
            List<Trainer> trainers = montarTreinadores(sql);
            trainerRepository.insert(trainers);
            System.out.println(trainers.size() + " treinadores inseridos a partir do Script_Pokedex.sql.");
        }
    }

    private List<Pokemon> montarPokemons(String sql) {
        Map<Integer, PokemonType> tipos = new HashMap<>();
        for (Map<String, String> linha : lerInsert(sql, "Types")) {
            PokemonType tipo = new PokemonType();
            tipo.setId(inteiro(linha, "ID_Type"));
            tipo.setName(linha.get("Type"));
            tipos.put(tipo.getId(), tipo);
        }

        Map<Integer, List<PokemonType>> tiposPorPokemon = new HashMap<>();
        for (Map<String, String> linha : lerInsert(sql, "Rel_Pokemon_Type")) {
            tiposPorPokemon
                    .computeIfAbsent(inteiro(linha, "ID_Pokemon"), id -> new ArrayList<>())
                    .add(tipos.get(inteiro(linha, "ID_Type")));
        }

        List<Pokemon> pokemons = new ArrayList<>();
        for (Map<String, String> linha : lerInsert(sql, "Pokemon")) {
            Stats stats = new Stats();
            stats.setHp(inteiro(linha, "HP"));
            stats.setAttack(inteiro(linha, "Attack"));
            stats.setDefense(inteiro(linha, "Defense"));
            stats.setSpecialAttack(inteiro(linha, "Special_Attack"));
            stats.setSpecialDefense(inteiro(linha, "Special_Defense"));
            stats.setSpeed(inteiro(linha, "Speed"));

            Pokemon pokemon = new Pokemon();
            pokemon.setId(inteiro(linha, "ID_Pokemon"));
            pokemon.setName(linha.get("Pokemon"));
            pokemon.setStats(stats);
            pokemon.setTypes(tiposPorPokemon.getOrDefault(pokemon.getId(), new ArrayList<>()));
            pokemons.add(pokemon);
        }
        return pokemons;
    }

    private List<Trainer> montarTreinadores(String sql) {
        Map<Integer, List<Integer>> pokemonsPorTreinador = new HashMap<>();
        for (Map<String, String> linha : lerInsert(sql, "Rel_Trainer_Pokemon")) {
            pokemonsPorTreinador
                    .computeIfAbsent(inteiro(linha, "ID_Trainer"), id -> new ArrayList<>())
                    .add(inteiro(linha, "ID_Pokemon"));
        }

        List<Trainer> trainers = new ArrayList<>();
        for (Map<String, String> linha : lerInsert(sql, "Trainers")) {
            Trainer trainer = new Trainer();
            trainer.setId(inteiro(linha, "ID_Trainer"));
            trainer.setName(linha.get("Trainer"));
            trainer.setBadges(inteiro(linha, "Badges"));
            trainer.setPokemonIds(pokemonsPorTreinador.getOrDefault(trainer.getId(), new ArrayList<>()));
            trainers.add(trainer);
        }
        return trainers;
    }

    private List<Map<String, String>> lerInsert(String sql, String tabela) {
        Pattern padrao = Pattern.compile(
                "INSERT INTO\\s+" + tabela + "\\s*\\(([^)]*)\\)\\s*VALUES",
                Pattern.CASE_INSENSITIVE);
        Matcher matcher = padrao.matcher(sql);
        if (!matcher.find()) {
            throw new IllegalStateException("INSERT da tabela " + tabela + " não encontrado no " + SCRIPT);
        }

        List<String> colunas = new ArrayList<>();
        for (String coluna : matcher.group(1).split(",")) {
            colunas.add(coluna.replace("`", "").trim());
        }

        List<Map<String, String>> linhas = new ArrayList<>();
        List<String> valores = null;
        StringBuilder valor = new StringBuilder();
        boolean dentroDeTexto = false;

        for (int i = matcher.end(); i < sql.length(); i++) {
            char c = sql.charAt(i);

            if (dentroDeTexto) {
                if (c == '\'' && i + 1 < sql.length() && sql.charAt(i + 1) == '\'') {
                    valor.append('\'');
                    i++;
                } else if (c == '\'') {
                    dentroDeTexto = false;
                } else {
                    valor.append(c);
                }
            } else if (c == '\'') {
                dentroDeTexto = true;
            } else if (c == '(') {
                valores = new ArrayList<>();
                valor.setLength(0);
            } else if (c == ',' && valores != null) {
                valores.add(valor.toString().trim());
                valor.setLength(0);
            } else if (c == ')' && valores != null) {
                valores.add(valor.toString().trim());
                valor.setLength(0);

                Map<String, String> linha = new LinkedHashMap<>();
                for (int coluna = 0; coluna < colunas.size(); coluna++) {
                    linha.put(colunas.get(coluna), valores.get(coluna));
                }
                linhas.add(linha);
                valores = null;
            } else if (c == ';') {
                break;
            } else if (valores != null) {
                valor.append(c);
            }
        }
        return linhas;
    }

    private int inteiro(Map<String, String> linha, String coluna) {
        return Integer.parseInt(linha.get(coluna));
    }
}
