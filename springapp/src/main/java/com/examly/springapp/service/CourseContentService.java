package com.examly.springapp.service;

import com.examly.springapp.dto.CourseContentDTO;
import com.examly.springapp.enums.ContentType;
import com.examly.springapp.model.CourseContent;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CourseContentService {

    CourseContent addContent(Long moduleId, CourseContent content, Long currentUserId, boolean isAdmin);

    CourseContent uploadAndAddContent(Long moduleId, String title, String description, ContentType contentType,
                                      MultipartFile file, String contentUrl, Integer contentOrder,
                                      String duration, Boolean isDownloadable, Long quizId, String textContent,
                                      Long currentUserId, boolean isAdmin);

    List<CourseContentDTO> getContentsByModuleId(Long moduleId, Long currentUserId);

    CourseContentDTO getContentById(Long contentId, Long currentUserId);

    CourseContent updateContent(Long contentId, CourseContent content, Long currentUserId, boolean isAdmin);

    boolean deleteContent(Long contentId, Long currentUserId, boolean isAdmin);

    CourseContent uploadFileToContent(Long contentId, MultipartFile file, Long currentUserId, boolean isAdmin);
}
