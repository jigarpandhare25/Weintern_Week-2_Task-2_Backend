const fs = require('fs');
const path = require('path');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { getStatus } = require('../config/db');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'employees.json');
const DEPARTMENTS_FILE = path.join(DATA_DIR, 'departments.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Default Departments
const defaultDepartments = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Quality Assurance',
  'Legal'
];

// Initial seed data with realistic Indian Rupee annual salaries
const initialSeedData = [
  {
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.org',
    department: 'Engineering',
    role: 'Lead Cloud Architect',
    salary: 1450000,
    joinDate: new Date('2023-01-15').toISOString(),
    status: 'Active'
  },
  {
    name: 'Marcus Vance',
    email: 'marcus.vance@techcorp.io',
    department: 'Design',
    role: 'Senior UI/UX Designer',
    salary: 1100000,
    joinDate: new Date('2023-03-22').toISOString(),
    status: 'Active'
  },
  {
    name: 'Aisha Patel',
    email: 'aisha.patel@globaltech.com',
    department: 'Product',
    role: 'Principal Product Manager',
    salary: 1650000,
    joinDate: new Date('2022-11-05').toISOString(),
    status: 'Active'
  },
  {
    name: 'David Kim',
    email: 'david.kim@innovate.co',
    department: 'Engineering',
    role: 'Full Stack Developer',
    salary: 950000,
    joinDate: new Date('2024-02-10').toISOString(),
    status: 'Active'
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@marketpulse.io',
    department: 'Marketing',
    role: 'Growth Marketing Lead',
    salary: 880000,
    joinDate: new Date('2023-08-18').toISOString(),
    status: 'Active'
  },
  {
    name: 'Liam Gallagher',
    email: 'liam.g@peoplesolutions.org',
    department: 'Human Resources',
    role: 'HR Business Partner',
    salary: 780000,
    joinDate: new Date('2023-05-30').toISOString(),
    status: 'Active'
  },
  {
    name: 'Sophia Chen',
    email: 'sophia.chen@finwise.net',
    department: 'Finance',
    role: 'Financial Analyst',
    salary: 1050000,
    joinDate: new Date('2024-01-08').toISOString(),
    status: 'Active'
  },
  {
    name: 'Carlos Mendez',
    email: 'carlos.m@salesforceelite.com',
    department: 'Sales',
    role: 'Enterprise Account Executive',
    salary: 1250000,
    joinDate: new Date('2022-09-14').toISOString(),
    status: 'Active'
  }
];

// Helper to read local JSON data
const readLocalData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeLocalData(initialSeedData);
      return initialSeedData.map((emp, index) => ({
        _id: `emp_${Date.now()}_${index}`,
        ...emp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local data:', err.message);
    return [];
  }
};

const writeLocalData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local data:', err.message);
  }
};

