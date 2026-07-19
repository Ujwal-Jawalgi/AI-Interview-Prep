export interface ATSResult {
  score: number;
  missingSkills: string[];
  foundSkills: string[];
  missingSections: string[];
  foundSections: string[];
}

const COMMON_SKILLS = [
  "javascript", "typescript", "react", "next.js", "node.js", "express",
  "python", "java", "c++", "sql", "postgresql", "mongodb",
  "docker", "kubernetes", "aws", "git", "github", "html", "css",
  "tailwind", "redux", "graphql", "rest api"
];

export function calculateATSScore(text: string): ATSResult {
  const lowercaseText = text.toLowerCase();
  
  const foundSections: string[] = [];
  const missingSections: string[] = [];
  
  const foundSkills: string[] = [];
  const missingSkills: string[] = [];
  
  let score = 0;

  // 1. Check for standard sections (Basic keyword presence + heuristics)
  if (lowercaseText.includes("education") || lowercaseText.includes("university")) {
    foundSections.push("education");
    score += 10;
  } else {
    missingSections.push("education");
  }

  if (lowercaseText.includes("experience") || lowercaseText.includes("employment") || lowercaseText.includes("work history")) {
    foundSections.push("experience");
    score += 15;
  } else {
    missingSections.push("experience");
  }

  if (lowercaseText.includes("project")) {
    foundSections.push("projects");
    score += 15;
  } else {
    missingSections.push("projects");
  }

  if (lowercaseText.includes("skill") || lowercaseText.includes("technologies")) {
    foundSections.push("skills");
    score += 10;
  } else {
    missingSections.push("skills");
  }

  // Contact Info (Email or Phone or LinkedIn)
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/.test(text);
  const hasLinkedIn = lowercaseText.includes("linkedin.com");
  
  if (hasEmail || hasPhone || hasLinkedIn) {
    foundSections.push("contact");
    score += 10;
  } else {
    missingSections.push("contact");
  }

  // 2. Skill Matching (Up to 40 points)
  let skillPoints = 0;
  for (const skill of COMMON_SKILLS) {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    if (regex.test(text)) {
      foundSkills.push(skill);
      skillPoints += 5; // 5 points per skill
    } else {
      missingSkills.push(skill);
    }
  }

  // Max 40 points for skills
  if (skillPoints > 40) skillPoints = 40;
  score += skillPoints;

  return {
    score: Math.min(score, 100),
    missingSkills,
    foundSkills,
    missingSections,
    foundSections,
  };
}
