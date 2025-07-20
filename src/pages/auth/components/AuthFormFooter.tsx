import { Link } from "react-router-dom";

interface AuthFormFooterProps {
  text: string;
  linkText: string;
  linkTo: string;
}

export default function AuthFormFooter({
  text,
  linkText,
  linkTo,
}: AuthFormFooterProps) {
  return (
    <div className="px-8 py-3 border-t border-light-border dark:border-dark-border text-center">
      <p className="text-sm text-light-fg/80 dark:text-dark-nav-inactive">
        {text}{" "}
        <Link
          to={linkTo}
          className="font-medium text-light-accent dark:text-dark-accent hover:text-light-fg/80 dark:hover:text-dark-brown transition-colors duration-300 ease-in-out hover:underline"
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
}
