<!-- # Welcome to your LIC-Agent-Dairy project

## Project info

**URL**: https://lovable.dev/projects/315d1141-1177-45ce-91ac-a3796c1f65fa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/315d1141-1177-45ce-91ac-a3796c1f65fa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```
**Deploy on dev with Github pages : SP**
```sh
# Step 1: checkout the deploying branch.
git checkout dev-deploy

# Step 2: Get the changes.
git pull origin dev-deploy

# Step 3: Create build for deploy.
npm run build:dev

# Step 4: Deploy this branch.
npm run deploy:dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/315d1141-1177-45ce-91ac-a3796c1f65fa) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide) -->




<!-- ---------------------------- writen by sp ------------------------------------------------------- -->

# LIC Management System (Life Insurance Records)

A web application for managing Life Insurance Records, agent/insurance records — set up to track policies, agents, and related data in an organized way.

[Live Demo ›](https://lic-agent-dairy.vercel.app/)

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  

---

## Features

- Agent / Policy Management — Create, Read, Update, Delete (CRUD) operations for agent and policy records.  
- Dashboard / overview of key LIC data.  
- Search, filtering and/or sorting of records.  
- Responsive UI for both desktop and mobile devices.  
- Secure form validations.  

---

## Tech Stack


- **Frontend**: React / Next.js (or the framework you used)  
- **Backend**: Node.js / Express (if separate) or API routes via Next.js  
- **Database**: MongoDB / PostgreSQL / any other persistent storage  
- **Styling**: CSS / Tailwind CSS / Material‐UI / etc.  
- **Hosting / Deployment**: Vercel  

---
