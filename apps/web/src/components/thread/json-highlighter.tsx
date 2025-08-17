import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { FC } from "react";

export const JsonHighlighter: FC<{ children: string; className?: string }> = ({
  children,
  className,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <SyntaxHighlighter
      language="json"
      style={isDark ? oneDark : oneLight}
      customStyle={{
        margin: 0,
        padding: "0.5rem",
        fontSize: "0.875rem",
        background: "transparent",
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      }}
      className={className}
      wrapLines={true}
      wrapLongLines={true}
    >
      {children}
    </SyntaxHighlighter>
  );
};