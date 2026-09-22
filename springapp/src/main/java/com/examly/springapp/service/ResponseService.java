package com.examly.springapp.service;

import com.examly.springapp.model.Response;
import java.util.List;

public interface ResponseService {

    List<Response> getAllResponses();

    Response getResponseById(Long id);

    Response addResponse(Response response);

    Response updateResponse(Long id, Response response);

    boolean deleteResponse(Long id);

    List<Response> getByAttempt(Long attemptId);

    List<Response> getByQuestion(Long questionId);

    List<Response> getCorrectResponses();

    List<Response> getIncorrectResponses();
}