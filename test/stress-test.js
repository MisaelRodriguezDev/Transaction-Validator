import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // 50 usuarios concurrentes en 30s
    { duration: '1m', target: 50 },   // Mantener 50 usuarios durante 1 min
    { duration: '30s', target: 0 },   // Bajar a 0 usuarios
  ],
};

const BASE_URL = 'http://localhost:3000'; // Desarrollo :3000

export default function stressTest() {
  // Validar una transacción individual
  let transaction = { id: `tx${Math.floor(Math.random() * 1000)}`, amount: 100, currency: 'USD' };
  let res1 = http.post(`${BASE_URL}/api/v1/transactions/validate`, JSON.stringify(transaction), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res1, { 'validate transaction status 200': (r) => r.status === 200 });

  // Validar múltiples transacciones
  let transactions = [
    { id: `tx${Math.floor(Math.random() * 1000)}`, amount: 100, currency: 'USD' },
    { id: `tx${Math.floor(Math.random() * 1000)}`, amount: 50, currency: 'USD' },
  ];
  let res2 = http.post(`${BASE_URL}/api/v1/transactions/batch-validate`, JSON.stringify({ transactions }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res2, { 'batch validate status 200': (r) => r.status === 200 });

  // Comprobar health
  let res3 = http.get(`${BASE_URL}/health`);
  check(res3, { 'health status 200': (r) => r.status === 200 });

  sleep(1); // Esperar 1 segundo antes del siguiente ciclo
}
