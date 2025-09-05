const fs = require('fs');
const { createCanvas } = require('canvas');
const { jsPDF } = require('jspdf');

// Create a new PDF document
const doc = new jsPDF();

// Set document properties
doc.setProperties({
  title: 'Employee Management System - Technology Stack',
  subject: 'Technical Documentation',
  author: 'EMS Development Team',
  keywords: 'ems, technology stack, documentation',
  creator: 'EMS Project'
});

// Add title
doc.setFontSize(24);
doc.text('Employee Management System', 15, 25);
doc.setFontSize(16);
doc.setTextColor(100);
doc.text('Technology Stack Documentation', 15, 35);

// Add date
doc.setFontSize(10);
const today = new Date();
doc.text(`Generated on: ${today.toLocaleDateString()}`, 15, 45);

// Add content
let yPosition = 65;
const section = (title, content) => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(title, 15, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  content.forEach(item => {
    doc.text(`• ${item}`, 20, yPosition);
    yPosition += 7;
  });
  yPosition += 10;
};

// Backend Technologies
section('Backend (ems-backend)', [
  'Node.js - JavaScript runtime',
  'Express.js - Web application framework',
  'MongoDB - NoSQL database',
  'Mongoose - ODM for MongoDB',
  'JWT - JSON Web Tokens for authentication',
  'bcryptjs - Password hashing',
  'CORS - Cross-Origin Resource Sharing',
  'dotenv - Environment variable management'
]);

// Frontend Technologies
section('Frontend (ems-frontend)', [
  'React 18 - JavaScript library for building UIs',
  'TypeScript - Type-safe JavaScript',
  'Material-UI (MUI) - UI component library',
  'React Router - Client-side routing',
  'Recharts - Data visualization',
  'Framer Motion - Animation library',
  'Axios - HTTP client',
  'React Hook Form - Form handling',
  'Yup/Zod - Form validation',
  'date-fns/dayjs - Date manipulation'
]);

// Development Tools
section('Development Tools', [
  'npm/yarn - Package management',
  'ESLint - JavaScript/TypeScript linting',
  'Prettier - Code formatting',
  'Jest - Testing framework',
  'React Testing Library - Component testing',
  'Vite/CRA - Build tooling'
]);

// Add page numbers
const pageCount = doc.internal.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  doc.setFontSize(10);
  doc.text(
    `Page ${i} of ${pageCount}`,
    doc.internal.pageSize.width - 30,
    doc.internal.pageSize.height - 10
  );
}

// Save the PDF
doc.save('EMS-Technology-Stack.pdf');
console.log('PDF generated successfully!');
