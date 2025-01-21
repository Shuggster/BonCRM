'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function ProcessDocsPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<any | null>(null);

    const processDocumentation = async () => {
        try {
            setIsProcessing(true);
            setError(null);
            setErrorDetails(null);
            
            const response = await fetch('/api/ai/process-docs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error response:', data);
                setErrorDetails(data);
                throw new Error(data.error || `Error: ${response.status}`);
            }

            setResults(data.results);
        } catch (err) {
            console.error('Processing error:', err);
            setError(err instanceof Error ? err.message : 'Failed to process documentation');
            if (err instanceof Error) {
                setErrorDetails(prev => ({
                    ...prev,
                    message: err.message,
                    stack: err.stack
                }));
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Process Documentation</h2>
                <Button 
                    onClick={processDocumentation}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processing...' : 'Process Documentation'}
                </Button>
            </div>

            {error && (
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                        {error}
                    </div>
                    {errorDetails && (
                        <div className="p-4 bg-gray-50 text-gray-800 rounded-lg overflow-auto">
                            <pre className="whitespace-pre-wrap">
                                {JSON.stringify(errorDetails, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}

            {results && (
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Results:</h3>
                    <div className="grid gap-4">
                        {results.map((result, index) => (
                            <div 
                                key={index}
                                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                            >
                                <p className="text-gray-900 dark:text-gray-100"><strong>File:</strong> {result.file}</p>
                                <p className="text-gray-900 dark:text-gray-100"><strong>Document ID:</strong> {result.documentId}</p>
                                <p className="text-gray-900 dark:text-gray-100"><strong>Status:</strong> {result.status}</p>
                                <p className="text-gray-900 dark:text-gray-100"><strong>Chunks:</strong> {result.chunks}</p>
                                {result.error && (
                                    <p className="text-red-600 dark:text-red-400 mt-2">
                                        <strong>Error:</strong> {result.error}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 