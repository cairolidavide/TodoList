package com.digitazon.TodoList.repositories;


import com.digitazon.TodoList.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Integer> {

}
