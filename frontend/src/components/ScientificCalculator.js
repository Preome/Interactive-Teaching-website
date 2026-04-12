import React, { useState } from 'react';

const ScientificCalculator = ({ content, onClose }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [history, setHistory] = useState([]);
    const [isScientific, setIsScientific] = useState(false);

    const appendToInput = (value) => {
        setInput(prev => prev + value);
    };

    const clearInput = () => {
        setInput('');
        setResult('');
    };

    const deleteLast = () => {
        setInput(prev => prev.slice(0, -1));
    };

    const calculate = () => {
        try {
            // Replace mathematical functions
            let expression = input
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/√\(/g, 'Math.sqrt(')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/asin\(/g, 'Math.asin(')
                .replace(/acos\(/g, 'Math.acos(')
                .replace(/atan\(/g, 'Math.atan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/\^/g, '**');
            
            const calculatedResult = eval(expression);
            setResult(calculatedResult);
            
            // Add to history
            setHistory(prev => [{ expression: input, result: calculatedResult }, ...prev].slice(0, 10));
        } catch (error) {
            setResult('Error');
        }
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const loadFromHistory = (expression) => {
        setInput(expression);
        setResult('');
    };

    const calculateSquare = () => {
        try {
            const value = eval(input);
            setInput(prev => `${prev}²`);
            setResult(value * value);
        } catch (error) {
            setResult('Error');
        }
    };

    const calculateSquareRoot = () => {
        appendToInput('√(');
    };

    const calculatePower = () => {
        appendToInput('^');
    };

    const calculatePercentage = () => {
        try {
            const value = eval(input);
            setResult(value / 100);
        } catch (error) {
            setResult('Error');
        }
    };

    const calculateFactorial = () => {
        try {
            const value = parseInt(eval(input));
            let fact = 1;
            for (let i = 2; i <= value; i++) fact *= i;
            setResult(fact);
        } catch (error) {
            setResult('Error');
        }
    };

    const buttons = {
        basic: [
            '7', '8', '9', '/', 
            '4', '5', '6', '*', 
            '1', '2', '3', '-', 
            '0', '.', '=', '+'
        ],
        scientific: [
            'sin', 'cos', 'tan', '√',
            'asin', 'acos', 'atan', '^',
            'log', 'ln', 'π', 'e',
            '(', ')', '!', '%'
        ]
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">🧮</div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Scientific Calculator</h2>
                            <p className="text-blue-200 text-sm">{content.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsScientific(!isScientific)}
                            className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-lg hover:bg-opacity-30 transition text-sm"
                        >
                            {isScientific ? 'Basic' : 'Scientific'}
                        </button>
                        <button 
                            onClick={onClose} 
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Display */}
                <div className="bg-gray-800 p-4 m-4 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Expression</div>
                    <div className="text-white text-2xl font-mono break-all min-h-[60px]">
                        {input || '0'}
                    </div>
                    <div className="text-green-400 text-xl font-mono mt-2 break-all">
                        {result !== '' && `= ${result}`}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 p-4">
                    {/* Calculator Buttons */}
                    <div className="flex-1">
                        <div className="grid grid-cols-4 gap-2">
                            {/* Basic Buttons */}
                            {buttons.basic.map((btn, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (btn === '=') calculate();
                                        else appendToInput(btn);
                                    }}
                                    className={`p-4 rounded-xl font-bold text-lg transition transform hover:scale-105 ${
                                        btn === '=' 
                                            ? 'bg-green-600 text-white hover:bg-green-700 col-span-1' 
                                            : 'bg-gray-700 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    {btn}
                                </button>
                            ))}
                            
                            {/* Scientific Buttons */}
                            {isScientific && buttons.scientific.map((btn, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (btn === '!') calculateFactorial();
                                        else if (btn === '%') calculatePercentage();
                                        else appendToInput(btn + '(');
                                    }}
                                    className="p-3 rounded-xl font-mono text-sm bg-purple-700 text-white hover:bg-purple-600 transition transform hover:scale-105"
                                >
                                    {btn}
                                </button>
                            ))}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            <button
                                onClick={clearInput}
                                className="p-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                C
                            </button>
                            <button
                                onClick={deleteLast}
                                className="p-3 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 transition"
                            >
                                ⌫
                            </button>
                            <button
                                onClick={calculateSquare}
                                className="p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
                            >
                                x²
                            </button>
                            <button
                                onClick={calculateSquareRoot}
                                className="p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
                            >
                                √x
                            </button>
                        </div>
                    </div>

                    {/* History Panel */}
                    <div className="w-full md:w-64 bg-gray-800 rounded-xl p-3 overflow-y-auto max-h-[300px] md:max-h-none">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-white font-semibold">History</h3>
                            <button
                                onClick={clearHistory}
                                className="text-xs text-gray-400 hover:text-white transition"
                            >
                                Clear
                            </button>
                        </div>
                        {history.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center">No history yet</p>
                        ) : (
                            <div className="space-y-2">
                                {history.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => loadFromHistory(item.expression)}
                                        className="bg-gray-700 p-2 rounded-lg cursor-pointer hover:bg-gray-600 transition"
                                    >
                                        <div className="text-gray-300 text-xs font-mono break-all">
                                            {item.expression}
                                        </div>
                                        <div className="text-green-400 text-sm font-mono">
                                            = {item.result}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Panel */}
                <div className="bg-gray-800 p-3 m-4 rounded-lg">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                        <div className="flex gap-4">
                            <span>🧮 Basic operations: + - * /</span>
                            <span>📐 Scientific: sin, cos, tan, log</span>
                            <span>📊 Use parentheses for complex expressions</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScientificCalculator;