package com.examly.springapp.model;

import com.examly.springapp.enums.QuestionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long quizId;

    @NotBlank(message = "Question cannot be empty")
    @Column(nullable = false)
    private String questionText;

    @Column(nullable = false)
    private String optionA;

    @Column(nullable = false)
    private String optionB;

    @Column(nullable = false)
    private String optionC;

    @Column(nullable = false)
    private String optionD;

    @Column(nullable = false)
    private String correctAnswer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType;

    @NotNull(message = "Marks cannot be null")
    @Column(nullable = false)
    private Integer marks;

    public Question() {
    }

    public Question(Long id,
                    Long quizId,
                    String questionText,
                    String optionA,
                    String optionB,
                    String optionC,
                    String optionD,
                    String correctAnswer,
                    QuestionType questionType,
                    Integer marks) {

        this.id = id;
        this.quizId = quizId;
        this.questionText = questionText;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctAnswer = correctAnswer;
        this.questionType = questionType;
        this.marks = marks;
    }

    public Long getId() {
        return id;
    }

    public Long getQuizId() {
        return quizId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public Integer getMarks() {
        return marks;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }
}