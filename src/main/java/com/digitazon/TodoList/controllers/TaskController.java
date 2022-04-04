package com.digitazon.TodoList.controllers;

import com.digitazon.TodoList.entities.Category;
import com.digitazon.TodoList.entities.Task;
import com.digitazon.TodoList.repositories.CategoryRepository;
import com.digitazon.TodoList.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;


@RestController //farà output solo con un json
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/")
    public Iterable<Task> home() {
        Iterable<Task> tasks = taskRepository.findAll(Sort.by(Sort.Direction.ASC, "created"));
        System.out.println(tasks);
        return tasks;
    }

    @GetMapping("/{id}")
    public Task read(@PathVariable int id) {
        return taskRepository.findById(id).orElseThrow( );
    }

    @PostMapping("/add")
    public Task create(@RequestBody Task newTask) {  //prende request body, li mappa in oggetto di tipo task e lo mette a disposizione
        Task savedTask = taskRepository.save(newTask);
        System.out.println(newTask.getCategory());
        Category category = categoryRepository.findById(newTask.getCategory().getId()).orElseThrow();
        savedTask.setCategory(category);
        return savedTask;
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) {
        taskRepository.deleteById(id);
        return "ok";
    }

    /*
    @PutMapping("/{id}")
    public Task update(@PathVariable int id, @RequestBody Task updatedTask) throws Exception {
        Task task = taskRepository.findById(id).orElseThrow();
        if (task.isDone() && !Objects.equals(updatedTask.getName(), task.getName())) {
            throw new Exception("cannot update done tasks");
        } else {
            task.setDone(updatedTask.isDone());
            task.setName(updatedTask.getName());
            return taskRepository.save(task);
        }
    }
    */

    @PutMapping("/{id}")
    public Task updateDone(@PathVariable int id, @RequestBody Task updatedTask) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setDone(updatedTask.isDone());
        return taskRepository.save(task);
    }

    @PutMapping("/{id}/update-name")
    public Task updateName(@PathVariable int id, @RequestBody Task updatedTask) throws Exception {
        Task task = taskRepository.findById(id).orElseThrow();
        if (updatedTask.isDone()) {
            throw new Exception("cannot update done tasks");
        }
        task.setName(updatedTask.getName());
        return taskRepository.save(task);
    }

    /*
    @PostMapping("/{id}/edit")
    public Task alternativeUpdate(@PathVariable int id, @RequestBody Task updatedTask) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setDone(updatedTask.isDone());
        task.setName(updatedTask.getName());
        return taskRepository.save(task);
    }

    @PostMapping("/{id}/delete")
    public String alternativeDelete(@PathVariable int id) {
        taskRepository.deleteById(id);
        return "ok";
    }
     */

    @DeleteMapping("/delete-all")
    public String deleteAllTasks() {
        taskRepository.deleteAll();
        return "ok";
    }

}
