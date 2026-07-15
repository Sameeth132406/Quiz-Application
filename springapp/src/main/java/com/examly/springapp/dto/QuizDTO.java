package com.examly.springapp.dto;

public class QuizDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private Integer duration;

    public QuizDTO() {
    }

    public QuizDTO(Long id, String title,
                   String description,
                   String category,
                   String difficulty,
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

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }
}