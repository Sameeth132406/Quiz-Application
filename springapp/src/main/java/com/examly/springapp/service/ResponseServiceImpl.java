package com.examly.springapp.service;

import com.examly.springapp.model.Response;
import com.examly.springapp.repository.ResponseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResponseServiceImpl implements ResponseService {

    @Autowired
    private ResponseRepository responseRepository;

    @Override
    public List<Response> getAllResponses() {
        return responseRepository.findAll();
    }

    @Override
    public Response getResponseById(Long id) {
        return responseRepository.findById(id).orElse(null);
    }

    @Override
    public Response addResponse(Response response) {
        return responseRepository.save(response);
    }

    @Override
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

    @Override
    public boolean deleteResponse(Long id) {

        if (!responseRepository.existsById(id)) {
            return false;
        }

        responseRepository.deleteById(id);
        return true;
    }

    @Override
    public List<Response> getByAttempt(Long attemptId) {
        return responseRepository.findByAttemptId(attemptId);
    }

    @Override
    public List<Response> getByQuestion(Long questionId) {
        return responseRepository.findByQuestionId(questionId);
    }

    @Override
    public List<Response> getCorrectResponses() {
        return responseRepository.findByCorrect(true);
    }

    @Override
    public List<Response> getIncorrectResponses() {
        return responseRepository.findByCorrect(false);
    }
}