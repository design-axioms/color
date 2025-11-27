import type { ComponentChildren, JSX } from 'preact';

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {
  children: ComponentChildren;
  className?: string;
}

export const Diagram = ({ children, className = '', ...props }: Props) => {
  return (
    <div className={`not-content ${className}`} {...props}>
      {children}
    </div>
  );
};
