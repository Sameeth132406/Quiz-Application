package com.examly.springapp.model;

import com.examly.springapp.enums.Difficulty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title cannot be empty")
    @Column(nullable = false, unique = true)
    private String title;

    @NotBlank(message = "Description cannot be empty")
    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @NotNull(message = "Duration cannot be null")
    private Integer duration;

    public Quiz() {
    }

    public Quiz(Long id, String title, String description,
                String category, Difficulty difficulty,
                Integer duration) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.difficulty = difficulty;
        this.duration = duration;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }
}