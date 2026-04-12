import React, { useState } from 'react';

const CodingTerminal = ({ content, onClose, token }) => {
    const [code, setCode] = useState('// Write your code here\nconsole.log("Hello World!");');
    const [output, setOutput] = useState('');
    const [activeTab, setActiveTab] = useState('editor');
    const [language, setLanguage] = useState('javascript');
    const [exercises, setExercises] = useState([
        'Write a function that adds two numbers',
        'Create a loop that prints numbers 1-10',
        'Write a function to check if a number is even',
        'Create an array and sort it',
        'Write a program to find the factorial of a number',
        'Create a function that reverses a string',
        'Find the largest number in an array',
        'Create a simple calculator function'
    ]);
    const [selectedExercise, setSelectedExercise] = useState(exercises[0]);

    // Execute code safely
    const executeCode = () => {
        setOutput('> Running code...\n');
        
        const originalLog = console.log;
        let logs = [];
        console.log = (...args) => {
            logs.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
        };
        
        try {
            const func = new Function(code);
            func();
            setOutput('> Output:\n' + (logs.length ? logs.join('\n') : 'No console output. Add console.log() to see results.'));
        } catch (error) {
            setOutput('> Error:\n' + error.message);
        } finally {
            console.log = originalLog;
        }
    };

    const clearOutput = () => {
        setOutput('');
    };

    const resetCode = () => {
        setCode('// Write your code here\nconsole.log("Hello World!");');
        setOutput('');
    };

    const loadExercise = (exercise) => {
        setSelectedExercise(exercise);
        let exerciseCode = '';
        
        switch(exercise) {
            case 'Write a function that adds two numbers':
                exerciseCode = `// Function to add two numbers\nfunction addNumbers(a, b) {\n    // Your code here\n    return a + b;\n}\n\n// Test the function\nconsole.log(addNumbers(5, 3));\nconsole.log(addNumbers(10, 20));`;
                break;
            case 'Create a loop that prints numbers 1-10':
                exerciseCode = `// Loop to print numbers 1-10\nfor(let i = 1; i <= 10; i++) {\n    console.log(i);\n}`;
                break;
            case 'Write a function to check if a number is even':
                exerciseCode = `// Function to check if a number is even\nfunction isEven(num) {\n    // Your code here\n    return num % 2 === 0;\n}\n\n// Test the function\nconsole.log(isEven(4)); // Should print true\nconsole.log(isEven(7)); // Should print false`;
                break;
            case 'Create an array and sort it':
                exerciseCode = `// Create and sort an array\nconst numbers = [5, 2, 8, 1, 9, 3];\nconsole.log('Original array:', numbers);\n\n// Sort the array\nnumbers.sort((a, b) => a - b);\nconsole.log('Sorted array:', numbers);`;
                break;
            case 'Write a program to find the factorial of a number':
                exerciseCode = `// Factorial function\nfunction factorial(n) {\n    if(n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\n// Test the function\nconsole.log('Factorial of 5:', factorial(5));\nconsole.log('Factorial of 3:', factorial(3));`;
                break;
            case 'Create a function that reverses a string':
                exerciseCode = `// Function to reverse a string\nfunction reverseString(str) {\n    // Your code here\n    return str.split('').reverse().join('');\n}\n\n// Test the function\nconsole.log(reverseString('hello')); // Should print 'olleh'\nconsole.log(reverseString('JavaScript'));`;
                break;
            case 'Find the largest number in an array':
                exerciseCode = `// Find largest number in array\nfunction findLargest(arr) {\n    // Your code here\n    return Math.max(...arr);\n}\n\n// Test the function\nconst numbers = [12, 45, 7, 89, 23, 56];\nconsole.log('Largest number:', findLargest(numbers));`;
                break;
            case 'Create a simple calculator function':
                exerciseCode = `// Simple calculator\nfunction calculator(a, b, operation) {\n    // Your code here\n    switch(operation) {\n        case 'add': return a + b;\n        case 'subtract': return a - b;\n        case 'multiply': return a * b;\n        case 'divide': return a / b;\n        default: return 'Invalid operation';\n    }\n}\n\n// Test the calculator\nconsole.log('5 + 3 =', calculator(5, 3, 'add'));\nconsole.log('10 - 4 =', calculator(10, 4, 'subtract'));\nconsole.log('6 * 7 =', calculator(6, 7, 'multiply'));`;
                break;
            default:
                exerciseCode = `// Write your code here\nconsole.log("Let's code!");`;
        }
        
        setCode(exerciseCode);
        setOutput('');
    };

    const getLanguageHint = () => {
        switch(language) {
            case 'javascript':
                return '💡 Tip: Use console.log() to print values. Variables use let/const.';
            case 'python':
                return '💡 Tip: Use print() to output. Indentation matters in Python!';
            case 'html':
                return '💡 Tip: Write HTML tags. Use CSS for styling, JavaScript for interactivity.';
            default:
                return '💡 Tip: Write your code and click Run to test it!';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full h-[95vh] max-w-[98vw] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">💻</div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Coding Terminal</h2>
                            <p className="text-purple-200 text-sm">Practice coding with built-in exercises</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Language Selector */}
                <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
                    <div className="flex gap-3 items-center">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm border border-gray-600"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="html">HTML/CSS</option>
                        </select>
                        <span className="text-gray-400 text-sm">{getLanguageHint()}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {content?.title && `📖 Lesson: ${content.title.substring(0, 40)}`}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700 bg-gray-800">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`px-8 py-4 font-medium transition text-base ${activeTab === 'editor' ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        📝 Code Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('exercises')}
                        className={`px-8 py-4 font-medium transition text-base ${activeTab === 'exercises' ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        📚 Exercises
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex">
                    {activeTab === 'editor' && (
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Code Editor */}
                            <div className="flex-1 flex flex-col border-r border-gray-700">
                                <div className="bg-gray-800 p-4 flex gap-3">
                                    <button
                                        onClick={executeCode}
                                        className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                    >
                                        ▶ Run Code
                                    </button>
                                    <button
                                        onClick={clearOutput}
                                        className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={resetCode}
                                        className="bg-yellow-600 text-white px-5 py-2 rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                                    >
                                        Reset
                                    </button>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="flex-1 bg-gray-900 text-green-400 font-mono text-base p-5 outline-none resize-none"
                                    style={{ fontFamily: 'Consolas, monospace' }}
                                    spellCheck={false}
                                />
                            </div>

                            {/* Output Panel */}
                            <div className="w-full md:w-[400px] flex flex-col bg-gray-800">
                                <div className="bg-gray-700 p-4">
                                    <h3 className="text-white font-semibold text-base">📤 Output</h3>
                                </div>
                                <pre className="flex-1 bg-gray-900 text-gray-300 font-mono text-sm p-5 overflow-auto whitespace-pre-wrap">
                                    {output || '> Click "Run" to execute your code'}
                                </pre>
                            </div>
                        </div>
                    )}

                    {activeTab === 'exercises' && (
                        <div className="flex-1 overflow-y-auto p-8">
                            <h3 className="text-3xl font-bold text-white mb-6">📚 Coding Exercises</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                {exercises.map((exercise, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => loadExercise(exercise)}
                                        className={`text-left p-5 rounded-xl transition-all duration-200 ${selectedExercise === exercise ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-102'}`}
                                    >
                                        <div className="font-semibold text-lg">{idx + 1}. {exercise}</div>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-6 mb-6">
                                <h4 className="text-purple-300 font-semibold text-lg mb-3">📖 Current Exercise</h4>
                                <p className="text-white text-base mb-4">{selectedExercise}</p>
                                <button
                                    onClick={() => {
                                        loadExercise(selectedExercise);
                                        setActiveTab('editor');
                                    }}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition text-base font-medium"
                                >
                                    ✏️ Start Coding
                                </button>
                            </div>
                            
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h4 className="text-yellow-400 font-semibold text-lg mb-3">💡 Tips</h4>
                                <ul className="text-gray-300 space-y-2 text-sm">
                                    <li>• Write your solution in the Code Editor tab</li>
                                    <li>• Click "Run" to test your code</li>
                                    <li>• Use console.log() to see output</li>
                                    <li>• Try solving exercises in different ways</li>
                                    <li>• Write comments to explain your thought process</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodingTerminal;