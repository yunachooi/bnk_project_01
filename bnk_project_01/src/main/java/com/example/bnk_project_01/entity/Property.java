package com.example.bnk_project_01.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bnk_property")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Property {
	@Id
    @Column(name = "prno")
    private String prno;

    @Column(name = "prname")
    private String prname;

    @OneToMany(mappedBy = "property")
    private List<Attribute> attributes = new ArrayList<>();
}
