package com.examly.springapp.controller;

import com.examly.springapp.model.Course;
import com.examly.springapp.service.CourseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourse(@PathVariable Long id) {

        Course course = courseService.getCourseById(id);

        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Course not found");
        }

        return ResponseEntity.ok(course);
    }

    @PostMapping
    public ResponseEntity<Course> addCourse(
            @RequestBody Course course) {

        return new ResponseEntity<>(
                courseService.addCourse(course),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @RequestBody Course course) {

        Course updated = courseService.updateCourse(id, course);

        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Course not found");
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {

        if (!courseService.deleteCourse(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Course not found");
        }

        return ResponseEntity.ok("Course deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourse(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                courseService.searchCourse(keyword));
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<Course>> getByInstructor(
            @RequestParam String instructor) {

        return ResponseEntity.ok(
                courseService.getByInstructor(instructor));
    }
}