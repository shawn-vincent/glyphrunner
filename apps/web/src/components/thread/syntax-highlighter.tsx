import { PrismAsyncLight as SyntaxHighlighterPrism } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import { coldarkDark, coldarkCold } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FC } from "react";
import { useTheme } from "next-themes";

// Register languages you want to support
SyntaxHighlighterPrism.registerLanguage("js", tsx);
SyntaxHighlighterPrism.registerLanguage("jsx", tsx);
SyntaxHighlighterPrism.registerLanguage("ts", tsx);
SyntaxHighlighterPrism.registerLanguage("tsx", tsx);
SyntaxHighlighterPrism.registerLanguage("python", python);
SyntaxHighlighterPrism.registerLanguage("json", json);

interface SyntaxHighlighterProps {
  children: string;
  language: string;
  className?: string;
}

export const SyntaxHighlighter: FC<SyntaxHighlighterProps> = ({
  children,
  language,
  className,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <SyntaxHighlighterPrism
      language={language}
      style={isDark ? coldarkDark : coldarkCold}
      customStyle={{
        margin: 0,
        width: "100%",
        background: "transparent",
        padding: "1.5rem 1rem",
      }}
      className={className}
    >
      {children}
    </SyntaxHighlighterPrism>
  );
};

// Specialized JSON highlighter for tool call values
export const JsonHighlighter: FC<{ children: string; className?: string }> = ({
  children,
  className,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <SyntaxHighlighterPrism
      language="json"
      style={isDark ? coldarkDark : coldarkCold}
      customStyle={{
        margin: 0,
        width: "100%",
        background: "transparent",
        padding: "0.5rem",
        fontSize: "0.875rem",
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      }}
      className={className}
      wrapLines={true}
      wrapLongLines={true}
    >
      {children}
    </SyntaxHighlighterPrism>
  );
};