// Department local file helpers
const readLocalDepartments = () => {
  try {
    if (!fs.existsSync(DEPARTMENTS_FILE)) {
      fs.writeFileSync(DEPARTMENTS_FILE, JSON.stringify(defaultDepartments, null, 2), 'utf-8');
      return defaultDepartments;
    }
    const raw = fs.readFileSync(DEPARTMENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local departments:', err.message);
    return defaultDepartments;
  }
};

const writeLocalDepartments = (data) => {
  try {
    fs.writeFileSync(DEPARTMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local departments:', err.message);
  }
};

// Initialize files if not existing
if (!fs.existsSync(DEPARTMENTS_FILE)) {
  writeLocalDepartments(defaultDepartments);
}

// ---------------- Department Operations ----------------

const getAllDepartments = async () => {
  if (getStatus()) {
    try {
      let depts = await Department.find({}).sort({ name: 1 });
      if (depts.length === 0) {
        // Seed default departments into MongoDB
        await Department.insertMany(defaultDepartments.map((d) => ({ name: d })));
        depts = await Department.find({}).sort({ name: 1 });
      }
      return depts.map((d) => d.name);
    } catch (err) {
      console.error('Error fetching departments from Mongo:', err.message);
      return readLocalDepartments();
    }
  } else {
    return readLocalDepartments();
  }
};

const createDepartment = async (name, description = '') => {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) {
    throw new Error('Department name must be at least 2 characters long');
  }

  if (getStatus()) {
    const existing = await Department.findOne({ name: new RegExp(`^${trimmed}$`, 'i') });
    if (existing) {
      throw new Error(`Department '${trimmed}' already exists`);
    }
    const newDept = new Department({ name: trimmed, description });
    await newDept.save();
    return newDept.name;
  } else {
    const list = readLocalDepartments();
    const exists = list.some((d) => d.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      throw new Error(`Department '${trimmed}' already exists`);
    }
    list.push(trimmed);
    writeLocalDepartments(list);
    return trimmed;
  }
};

// ---------------- CRUD Operations for Employees ----------------

const getAllEmployees = async ({ search = '', department = '', sortBy = 'createdAt', order = 'desc', status = '' }) => {
  if (getStatus()) {
    const query = {};
    if (department && department !== 'All') {
      query.department = department;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { role: searchRegex },
        { department: searchRegex },
        { email: searchRegex }
      ];
    }
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const employees = await Employee.find(query).sort(sortOptions);
    return employees;
  } else {
    let employees = readLocalData();

    if (department && department !== 'All') {
      employees = employees.filter((e) => e.department.toLowerCase() === department.toLowerCase());
    }
    if (status && status !== 'All') {
      employees = employees.filter((e) => e.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      employees = employees.filter(
        (e) =>
          (e.name && e.name.toLowerCase().includes(s)) ||
          (e.role && e.role.toLowerCase().includes(s)) ||
          (e.department && e.department.toLowerCase().includes(s)) ||
          (e.email && e.email.toLowerCase().includes(s))
      );
    }

    employees.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'salary') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (sortBy === 'joinDate' || sortBy === 'createdAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return employees;
  }
};

const getEmployeeById = async (id) => {
  if (getStatus()) {
    return await Employee.findById(id);
  } else {
    const list = readLocalData();
    return list.find((e) => e._id.toString() === id.toString()) || null;
  }
};

const createEmployee = async (data) => {
  if (getStatus()) {
    const newEmp = new Employee(data);
    return await newEmp.save();
  } else {
    const list = readLocalData();
    const newEmp = {
      _id: `emp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: data.name.trim(),
      email: data.email ? data.email.trim() : `${data.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      department: data.department.trim(),
      role: data.role.trim(),
      salary: Number(data.salary),
      joinDate: new Date(data.joinDate).toISOString(),
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newEmp);
    writeLocalData(list);
    return newEmp;
  }
};

const updateEmployee = async (id, data) => {
  if (getStatus()) {
    return await Employee.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true
    });
  } else {
    const list = readLocalData();
    const index = list.findIndex((e) => e._id.toString() === id.toString());
    if (index === -1) return null;

    const updated = {
      ...list[index],
      ...data,
      salary: data.salary !== undefined ? Number(data.salary) : list[index].salary,
      joinDate: data.joinDate ? new Date(data.joinDate).toISOString() : list[index].joinDate,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    writeLocalData(list);
    return updated;
  }
};

const deleteEmployee = async (id) => {
  if (getStatus()) {
    return await Employee.findByIdAndDelete(id);
  } else {
    const list = readLocalData();
    const index = list.findIndex((e) => e._id.toString() === id.toString());
    if (index === -1) return null;

    const [deleted] = list.splice(index, 1);
    writeLocalData(list);
    return deleted;
  }
};

const getStats = async () => {
  const employees = await getAllEmployees({});
  const totalEmployees = employees.length;
  const totalPayroll = employees.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0);
  const averageSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  const departmentCounts = {};
  employees.forEach((emp) => {
    departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
  });

  return {
    totalEmployees,
    totalPayroll,
    averageSalary,
    departmentCounts,
    currency: 'INR',
    storageMode: getStatus() ? 'MongoDB (Live)' : 'Persistent JSON Storage (Ready for Atlas)'
  };
};

const seedEmployees = async () => {
  if (getStatus()) {
    await Employee.deleteMany({});
    const inserted = await Employee.insertMany(initialSeedData);

    // Also ensure departments exist
    const currentDepts = await Department.find({});
    if (currentDepts.length === 0) {
      await Department.insertMany(defaultDepartments.map((d) => ({ name: d })));
    }

    return inserted;
  } else {
    const seeded = initialSeedData.map((emp, index) => ({
      _id: `emp_${Date.now()}_${index}`,
      ...emp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    writeLocalData(seeded);
    writeLocalDepartments(defaultDepartments);
    return seeded;
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getStats,
  seedEmployees
};
