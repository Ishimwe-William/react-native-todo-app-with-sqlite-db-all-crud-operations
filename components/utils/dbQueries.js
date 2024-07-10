export const getAllTodos = async (db) => {
    return await db.getAllAsync('SELECT * FROM todos');
};

export const getTodoById = async (db, id) => {
    return await db.getAllAsync('SELECT * FROM todos where todos.id = ?', id);
};

export const getExpiredIncompleteTodos = async (db) => {
    const now = new Date().getTime();
    return await db.getAllAsync(
        'SELECT * FROM todos WHERE isComplete = 0 AND reminder IS NOT NULL AND toBeComplete <= ?',
        [now]
    );
};

export const addTodo = async (
    db,
    value,
    description,
    created,
    isComplete,
    toBeComplete,
    reminder
) => {
    return await db.runAsync(
        'INSERT INTO todos (value, description, created, isComplete, toBeComplete, reminder) VALUES (?, ?, ?, ?, ?, ?)',
        [value, description, created, isComplete, toBeComplete, reminder]
    );
};

export const updateTodo = async (db, id, value, description, isComplete, toBeComplete, reminder) => {
    return await db.runAsync(
        'UPDATE todos SET value = ?, description = ?, isComplete = ?, toBeComplete = ?, reminder = ? WHERE id = ?',
        [
            value,
            description,
            isComplete,
            toBeComplete,
            reminder,
            id,
        ]
    );
};

export const completeTodo = async (db, id) => {
    return await db.runAsync(
        'UPDATE todos SET isComplete = not isComplete WHERE id = ?', [id]
    );
};

export const deleteTodo = async (db, id) => {
    return await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
};
