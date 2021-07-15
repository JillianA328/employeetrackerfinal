const inquirer = require('inquirer');
const consoleTable = require('console.table');
const mysql = require('mysql2');
var dbConnect = require('./db/connect.js');
const { listenerCount } = require('events');


//Connect DB and then start the userQuestions function
dbConnect.connect(function (err) {
    if (err) throw err
    console.log("db Connected")
    userQuestions();
});

//Function to run through list of options/questions
function userQuestions() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'menuOptions',
            message: 'What would you like to do?',
            choices: [
                "View departments",
                "View employees",
                "View roles",
                "Add a department",
                "Add a new employee",
                "Add a role",
                "Update an employee role",
                "Exit"
            ]
        }
    ]).then(function (userRepsonse) {
        if (userRepsonse.menuOptions === "View departments") {
            viewAllDepartments();
        } else if (userRepsonse.menuOptions === "View roles") {
            viewAllRoles();
        } else if (userRepsonse.menuOptions === "View employees") {
            viewAllEmployees();
        } else if (userRepsonse.menuOptions === "Add a department") {
            addNewDepartment();
        } else if (userRepsonse.menuOptions === "Add a role") {
            addNewRole();
        } else if (userRepsonse.menuOptions === "Add a new employee") {
            addNewEmployee();
        } else if (userRepsonse.menuOptions === "Update an employee role") {
            updateCurrentEmployee();
        } else {
            dbConnect.end();
        }

    });
}

//View all employees
function viewAllEmployees() {
    let query = "SELECT * FROM employee";
    dbConnect.query(query, (err, res) => {
        if (err) throw err;
        console.table(` `);
        console.table('employees')
        console.table(res);
        userQuestions();
    });

}

//View Departments
function viewAllDepartments() {
    let query = "SELECT * FROM department";
    dbConnect.query(query, (err, res) => {
        if (err) throw err;
        console.table(` `);
        console.table('department')
        console.table(res);
        userQuestions();
    });

}

//View All Roles
function viewAllRoles() {
    let query = "SELECT * FROM role";
    dbConnect.query(query, (err, res) => {
        if (err) throw err;
        console.table(` `);
        console.table('roles')
        console.table(res);
        userQuestions();
    });

}


//Add a new employee & Add it to the employee table
function addNewEmployee() {
    dbConnect.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "input",
                message: "Please enter the new employee's first name:",
                name: "first_name",
            },
            {
                type: "input",
                message: "Please enter the new employee's last name:",
                name: "last_name"
            },
            {
                type: "list",
                message: "What is the employees role?",
                choices: function () {
                    let Choices = [];
                    res.forEach(res => {
                        Choices.push(res.title);
                    });
                    return Choices;
                },
                name: "role"
            }
        ]).then(function (answer) {
            const role = answer.role;
            dbConnect.query('SELECT * FROM role', (err, res) => {

                if (err) throw (err);
                let employeeRole = res.filter(res => {
                    return res.title == role;
                });

                let id = employeeRole[0].id;
                dbConnect.query("INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)",
                    [
                        answer.first_name,
                        answer.last_name,
                        id
                    ],
                    function (err) {
                        if (err) throw err;
                        console.log(`New employee added!: ${(answer.first_name)} ${(answer.last_name)}`)
                    });
                viewAllEmployees();
            });
        });
    });
}



// Add a new department & add it to the department table
function addNewDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the department name:",
            name: "newDepartment"
        },
    ]).then(function (answer) {
        dbConnect.query(
            "INSERT INTO department SET ?",
            {
                name: answer.newDepartment,
            },
            function (err) {
                if (err) throw err;
                console.log("Department has been created!");
                userQuestions();
            }
        );
    });
}



//Add a new role & add it into role table
function addNewRole() {
    dbConnect.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "input",
                message: "Please enter role name:",
                name: "newRole"
            },
            {
                type: "input",
                message: "What is the yearly salary?",
                name: "salary"
            },
            {
                type: "list",
                message: "Which department does this role belong to?",
                choices: function () {
                    let Choices = [];
                    res.forEach(res => { Choices.push(res.name) });
                    return Choices;
                },
                name: "department"
            }
        ]).then(function (answer) {
            const dept = answer.department;
            dbConnect.query('SELECT * FROM department', (err, res) => {

                if (err) throw (err);
                let deptName = res.filter(res => {
                    return res.name == dept;
                });

                let id = deptName[0].id;
                dbConnect.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
                    [
                        answer.newRole,
                        parseInt(answer.salary),
                        id
                    ],
                    function (err) {
                        if (err) throw err;
                        console.log(`You have added this role: ${(answer.newRole).toUpperCase()} successfully.`)
                    })
                viewAllRoles();
            });
        });
    });
}

//Update an existing employees role
function updateCurrentEmployee() {
    dbConnect.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "list",
                message: "Please enter the employees last name.",
                choices: function () {
                    currentEmployee = [];
                    res.forEach(res => {
                        currentEmployee.push(res.last_name);
                    });
                    return currentEmployee;
                },
                name: "employee"
            }
        ]).then(function (answer) {
            const updateEmployee = answer.employee;

            console.log("Employee: " + updateEmployee);

            dbConnect.query("SELECT * FROM role", (err, res) => {
                if (err) throw err;
                inquirer.prompt([
                    {
                        type: "list",
                        message: "What is the employees new role?",
                        choices: function () {
                            newRole = [];
                            res.forEach(res => {
                                newRole.push(res.title);
                            });
                            return newRole;
                        },
                        name: "newRole"
                    }
                ]).then(function (update) {
                    const newRole = update.newRole;
                    console.log("Updated Role: " + newRole);

                    dbConnect.query('SELECT * FROM role WHERE title = ?', [newRole], (err, res) => {
                        if (err) throw (err);

                        let Role = res[0].id;
                        console.log("ROLE id : " + Role);

                        let params = [Role, updateEmployee];

                        dbConnect.query("UPDATE employee SET role_id = ? WHERE last_name = ?", params,
                            (err, res) => {
                                if (err) throw (err);
                                console.log(` ${updateEmployee}'s role to ${newedRole} has been updated!`)
                            });
                        viewAllEmployees();
                    });
                });
            });
        });
    });
}