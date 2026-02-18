import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpIconProps {
  title: string;
  content: React.ReactNode;
  className?: string;
}

const HelpIcon = ({ title, content, className = '' }: HelpIconProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-primary-500 transition-colors rounded-full hover:bg-gray-100 ${className}`}
        title={`Help: ${title}`}
        aria-label={`Help: ${title}`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                {title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close help"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-gray-700 text-sm leading-relaxed">
              {content}
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpIcon;
