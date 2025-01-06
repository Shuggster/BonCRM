import { GroqProvider } from './providers/groq';
import { DeepseekProvider } from './providers/deepseek';
import { GeminiProvider } from './providers/gemini';

async function testProvider(name: string, provider: GroqProvider | DeepseekProvider | GeminiProvider) {
    console.log(`\n=== Testing ${name} Provider ===`);
    try {
        // Test 1: Basic Response
        console.log('1️⃣ Testing basic response...');
        console.time('Response Time');
        const response = await provider.generateResponse("What are the three main benefits of using a CRM system? Be concise.");
        console.timeEnd('Response Time');
        console.log('Response:', response);

        // Test 2: Streaming
        console.log('\n2️⃣ Testing streaming...');
        console.time('Streaming Time');
        process.stdout.write('Streaming response: ');
        for await (const chunk of provider.streamResponse("List three ways AI can improve customer service. Be brief.")) {
            process.stdout.write(chunk);
        }
        console.timeEnd('Streaming Time');
        console.log('\n');

        // Test 3: Embeddings (if available)
        console.log('\n3️⃣ Testing embeddings...');
        console.time('Embeddings Time');
        const embeddings = await provider.generateEmbeddings("Test embedding generation with a customer service related query about handling complaints efficiently.");
        console.timeEnd('Embeddings Time');
        if (Array.isArray(embeddings)) {
            console.log('✅ Embeddings generated successfully');
            console.log('📏 Embeddings length:', embeddings.length);
            console.log('🔍 First few values:', embeddings.slice(0, 3));
        } else {
            console.log('❌ Embeddings generation failed or returned unexpected format');
            console.log('Received:', embeddings);
        }

        console.log('\n✅ All tests completed for', name);
    } catch (error) {
        console.log('\n❌ Error testing', name);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
    }
}

// Allow testing individual providers or all
const provider = process.argv[2]?.toLowerCase();

async function runTests() {
    console.log('🚀 Starting provider tests...\n');
    console.log('Make sure you have set up the following environment variables:');
    console.log('- GROQ_API_KEY');
    console.log('- DEEPSEEK_API_KEY');
    console.log('- GEMINI_API_KEY\n');

    try {
        if (!provider || provider === 'all') {
            await Promise.all([
                testProvider('Groq', new GroqProvider()),
                testProvider('Deepseek', new DeepseekProvider()),
                testProvider('Gemini', new GeminiProvider())
            ]);
        } else {
            switch (provider) {
                case 'groq':
                    await testProvider('Groq', new GroqProvider());
                    break;
                case 'deepseek':
                    await testProvider('Deepseek', new DeepseekProvider());
                    break;
                case 'gemini':
                    await testProvider('Gemini', new GeminiProvider());
                    break;
                default:
                    console.error('❌ Invalid provider specified. Use: groq, deepseek, gemini, or all');
                    process.exit(1);
            }
        }
        console.log('\n✨ All specified tests completed!');
    } catch (error) {
        console.error('\n❌ Test suite error:', error);
        process.exit(1);
    }
}

runTests(); 