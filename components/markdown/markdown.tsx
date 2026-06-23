import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type MarkdownProps = {
  children: string;
  className?: string;
};

/**
 * Renders GitHub-flavored markdown with raw HTML support. Styling is applied via
 * arbitrary child selectors since the project does not use the typography plugin.
 */
export const Markdown = ({ children, className }: MarkdownProps) => (
  <div
    className={cn(
      "text-sm leading-relaxed text-foreground break-words",
      "[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold first:[&_h1]:mt-0",
      "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold first:[&_h2]:mt-0",
      "[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold",
      "[&_p]:my-2 first:[&_p]:mt-0 last:[&_p]:mb-0",
      "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
      "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
      "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
      "[&_li]:my-0.5 [&_li]:marker:text-muted-foreground",
      "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
      "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
      "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3",
      "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
      "[&_hr]:my-3 [&_hr]:border-border",
      "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left",
      "[&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1 [&_th]:font-medium",
      "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
      "[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg",
      className
    )}
  >
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
      {children}
    </ReactMarkdown>
  </div>
);
