const amqp = require('amqplib');
const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function processPrompt(prompt) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini", // Use the appropriate model
            messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return "Error processing prompt";
    }
}

async function startConsumer() {
    const requestQueue = 'request_queue';
    const responseQueue = 'response_queue';

    try {
        const connection = await amqp.connect('amqp://localhost:5672');
        const channel = await connection.createChannel();

        // Ensure both queues exist
        await channel.assertQueue(requestQueue, { durable: true });
        await channel.assertQueue(responseQueue, { durable: true });

        console.log(`[x] Waiting for messages in "${requestQueue}". To exit press CTRL+C`);

        // Consume messages from the request queue
        channel.consume(requestQueue, async (msg) => {
            if (msg !== null) {
                const prompt = msg.content.toString();
                console.log(`[x] Received prompt: "${prompt}"`);

                try {
                    // Process the prompt with OpenAI
                    const response = await processPrompt(prompt);

                    // Send the response to the response queue
                    channel.sendToQueue(msg.properties.replyTo, Buffer.from(response), {
                        correlationId: msg.properties.correlationId
                    });
                    console.log(`[x] Sent response: "${response}"`);
                } catch (error) {
                    console.error('Error processing prompt:', error);
                }

                // Acknowledge the message
                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

startConsumer();
