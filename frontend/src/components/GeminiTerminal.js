import React, { useState, useEffect, useRef } from 'react';

const GeminiTerminal = ({ contentTitle, onClose }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState([
        '> ═════════════════════════════════════════════════════════════════════════════',
        '>                      Welcome to AI Coding Terminal! 🖥️🤖                    ',
        '> ═════════════════════════════════════════════════════════════════════════════',
        '',
        '> 💻 AI Assistant powered by Gemini - Ask coding questions, get practice!',
        '',
        '> 📝 Type commands or questions:',
        '> /clear    - Clear screen',
        '> /examples - Show coding challenges', 
        '> /help     - Show commands',
        '> /close    - Close terminal',
        '',
        '> Ready for practice! Type: "Give me a JavaScript array exercise" 👇',
        '',
        'user@ai-coding:~$ '
    ]);
    const outputRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const scrollToBottom = () => {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
    };

    const addLine = (text, className = '') => {
        setOutput(prev => [...prev.slice(0, -1), text, 'user@ai-coding:~$ ']);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userCommand = input.trim();
        addLine('> ' + userCommand);
        setInput('');

        // AI responses for common coding queries
        let aiResponse = '';
        const lowerInput = userCommand.toLowerCase();

        if (lowerInput === '/clear') {
            setOutput(['> Terminal cleared! Ready for coding practice.\\nuser@ai-coding:~$ ']);
        } else if (lowerInput === '/help') {
            aiResponse = 'Commands:\\n/clear - Clear screen\\n/examples - Coding challenges\\n/help - This help\\n/close - Close terminal\\n"JavaScript loop" - Ask for examples!';
        } else if (lowerInput === '/examples') {
            aiResponse = `🎯 CODING CHALLENGES:
1. Arrays: Filter even numbers from [1,2,3,4,5,6]
2. Loops: Print fibonacci sequence (first 10 numbers)
3. Functions: Create calculator (add, subtract, multiply)
4. Objects: Create todo list with 3 tasks
5. DOM: Create button that changes color on click

Copy & test code! 💻`;
        } else if (lowerInput.includes('array') || lowerInput.includes('filter') || lowerInput.includes('map')) {
            aiResponse = `🧠 ARRAY EXERCISE:
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 1. Filter even numbers
const evens = numbers.filter(n => n % 2 === 0);
console.log('Evens:', evens);

// 2. Double each number
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled);

// 3. Sum all numbers
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log('Sum:', sum);

// Try these in browser console! 👇`;
        } else if (lowerInput.includes('function') || lowerInput.includes('fib') || lowerInput.includes('factorial')) {
            aiResponse = `🔢 FUNCTION EXERCISE - Factorial:
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120

// RECURSIVE FIBONACCI:
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci F10:', fibonacci(10)); // 55

// Practice: Write factorial iteratively! 💪`;
        } else if (lowerInput.includes('loop') || lowerInput.includes('for') || lowerInput.includes('while')) {
            aiResponse = `🔄 LOOP EXERCISES:

// 1. Print 1 to 10
for (let i = 1; i <= 10; i++) {
  console.log(i);
}

// 2. Sum even numbers 0-20
let sum = 0;
for (let i = 0; i <= 20; i += 2) {
  sum += i;
}
console.log('Even sum:', sum); // 110

// 3. While loop countdown
let count = 5;
while (count > 0) {
  console.log(count);
  count--;
}

// Challenge: Print prime numbers 1-20! 🔍`;
        } else if (lowerInput.includes('object') || lowerInput.includes('json')) {
            aiResponse = `📦 OBJECT EXERCISES:

// Student object
const student = {
  name: 'John',
  age: 20,
  courses: ['React', 'Node.js', 'MongoDB'],
  grade: 'A'
};

console.log(student.name, 'is studying', student.courses.join(', '));

// Add method
student.getAverageGrade = function() {
  return this.grade;
};

// Update
student.courses.push('Express');
console.log(student);

// Practice: Create shopping cart object! 🛒`;
        } else {
            aiResponse = `🤖 AI Response:
"${userCommand}" - Great question! Here's starter code:

\`\`\`
function practice() {
  // Your code here
  console.log('Practice makes perfect!');
}
practice();
\`\`\`

Try: /examples for more challenges or ask "array filter example"! 🎯`;
        }

        // Simulate typing effect
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < aiResponse.length) {
                addLine(aiResponse.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, 20);
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] flex flex-col font-mono text-green-400 p-4">
            <div className="flex justify-between items-center mb-4 p-4 bg-black/50 rounded-t-lg border-b border-green-500">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    💻 AI Coding Terminal - {contentTitle}
                </h2>
                <button onClick={onClose} className="text-red-400 hover:text-red-200 text-xl p-1 rounded hover:bg-red-500/20">
                    ×
                </button>
            </div>
            
            <div ref={outputRef} className="flex-1 min-h-0 overflow-y-auto p-6 bg-black/90 border-x-2 border-green-500 rounded-b-lg mb-4 font-mono text-sm leading-relaxed" style={{ scrollbarWidth: 'thin', scrollbarColor: '#00ff00 #333' }}>
                {output.map((line, idx) => (
                    <div key={idx} className="mb-1 last:mb-0">
                        {line}
                    </div>
                ))}
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 bg-black/50 border-t border-green-500 rounded-b-lg">
                <div className="flex items-end gap-2">
                    <span className="text-yellow-400 whitespace-nowrap flex-shrink-0 text-sm font-bold">user@ai-coding:~$ </span>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Write multi-line code here... (Ctrl+Enter to execute)"
                        className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono text-sm resize-none min-h-[3rem] max-h-[10rem] p-2"
                        rows="1"
                        style={{ overflow: 'hidden' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                </div>
            </form>
        </div>
    );
};

export default GeminiTerminal;

