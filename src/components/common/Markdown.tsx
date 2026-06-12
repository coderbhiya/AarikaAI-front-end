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
                    <h1 className="text-2xl font-bold text-[#0f0f0f] mt-8 mb-4 tracking-tight" {...props} />
                ),
                h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold text-[#0f0f0f] mt-6 mb-3 tracking-tight" {...props} />
                ),
                h3: ({ node, ...props }) => (
                    <h3 className="text-[17px] font-bold text-[#0f0f0f] mt-5 mb-2 tracking-tight" {...props} />
                ),

                // Paragraphs and links
                p: ({ node, ...props }) => <p className="text-[#1A1A1A] text-[15.5px] leading-[1.7] mb-5 last:mb-0" {...props} />,
                a: ({ node, ...props }) => (
                    <a
                        {...props}
                        className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 decoration-1 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                ),

                // Bold text
                strong: ({ node, ...props }) => <strong className="font-semibold text-[#0f0f0f]" {...props} />,

                // Blockquotes
                blockquote: ({ node, ...props }) => (
                    <blockquote
                        className="border-l-[3px] pl-4 italic border-gray-300 text-gray-500 py-1 my-5"
                        {...props}
                    />
                ),

                // Code blocks
                code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    return !isInline ? (
                        <div className="relative group/code my-6">
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">
                                    {match[1]}
                                </span>
                            </div>
                            <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                    margin: 0,
                                    borderRadius: '0.5rem',
                                    fontSize: '13.5px',
                                    lineHeight: '1.6',
                                    background: '#1A1A1A'
                                }}
                                {...props}
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        </div>
                    ) : (
                        <code
                            className="px-1.5 py-0.5 rounded-md bg-gray-100/80 border border-gray-200/50 text-[#1A1A1A] text-[13.5px] font-mono"
                            {...props}
                        >
                            {children}
                        </code>
                    );
                },

                // Lists
                ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 text-[#1A1A1A] text-[15.5px] leading-[1.7] space-y-1 mb-5" {...props} />
                ),
                ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-5 text-[#1A1A1A] text-[15.5px] leading-[1.7] space-y-1 mb-5" {...props} />
                ),
                li: ({ node, ...props }) => <li className="pl-1" {...props} />,

                // Tables (GFM)
                table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm">
                        <table
                            className="min-w-full divide-y divide-slate-200"
                            {...props}
                        />
                    </div>
                ),
                thead: ({ node, ...props }) => (
                    <thead className="bg-slate-50" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                    <tbody
                        className="divide-y divide-slate-100 bg-white"
                        {...props}
                    />
                ),
                tr: ({ node, ...props }) => <tr className="hover:bg-slate-50/50 transition-colors" {...props} />,
                th: ({ node, ...props }) => (
                    <th
                        className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500"
                        {...props}
                    />
                ),
                td: ({ node, ...props }) => (
                    <td className="px-6 py-4 text-sm text-slate-900 leading-relaxed font-medium" {...props} />
                ),
            }}
        >
            {text}
        </ReactMarkdown>
    );
};

export default Markdown;
