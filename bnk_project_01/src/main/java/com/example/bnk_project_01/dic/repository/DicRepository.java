package com.example.bnk_project_01.dic.repository;

import com.example.bnk_project_01.dic.entity.Dic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DicRepository extends JpaRepository<Dic, Long> {
    Optional<Dic> findByWord(String word);
}