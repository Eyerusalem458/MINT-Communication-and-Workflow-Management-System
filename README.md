# MINT Communication & Workflow Management System

## Setup

1. Clone the repo
2. Install dependencies:
   cd Backend && npm install
   cd ../Web-Frontend && npm install

3. Copy .env.example to .env and fill in your values:
   cp .env.example .env
   u only change only the :EMAIL_USER & EMAIL_PASS

4. Seed the database:
   cd Backend ,
   node Utils/seed.js

5. Run backend:
   cd Backend && nodemon server.js

6. Run frontend:
   cd Web-Frontend && npm run dev
