export interface ApiTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface TodosResponse {
  todos: ApiTodo[];
  total: number;
  skip: number;
  limit: number;
}

// те, що ми шлемо на POST/PUT/PATCH (DummyJSON не знає description/priority/category)
export interface ApiTodoPayload {
  todo: string;
  completed: boolean;
  userId: number;
}