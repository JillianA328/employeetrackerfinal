USE employeetracker;

INSERT INTO department (name)
VALUES
  ('Engineering'),
  ('Accounting'),
  ('Administration'),
  ('HR');

INSERT INTO role_id (title, salary, department)
VALUES
  ('Manager'),
  ('Accountant'),
  ('Supervisor'),
  ('Associate');

INSERT INTO employee (first_name, last_name)
VALUES
  ('Leslie, Knope'),
  ('Ron, Swanson'),
  ('Ann, Perkins'),
  ('Ben, Wyatt');
  