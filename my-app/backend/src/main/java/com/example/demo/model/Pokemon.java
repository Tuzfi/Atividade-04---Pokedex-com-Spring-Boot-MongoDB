package com.example.demo.model;

import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.Id;

@Document(collection = "Pokemon")
public class Pokemon {
    @Id
    private int ID_Pokemon;
    private String Pokemon;
    private int HP;
    private int Attack;
    private int Special_Attack;
    private int Special_Defense;
    private int Speed;

    public Pokemon() {
    }

    public Pokemon(int iD_Pokemon, String pokemon, int hP, int attack, int special_Attack, int special_Defense,
            int speed) {
        ID_Pokemon = iD_Pokemon;
        Pokemon = pokemon;
        HP = hP;
        Attack = attack;
        Special_Attack = special_Attack;
        Special_Defense = special_Defense;
        Speed = speed;
    }

    public int getID_Pokemon() {
        return ID_Pokemon;
    }

    public void setID_Pokemon(int iD_Pokemon) {
        ID_Pokemon = iD_Pokemon;
    }

    public String getPokemon() {
        return Pokemon;
    }

    public void setPokemon(String pokemon) {
        Pokemon = pokemon;
    }

    public int getHP() {
        return HP;
    }

    public void setHP(int hP) {
        HP = hP;
    }

    public int getAttack() {
        return Attack;
    }

    public void setAttack(int attack) {
        Attack = attack;
    }

    public int getSpecial_Attack() {
        return Special_Attack;
    }

    public void setSpecial_Attack(int special_Attack) {
        Special_Attack = special_Attack;
    }

    public int getSpecial_Defense() {
        return Special_Defense;
    }

    public void setSpecial_Defense(int special_Defense) {
        Special_Defense = special_Defense;
    }

    public int getSpeed() {
        return Speed;
    }

    public void setSpeed(int speed) {
        Speed = speed;
    }
}
