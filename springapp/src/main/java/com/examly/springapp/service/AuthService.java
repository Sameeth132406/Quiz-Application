package com.examly.springapp.service;

import com.examly.springapp.dto.LoginRequestDTO;
import com.examly.springapp.dto.LoginResponseDTO;
import com.examly.springapp.model.User;

public interface AuthService {

    User register(User user);

    LoginResponseDTO login(LoginRequestDTO request);

}