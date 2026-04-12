import React, { useState, useRef, useEffect } from 'react';

const CodeEditorTerminal = ({ onClose }) => {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const codeRef = useRef(null);
    const outputRef = useRef(null);

    useEffect(() => {
        codeRef.current?.focus();
    }, []);

    const executeCode = () => {
        setIsRunning(true);
        try {
            const logs = [];
            const oldLog = console.log;
            console.log = (...args) => logs.push(args.join(' '));
            
            const func = new Function(code);
            func();
            
            console.log = oldLog;
            setOutput(logs.length ? logs.join('\\n') : 'Code executed successfully!');
        } catch (e) {
            setOutput('Error: ' + e.message);
        }
        setIsRunning(false);
    };

    const clearTerminal = () => {
        setCode('');
        setOutput('');
    };

    const keyDownHandler = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            executeCode();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[10000] flex flex-col p-4" onKeyDown={keyDownHandler} tabIndex={-1}>
            <div className="flex justify-between items-center mb-4 p-4 bg-gray-900 rounded-t-lg border-b border-green-400 text-green-400">
                <h2 className="text-xl font-mono">💻 Professional Code Editor Terminal</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={clearTerminal} 
                        className="px-3 py-1 bg-gray-800 text-green-400 rounded hover:bg-gray-700 text-sm"
                    >
                        Clear
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
                {/* Code Editor */}
                <div className="bg-gray-900 p-4 rounded-lg border border-green-400 border-l-4">
                    <div className="flex justify-between mb-3">
                        <span className="text-green-400 font-mono text-sm">📝 CODE EDITOR (Ctrl+Enter to run)</span>
                    </div>
                    <textarea
                        ref={codeRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-full bg-black text-green-400 font-mono text-sm p-4 rounded border border-green-600 focus:outline-none focus:border-green-400 resize-none"
                        placeholder={`
/* Write your JavaScript code here - Multi-line supported! */

console.log("Hello World!");

// Example: Array operations
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);
console.log("Even numbers:", evens);

// Functions
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
console.log("Factorial 5:", factorial(5));

// Loops
for (let i = 1; i <= 10; i++) {
  console.log("Number", i);
}

Ctrl+Enter to execute!`}
                        onKeyDown={keyDownHandler}
                    />
                </div>

                {/* Output */}
                <div className="bg-gray-900 p-4 rounded-lg border border-green-400 border-r-4">
                    <div className="flex justify-between mb-3">
                        <span className="text-green-400 font-mono text-sm">▶️ OUTPUT</span>
                        {isRunning && <span className="text-yellow-400 text-xs animate-pulse">Running...</span>}
                    </div>
                    <pre 
                        ref={outputRef} 
                        className="w-full h-full bg-black text-green-400 font-mono text-sm p-4 rounded overflow-y-auto whitespace-pre-wrap border border-green-600 max-h-full"
                        style={{ backgroundColor: '#000' }}
                    >
                        {output || 'Output will appear here after running code...'}
                    </pre>
                </div>
            </div>

            <div className="flex gap-3 mt-4 p-4 bg-gray-900 rounded-b-lg border-t border-green-400">
                <button 
                    onClick={executeCode} 
                    disabled={isRunning || !code.trim()}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-mono font-bold text-sm hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                    {isRunning ? '⏳ Executing...' : '▶️ RUN CODE (Ctrl+Enter)'}
                </button>
                <button 
                    onClick={clearTerminal}
                    className="px-6 py-3 bg-gray-700 text-green-400 rounded-lg font-mono hover:bg-gray-600 transition-all"
                >
                    🗑️ Clear
                </button>
                <button 
                    onClick={onClose}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-mono hover:bg-red-700 transition-all"
                >
                    ❌ Close (Esc)
                </button>
            </div>
        </div>
    );
};

export default CodeEditorTerminal;

