// src/App.tsx

import { TodoProvider, ThemeProvider } from './context';
import { Layout, TodoForm, TodoSearch, TodoFilters, TodoStats, TodoList } from './components';
import styles from './App.module.css';

function TodoApp() {
  return (
    <Layout>
      <div className={styles.container}>
        <section className={styles.section} aria-labelledby="add-todo-heading">
          <h2 id="add-todo-heading" className={styles.srOnly}>
            Add new todo
          </h2>
          <TodoForm />
        </section>

        <section className={styles.section} aria-labelledby="search-heading">
          <h2 id="search-heading" className={styles.srOnly}>
            Search todos
          </h2>
          <TodoSearch />
        </section>

        <section className={styles.section} aria-labelledby="stats-heading">
          <h2 id="stats-heading" className={styles.srOnly}>
            Statistics
          </h2>
          <TodoStats />
        </section>

        <section className={styles.section} aria-labelledby="filters-heading">
          <h2 id="filters-heading" className={styles.srOnly}>
            Filters
          </h2>
          <TodoFilters />
        </section>

        <section className={styles.section} aria-labelledby="todos-heading">
          <h2 id="todos-heading" className={styles.srOnly}>
            Todo list
          </h2>
          <TodoList />
        </section>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TodoProvider>
        <TodoApp />
      </TodoProvider>
    </ThemeProvider>
  );
}
