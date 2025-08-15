
const { program } = require('commander');
const ora = require('ora');
const inquirer = require('inquirer');
const { initDatabase, dbOperations, closeDatabase } = require('./database/db');

//  Program information
program
  .name('todo-cli')
  .description('CLI Todo List Manager with SQLite')
  .version('1.0.0');

// Command options
program
  .option('-c, --create <listName>', 'Create a new todo list')
  .option('-l, --list <listName>', 'Specify which list to work with')
  .option('-a, --add <task>', 'Add a task to the list')
  .option('-s, --show', 'Show all tasks in the list')
  .option('-d, --done <task>', 'Mark task as done (by name or #id)')
  .option('--delete <task>', 'Delete a task (by name or #id)')
  .option('--clearAll', 'Clear all completed tasks')
  .option('--deleteList', 'Delete entire list');

// Commands line options
program.parse();

const options = program.opts();

// Helper function  tasks for display
function formatTasks(tasks) {
  if (tasks.length === 0) {
    console.log('  No tasks found in this list.');
    return;
  }

  tasks.forEach(task => {
    const status = task.done ? '[DONE]' : '[ ]';
    const taskId = String(task.id).padStart(2, '0');
    console.log(`  #${taskId} ${status} ${task.task}`);
  });
}

// Principal function
async function main() {
  let spinner;
  
  try {
    // Start database
    spinner = ora('Initializing database...').start();
    await initDatabase();
    spinner.succeed('Database ready');

    // Create list command
    if (options.create) {
      spinner = ora(`Creating list: ${options.create}`).start();
      try {
        await dbOperations.createList(options.create);
        spinner.succeed(`List "${options.create}" created successfully!`);
      } catch (error) {
        spinner.fail(error.message);
        process.exit(1);
      }
      return;
    }

    // Validate list name specified for other operations
    if (!options.list && (options.add || options.show || options.done || options.delete || options.clearAll || options.deleteList)) {
      if (spinner) spinner.stop();
      console.error('ERROR: Please specify a list name with --list');
      process.exit(1);
    }

    // Add task command
    if (options.add) {
      spinner = ora(`Adding task "${options.add}" to ${options.list}`).start();
      try {
        await dbOperations.addTask(options.list, options.add);
        spinner.succeed(`Task "${options.add}" added to "${options.list}"!`);
      } catch (error) {
        spinner.fail(error.message);
        process.exit(1);
      }
      return;
    }

    // Show tasks command
    if (options.show) {
      spinner = ora(`Loading tasks from ${options.list}`).start();
      try {
        const tasks = await dbOperations.getTasks(options.list);
        spinner.succeed(`Tasks from "${options.list}":`);
        formatTasks(tasks);
      } catch (error) {
        spinner.fail(error.message);
        process.exit(1);
      }
      return;
    }

    // task as done command
    if (options.done) {
      spinner = ora(`Marking "${options.done}" as done in ${options.list}`).start();
      try {
        await dbOperations.markTaskDone(options.list, options.done);
        spinner.succeed(`Task "${options.done}" marked as done!`);
      } catch (error) {
        spinner.fail(error.message);
        process.exit(1);
      }
      return;
    }

    // Delete task command
    if (options.delete) {
      spinner = ora(`Deleting "${options.delete}" from ${options.list}`).start();
      try {
        await dbOperations.deleteTask(options.list, options.delete);
        spinner.succeed(`Task "${options.delete}" deleted from "${options.list}"!`);
      } catch (error) {
        spinner.fail(error.message);
        process.exit(1);
      }
      return;
    }

    // Clear completed tasks command
    if (options.clearAll) {
      spinner = ora(`Clearing completed tasks from ${options.list}`).start();
      try {
        const result = await dbOperations.clearCompletedTasks(options.list);
        if (result.deletedCount === 0) {
          spinner.info(`No completed tasks found in "${options.list}"`);
        } else {
          spinner.succeed(`${result.deletedCount} completed task(s) cleared from "${options.list}"!`);
        }
      } catch (error) {
        spinner.fail(error.message);
        process.exit(1);
      }
      return;
    }

    // Delete entire list command
    if (options.deleteList) {
      spinner = ora(`Checking list ${options.list}`).start();
      try {
        // Check first list exists 
        const tasks = await dbOperations.getTasks(options.list);
        spinner.stop();

        // Show confirmation prompt
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmDelete',
            message: `Do you really want to delete "${options.list}"? This will remove all tasks permanently.`,
            default: false
          }
        ]);

        if (answers.confirmDelete) {
          spinner = ora(`Deleting list ${options.list}`).start();
          await dbOperations.deleteList(options.list);
          spinner.succeed(`List "${options.list}" deleted successfully!`);
        } else {
          console.log('CANCELLED: Operation cancelled');
        }
      } catch (error) {
        if (spinner.isSpinning) spinner.stop();
        console.error('ERROR:', error.message);
        process.exit(1);
      }
      return;
    }

    // If no commands provided, show help
    if (spinner) spinner.stop();
    program.help();

  } catch (error) {
    if (spinner && spinner.isSpinning) {
      spinner.fail(`Error: ${error.message}`);
    } else {
      console.error('ERROR:', error.message);
    }
    process.exit(1);
  }
}

// Close the database when the program exits
process.on('SIGINT', async () => {
  console.log('\nClosing database connection...');
  try {
    await closeDatabase();
    console.log('SUCCESS: Database closed successfully');
  } catch (error) {
    console.error('ERROR: Error closing database:', error.message);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

// Do main program
main();