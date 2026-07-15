package com.examly.springapp.service;

import com.examly.springapp.model.Response;
import com.examly.springapp.repository.ResponseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResponseService {

    @Autowired
    private ResponseRepository responseRepository;

    public List<Response> getAllResponses() {
        return responseRepository.findAll();
    }

    public Response getResponseById(Long id) {
        return responseRepository.findById(id).orElse(null);
    }

    public Response addResponse(Response response) {
        return responseRepository.save(response);
    }

    public Response updateResponse(Long id, Response response) {

        Response existing = responseRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setAttemptId(response.getAttemptId());
        existing.setQuestionId(response.getQuestionId());
        existing.setSelectedAnswer(response.getSelectedAnswer());
        existing.setCorrect(response.isCorrect());

        return responseRepository.save(existing);
    }

    public boolean deleteResponse(Long id) {

        if (!responseRepository.existsById(id)) {
            return false;
        }

        responseRepository.deleteById(id);
        return true;
    }

    public List<Response> getByAttempt(Long attemptId) {
        return responseRepository.findByAttemptId(attemptId);
    }

    public List<Response> getByQuestion(Long questionId) {
        return responseRepository.findByQuestionId(questionId);
    }

    public List<Response> getCorrectResponses() {
        return responseRepository.findByCorrect(true);
    }

    public List<Response> getIncorrectResponses() {
        return responseRepository.findByCorrect(false);
    }
}