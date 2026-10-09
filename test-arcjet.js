// Test script to verify ArcJet SDK integration
import dotenv from 'dotenv';
dotenv.config();
import arcjet from '@arcjet/node';
import { shield, detectBot, slidingWindow } from '@arcjet/node';

console.log('Testing ArcJet SDK integration...');
console.log('ARCJET_KEY:', process.env.ARCJET_KEY ? 'SET' : 'NOT SET');
console.log('ARCJET_MODE:', process.env.ARCJET_MODE || 'NOT SET (defaulting to DRY_RUN)');

if (!process.env.ARCJET_KEY) {
  console.error('ERROR: ARCJET_KEY not found in environment');
  process.exit(1);
}

// Initialize Arcjet
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ['ip.src'],
  rules: [
    shield({ mode: process.env.ARCJET_MODE || 'DRY_RUN' }),
    detectBot({
      mode: process.env.ARCJET_MODE || 'DRY_RUN',
      deny: ['CATEGORY:AI', 'CATEGORY:BOTNET', 'CATEGORY:UNKNOWN']
    }),
    slidingWindow({
      mode: process.env.ARCJET_MODE || 'DRY_RUN',
      interval: '10s',
      max: 10
    })
  ]
});

console.log('ArcJet SDK initialized successfully');

// Test with a mock request
const mockRequest = {
  ip: '127.0.0.1',
  method: 'GET',
  path: '/test',
  headers: {
    'user-agent': 'test-agent'
  }
};

console.log('Testing with mock request:', mockRequest);

aj.protect(mockRequest)
  .then(decision => {
    console.log('Decision:', decision);
    console.log('Is denied:', decision.isDenied());
    if (decision.isDenied()) {
      console.log('Reason:', decision.reason);
      console.log('Is rate limit:', decision.reason.isRateLimit());
      console.log('Is bot:', decision.reason.isBot());
      console.log('Is shield:', decision.reason.isShield());
    }
    console.log('SUCCESS: ArcJet SDK is working correctly');
    process.exit(0);
  })
  .catch(error => {
    console.error('ERROR:', error.message);
    process.exit(1);
  });