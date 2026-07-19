const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('dummy_resume.pdf'));

doc.fontSize(25).text('John Doe', 100, 100);
doc.fontSize(12).text('john.doe@example.com | +1 (555) 123-4567 | linkedin.com/in/johndoe', 100, 130);

doc.fontSize(16).text('Education', 100, 170);
doc.fontSize(12).text('B.S. Computer Science, University of Technology, 2024', 100, 190);

doc.fontSize(16).text('Experience', 100, 230);
doc.fontSize(12).text('Software Engineer Intern at TechCorp (Summer 2023)', 100, 250);
doc.text('Worked on building a scalable backend service using Node.js and Express.', 100, 270);

doc.fontSize(16).text('Projects', 100, 310);
doc.fontSize(12).text('Personal Portfolio', 100, 330);
doc.text('Built a personal portfolio using React and Tailwind CSS.', 100, 350);

doc.fontSize(16).text('Skills', 100, 390);
doc.fontSize(12).text('JavaScript, React, Node.js, Express, HTML, CSS, Git, GitHub', 100, 410);

doc.end();
console.log('Dummy resume generated at dummy_resume.pdf');
