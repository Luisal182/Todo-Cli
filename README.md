# Todo CLI

## Overview

Welcome to Todo CLI, your efficient command-line task manager designed to streamline productivity and organization directly from your terminal. This application offers a seamless experience for creating multiple todo lists, managing tasks with flexible commands, and maintaining organized workflows without leaving the command line environment.

This project was developed with Node.js, SQLite, and modern CLI libraries, focusing on providing an intuitive interface for task management with persistent data storage. Whether you're managing daily tasks, project milestones, shopping lists, or work assignments, Todo CLI ensures efficient task tracking with elegant terminal interactions and reliable data persistence.

## Core Features

- **Multiple List Management**: Create and organize separate todo lists for different projects, categories, or contexts.
- **Flexible Task Operations**: Add, complete, and delete tasks using either task names or ID numbers for maximum convenience.
- **Batch Operations**: Clear all completed tasks at once for efficient list maintenance and organization.
- **Interactive Confirmations**: Safety prompts prevent accidental deletion of entire lists.
- **Data Persistence**: SQLite database ensures your tasks and lists are saved between sessions.
- **Beautiful Terminal Interface**: Elegant loading spinners and clear status messages enhance user experience.
- **Error Handling**: Comprehensive feedback for invalid operations, missing lists, and duplicate entries.

### Technologies Used

## Backend:
- **Node.js**: Core runtime environment providing the foundation for the CLI application.
- **SQLite**: Lightweight, serverless database for persistent storage of lists and tasks.
- **Commander.js**: Professional library for parsing command-line arguments and creating intuitive CLI interfaces.

## User Interface:
- **Ora**: Provides elegant loading spinners and status indicators in the terminal.
- **Inquirer**: Handles interactive prompts and user confirmations for safe operations.


### How to Use

## Basic Commands:

**Create a new list:**
```bash
node src/index.js --create "MyList"
```

**Add a task to a list:**
```bash
node src/index.js --add "Buy groceries" --list "MyList"
```

**View all tasks in a list:**
```bash
node src/index.js --show --list "MyList"
```

**Mark a task as completed (by name):**
```bash
node src/index.js --done "Buy groceries" --list "MyList"
```

**Mark a task as completed (by ID):**
```bash
node src/index.js --done #01 --list MyList
```

**Delete a specific task:**
```bash
node src/index.js --delete #01 --list MyList
node src/index.js --delete "Buy groceries" --list "MyList"
```

**See a full list,all task or articles**
```bash
node src/index.js --show --list "MyList"
```

**Clear all completed tasks:**
```bash
node src/index.js --clearAll --list "MyList"
```

**Delete an entire list:**
```bash
node src/index.js --deleteList --list "MyList"
```

**Show help and available commands:**
```bash
node src/index.js --help
```

### Installation Instructions

## Prerequisites:
- Node.js v14.0.0 or higher
- npm 6.0.0 or higher

## Steps:

1. **Clone the repository:**
```bash
git clone https://github.com/Luisal182/Todo-Cli.git
cd Todo-Cli
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start using the application:**
```bash
npm start --help
```

4. **For development with auto-reload:**
```bash
npm run dev
```

## Database Schema

The application uses SQLite with two main tables:

**Lists Table:**
- `id` - Primary key (auto-increment)
- `name` - List name (unique constraint)
- `created_at` - Creation timestamp

**Tasks Table:**
- `id` - Primary key (auto-increment)
- `list_id` - Foreign key to lists table
- `task` - Task description text
- `done` - Boolean completion status
- `created_at` - Creation timestamp

## Available Scripts

- `npm start` - Run the application
- `npm run dev` - Run with nodemon for development
- `npm test` - Show help information

## Example Workflow

```bash
# Create a shopping list
node src/index.js --create "Shopping"

# Add some items
node src/index.js --add "Buy milk" --list "Shopping"
node src/index.js --add "Buy bread" --list "Shopping"
node src/index.js --add "Buy eggs" --list "Shopping"

# View the complete list
node src/index.js --show --list Shopping

# Mark first item as completed
node src/index.js --done #01 --list Shopping

# Delete a specific item
node src/index.js --delete "Buy bread" --list "Shopping"

# Clear all completed tasks
node src/index.js --clearAll --list "Shopping"

# Delete the entire list (with confirmation)
node src/index.js --deleteList --list Shopping
```

## 👥 Contributing

Contributions are welcome! To get involved:

1. **Fork the repository.**
2. **Create a new branch:**
```bash
git checkout -b feature-name
```

3. **Make your changes and commit:**
```bash
git commit -m "Add amazing new feature"
```

4. **Push your branch:**
```bash
git push origin feature-name
```

5. **Open a Pull Request.**

### License and Credits

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Developed by Luis Alfonso Arranz García** as part of a Node.js learning project. The application was created for educational purposes, combining practical CLI development skills with database management concepts in a useful, real-world application.

© 2025 All Rights Reserved