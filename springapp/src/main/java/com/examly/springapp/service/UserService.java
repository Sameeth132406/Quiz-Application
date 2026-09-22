package com.examly.springapp.service;

import com.examly.springapp.model.User;
import java.util.List;

public interface UserService {

    List<User> getAllUsers();

    User getUserById(Long id);

    User addUser(User user);

    User updateUser(Long id, User user);

    boolean deleteUser(Long id);

    User login(String email, String password);
}