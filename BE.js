const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid'); // For generating unique correlation IDs
const readline = require('readline'); // For reading CLI input

async function sendMessage(prompt) {
    const requestQueue = 'request_queue';
    const responseQueue = 'response_queue';

    try {
        const connection = await amqp.connect('amqp://localhost:5672');
        const channel = await connection.createChannel();

        // Ensure both queues exist
        await channel.assertQueue(requestQueue, { durable: true });
        await channel.assertQueue(responseQueue, { durable: true });

        // Generate a unique correlation ID for this request
        const correlationId = uuidv4();

        // Send a message to the request queue
        channel.sendToQueue(requestQueue, Buffer.from(prompt), {
            correlationId,
            replyTo: responseQueue
        });
        console.log(`[x] Sent prompt: "${prompt}"`);

        // Consume the response from the response queue
        channel.consume(responseQueue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                console.log(`[x] Received response: "${msg.content.toString()}"`);
                channel.close();
                connection.close();
                rl.close(); // Close the readline interface
            }
        }, { noAck: true });

    } catch (error) {
        console.error('Error:', error);
    }
}

// Set up readline interface for CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your prompt: ', (prompt) => {
    sendMessage(prompt);
});
