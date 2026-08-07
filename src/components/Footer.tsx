import React from 'react';

export const Footer: React.FC = () => {
  return (
    <div className="px-6 py-8 text-center border-t border-ink/10">
      <p className="text-xs font-mono text-ink-3 uppercase tracking-wide">
        Fan-made · not affiliated with Untold
      </p>
      <a
        href="https://www.linkedin.com/in/cristi-pop/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 text-xs font-mono text-ink-2 underline underline-offset-2 decoration-ink-3 transition-colors hover:text-ink"
      >
        Feedback? DM me on LinkedIn
      </a>
    </div>
  );
};
