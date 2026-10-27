package com.examly.springapp.model;

import com.examly.springapp.enums.ContentType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_contents")
@JsonIgnoreProperties(ignoreUnknown = true)
public class CourseContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentType contentType;

    @Column(columnDefinition = "TEXT")
    private String contentUrl;

    private String fileName;

    private Long fileSize;

    private String mimeType;

    private Integer contentOrder = 1;

    @Column(name = "module_id")
    private Long moduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", insertable = false, updatable = false)
    @JsonIgnore
    private CourseModule module;

    private String duration;

    private Boolean isDownloadable = true;

    private Long quizId;

    @Column(columnDefinition = "LONGTEXT")
    private String textContent;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public CourseContent() {
    }

    public CourseContent(Long id, String title, String description, ContentType contentType,
                         String contentUrl, Integer contentOrder, Long moduleId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.contentType = contentType;
        this.contentUrl = contentUrl;
        this.contentOrder = contentOrder;
        this.moduleId = moduleId;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.contentOrder == null) {
            this.contentOrder = 1;
        }
        if (this.isDownloadable == null) {
            this.isDownloadable = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public ContentType getContentType() {
        return contentType;
    }

    public void setContentType(ContentType contentType) {
        this.contentType = contentType;
    }

    public String getContentUrl() {
        return contentUrl;
    }

    public void setContentUrl(String contentUrl) {
        this.contentUrl = contentUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Integer getContentOrder() {
        return contentOrder;
    }

    public void setContentOrder(Integer contentOrder) {
        this.contentOrder = contentOrder;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

    public CourseModule getModule() {
        return module;
    }

    public void setModule(CourseModule module) {
        this.module = module;
        if (module != null) {
            this.moduleId = module.getId();
        }
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public Boolean getIsDownloadable() {
        return isDownloadable;
    }

    public void setIsDownloadable(Boolean isDownloadable) {
        this.isDownloadable = isDownloadable;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getTextContent() {
        return textContent;
    }

    public void setTextContent(String textContent) {
        this.textContent = textContent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
