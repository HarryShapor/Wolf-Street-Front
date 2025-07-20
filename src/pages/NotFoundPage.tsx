import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg text-center p-8">
    <h1 className="text-5xl font-bold mb-4 text-light-accent dark:text-dark-accent">404</h1>
    <p className="text-xl mb-6">Страница не найдена</p>
    <Link to="/" className="text-light-accent dark:text-dark-accent underline text-lg">На главную</Link>
  </div>
);

export default NotFoundPage; 