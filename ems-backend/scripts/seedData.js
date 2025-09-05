const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ems', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const userSeedData = [
  {
    username: 'admin',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'hr_manager',
    email: 'hr@company.com',
    password: 'hr123',
    role: 'admin'
  },
  {
    username: 'john.doe',
    email: 'john.doe@company.com',
    password: 'emp123',
    role: 'employee'
  },
  {
    username: 'jane.smith',
    email: 'jane.smith@company.com',
    password: 'emp123',
    role: 'employee'
  },
  {
    username: 'mike.johnson',
    email: 'mike.johnson@company.com',
    password: 'emp123',
    role: 'employee'
  }
];

const employeeSeedData = [
  {
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'male',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    department: 'Engineering',
    position: 'Senior Developer',
    salary: 85000,
    hireDate: new Date('2022-01-15'),
    status: 'active',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4568'
    },
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    notes: 'Excellent team player with strong technical skills.'
  },
  {
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    dateOfBirth: new Date('1988-08-20'),
    gender: 'female',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 75000,
    hireDate: new Date('2021-08-20'),
    status: 'active',
    emergencyContact: {
      name: 'Bob Smith',
      relationship: 'Spouse',
      phone: '+1 (555) 234-5679'
    },
    skills: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics'],
    notes: 'Creative marketing professional with proven track record.'
  },
  {
    employeeId: 'EMP003',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    phone: '+1 (555) 345-6789',
    dateOfBirth: new Date('1992-03-10'),
    gender: 'male',
    address: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    department: 'HR',
    position: 'HR Specialist',
    salary: 65000,
    hireDate: new Date('2023-03-10'),
    status: 'active',
    emergencyContact: {
      name: 'Sarah Johnson',
      relationship: 'Sister',
      phone: '+1 (555) 345-6790'
    },
    skills: ['Recruitment', 'Employee Relations', 'HR Policies', 'Training'],
    notes: 'Dedicated HR professional with strong interpersonal skills.'
  }
];

const seedUsers = async () => {
  await User.deleteMany({});
  console.log('🗑️  Cleared existing users');
  const hashedUsers = await Promise.all(
    userSeedData.map(async (user) => {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return {
        ...user,
        password: hashedPassword
      };
    })
  );
  const createdUsers = await User.insertMany(hashedUsers);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

const seedEmployees = async (users) => {
  await Employee.deleteMany({});
  console.log('🗑️  Cleared existing employees');
  // Map users to employees by email
  const employeesWithUserId = employeeSeedData.map(emp => {
    const user = users.find(u => u.email === emp.email);
    return {
      ...emp,
      userId: user ? user._id : undefined
    };
  });
  const createdEmployees = await Employee.insertMany(employeesWithUserId);
  console.log(`✅ Created ${createdEmployees.length} employees`);
  return createdEmployees;
};

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...');
    const users = await seedUsers();
    const employees = await seedEmployees(users);
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Created Users:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.role})`);
    });
    console.log('\n👥 Created Employees:');
    employees.forEach(emp => {
      console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.department})`);
    });
    console.log('\n🔑 Demo Login Credentials:');
    console.log('  Admin: admin / admin123');
    console.log('  HR: hr_manager / hr123');
    console.log('  Employee: john.doe / emp123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData }; 