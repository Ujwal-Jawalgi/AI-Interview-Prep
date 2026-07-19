const fs = require('fs');
const pdfParse = require('pdf-parse');
const { calculateATSScore } = require('./src/lib/resume/ats-scorer');
const { getGroqFeedback } = require('./src/lib/resume/groq-feedback');

async function testResumeAnalyzer() {
  console.log("Reading dummy resume...");
  const dataBuffer = fs.readFileSync('dummy_resume.pdf');
  
  console.log("Extracting text...");
  const pdfData = await pdfParse(dataBuffer);
  const text = pdfData.text;
  
  console.log("Running ATS Scorer...");
  const atsResult = calculateATSScore(text);
  console.log("ATS Score:", atsResult.score);
  console.log("Missing Skills:", atsResult.missingSkills);
  console.log("Found Sections:", atsResult.foundSections);
  
  console.log("Fetching Groq Feedback...");
  const groqFeedback = await getGroqFeedback(text, atsResult.missingSkills);
  console.log("Groq Feedback:", groqFeedback);
}

testResumeAnalyzer().catch(console.error);
