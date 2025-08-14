
const { program } = require('commander');
const ora = require('ora');

// Configure program information
program
  .name('todo-cli')
  .description('CLI Todo List Manager with SQLite')
  .version('1.0.0');

// Define command options
program
  .option('-c, --create <listName>', 'Create a new todo list')
  .option('-l, --list <listName>', 'Specify which list to work with')
  .option('-a, --add <task>', 'Add a task to the list')
  .option('-s, --show', 'Show all tasks in the list')
  .option('-d, --done <task>', 'Mark task as done (by name or #id)')
  .option('--delete <task>', 'Delete a task (by name or #id)')
  .option('--clearAll', 'Clear all completed tasks')
  .option('--deleteList', 'Delete entire list');

// Process command line arguments
program.parse();

const options = program.opts();

// Main function
async function main() {
  const spinner = ora('Processing...').start();
  
  try {
    // Create list command
    if (options.create) {
      spinner.text = `Creating list: ${options.create}`;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate process
      spinner.succeed(`List "${options.create}" created successfully!`);
      return;
    }

    // Validate that list name is specified for other operations
    if (!options.list && (options.add || options.show || options.done || options.delete || options.clearAll || options.deleteList)) {
      spinner.fail('Please specify a list name with --list');
      process.exit(1);
    }

    // Add task command
    if (options.add) {
      spinner.text = `Adding task "${options.add}" to ${options.list}`;
      await new Promise(resolve => setTimeout(resolve, 800));
      spinner.succeed(`Task "${options.add}" added to "${options.list}"!`);
      return;
    }

    // Show tasks command
    if (options.show) {
      spinner.text = `Loading tasks from ${options.list}`;
      await new Promise(resolve => setTimeout(resolve, 500));
      spinner.succeed(`Tasks from "${options.list}":`);
      console.log('  #01 [ ] Example task');
      console.log('  #02 [✓] Completed task');
      return;
    }

    // Mark task as done command
    if (options.done) {
      spinner.text = `Marking "${options.done}" as done in ${options.list}`;
      await new Promise(resolve => setTimeout(resolve, 600));
      spinner.succeed(`Task "${options.done}" marked as done!`);
      return;
    }

    // Delete task command
    if (options.delete) {
      spinner.text = `Deleting "${options.delete}" from ${options.list}`;
      await new Promise(resolve => setTimeout(resolve, 600));
      spinner.succeed(`Task deleted from "${options.list}"!`);
      return;
    }

    // Clear completed tasks command
    if (options.clearAll) {
      spinner.text = `Clearing completed tasks from ${options.list}`;
      await new Promise(resolve => setTimeout(resolve, 800));
      spinner.succeed(`Completed tasks cleared from "${options.list}"!`);
      return;
    }

    // Delete entire list command
    if (options.deleteList) {
      spinner.text = `Preparing to delete list ${options.list}`;
      await new Promise(resolve => setTimeout(resolve, 500));
      spinner.warn(`This will delete the entire list "${options.list}"`);
      // TODO: Implement confirmation with inquirer
      return;
    }

    // If no commands provided, show help
    spinner.stop();
    program.help();

  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Execute main program
main();