const axios = require('axios');
const { Client } = require('pg');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

// Configuración de AWS SNS
const snsClient = new SNSClient(); // Cambia la región si es necesario

// URL del endpoint de salud
const HEALTH_ENDPOINT = 'http://app_prod:3000/health'; // Cambia esto a tu URL real
const SNS_TOPIC_ARN = 'arn:aws:sns:eu-south-2:108782067299:preparabombero_sns_monitoring'; // Cambia esto a tu ARN de SNS real

// Configuración de la base de datos
const databaseUrl = process.env.DATABASE_URL;

// Función para verificar el estado del endpoint de salud
async function checkHealth() {
    try {
        const response = await axios.get(HEALTH_ENDPOINT);
        
        if (response.data.status === 'error') {
            console.log('El estado es error. Notificando en SNS...');
            await notifySNS('El estado de salud es "error". Se requiere atención.');
        } else {
            console.log('El estado de salud es correcto.');
        }

        await queryDatabase();

    } catch (error) {
        console.error('Error al verificar el estado de salud:', error.message);
        await notifySNS(`Error al verificar el estado de salud: ${error.message}`);
    }
}

// Función para realizar una consulta en la base de datos
async function queryDatabase() {
    const client = new Client({ connectionString: databaseUrl });

    try {
        await client.connect();
        const res = await client.query('SELECT 1');
        console.log('Consulta exitosa:', res.rows);
    } catch (error) {
        console.error('Error al realizar la consulta en la base de datos:', error.message);
        await notifySNS(`Error al realizar la consulta en la base de datos: ${error.message}`);
    } finally {
        await client.end();
    }
}

// Función para enviar notificaciones a AWS SNS usando SDK v3
async function notifySNS(message) {
    const params = {
        Message: message,
        TopicArn: SNS_TOPIC_ARN
    };

    try {
        const command = new PublishCommand(params);
        await snsClient.send(command);
        console.log('Mensaje publicado en SNS:', message);
    } catch (error) {
        console.error('Error al enviar notificación a SNS:', error.message);
    }
}

// Configuración para ejecutar la función cada 5 minutos
setInterval(checkHealth, 5 * 60 * 1000);

// Ejecutar inmediatamente al iniciar
checkHealth();
