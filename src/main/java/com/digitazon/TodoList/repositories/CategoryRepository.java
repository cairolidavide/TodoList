package com.digitazon.TodoList.repositories;

import com.digitazon.TodoList.entities.Category;
import org.springframework.data.repository.CrudRepository;

public interface CategoryRepository extends CrudRepository<Category, Integer> {
}
