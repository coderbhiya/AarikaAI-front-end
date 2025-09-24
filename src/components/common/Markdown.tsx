import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Markdown = ({ text }) => {
    
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                // Headings
                h1: ({ node, ...props }) => (
                    <h1 className={`text-3xl font-bold my-4 text-white}`} {...props} />
                ),
                h2: ({ node, ...props }) => (
                    <h2 className={`text-2xl font-semibold my-3 text-white}`} {...props} />
                ),
                h3: ({ node, ...props }) => (
                    <h3 className={`text-xl font-semibold my-2 text-white}`} {...props} />
                ),

                // Paragraphs and links
                p: ({ node, ...props }) => <p className={`my-2 text-gray-300}`} {...props} />,
                a: ({ node, ...props }) => (
                    <a
                        {...props}
                        className={`text-emerald-400 hover:text-emerald-300 font-medium underline`}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                ),

                // Blockquotes
                blockquote: ({ node, ...props }) => (
                    <blockquote
                        className={`border-l-4 pl-4 italic my-4 border-emerald-500 text-gray-300`}
                        {...props}
                    />
                ),

                // Code blocks
                code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                        <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-md my-4"
                            {...props}
                        >
                            {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                    ) : (
                        <code
                            className={`px-1 rounded bg-gray-700 text-gray-200`}
                            {...props}
                        >
                            {children}
                        </code>
                    );
                },

                // Lists
                ul: ({ node, ...props }) => (
                    <ul className={`list-disc pl-6 my-4 text-gray-300`} {...props} />
                ),
                ol: ({ node, ...props }) => (
                    <ol className={`list-decimal pl-6 my-4 text-gray-300`} {...props} />
                ),
                li: ({ node, ...props }) => <li className={`my-1 text-gray-300`} {...props} />,

                // Tables (GFM)
                table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-6">
                        <table
                            className={`min-w-full divide-y border divide-gray-700 border-gray-700`}
                            {...props}
                        />
                    </div>
                ),
                thead: ({ node, ...props }) => (
                    <thead className={`bg-gray-800`} {...props} />
                ),
                tbody: ({ node, ...props }) => (
                    <tbody
                        className={`divide-y bg-gray-900 divide-gray-700`}
                        {...props}
                    />
                ),
                tr: ({ node, ...props }) => <tr {...props} />,
                th: ({ node, ...props }) => (
                    <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300`}
                        {...props}
                    />
                ),
                td: ({ node, ...props }) => (
                    <td className={`px-6 py-4 whitespace-nowrap text-gray-300`} {...props} />
                ),
            }}
        >
            {text}
        </ReactMarkdown>
    );
};

export default Markdown;
