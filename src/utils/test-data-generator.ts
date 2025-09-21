import { Logger } from '../core/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test Data Generator
 * Generates realistic test data for Zoho application testing
 */
export class TestDataGenerator {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('TestDataGenerator');
  }

  /**
   * Generate candidate test data
   */
  generateCandidateData(count: number = 10): any[] {
    const firstNames = [
      'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
      'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Jennifer', 'Daniel',
      'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Betty', 'Donald',
      'Helen', 'Steven', 'Sandra', 'Paul', 'Donna', 'Andrew', 'Carol'
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
      'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
    ];

    const skills = [
      'JavaScript', 'Python', 'Java', 'React', 'Angular', 'Vue.js', 'Node.js',
      'TypeScript', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'SQL',
      'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
      'Machine Learning', 'Data Science', 'UI/UX Design', 'Project Management',
      'Agile', 'Scrum', 'DevOps', 'CI/CD', 'Testing', 'Automation'
    ];

    const departments = [
      'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance',
      'Operations', 'Product Management', 'Customer Success', 'Design',
      'Data Analytics', 'Quality Assurance', 'Business Development'
    ];

    const locations = [
      'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
      'Boston, MA', 'Chicago, IL', 'Denver, CO', 'Los Angeles, CA',
      'Remote', 'Hybrid', 'London, UK', 'Toronto, ON', 'Berlin, Germany'
    ];

    const candidates = [];

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      // Generate skills (3-8 skills per candidate)
      const skillCount = Math.floor(Math.random() * 6) + 3;
      const candidateSkills: string[] = [];
      for (let j = 0; j < skillCount; j++) {
        const skill = skills[Math.floor(Math.random() * skills.length)];
        if (!candidateSkills.includes(skill)) {
          candidateSkills.push(skill);
        }
      }

      const experience = Math.floor(Math.random() * 15) + 1; // 1-15 years
      const salary = this.generateSalary(experience, department);

      candidates.push({
        id: `candidate_${i + 1}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: this.generatePhoneNumber(),
        skills: candidateSkills,
        experience: `${experience} years`,
        department: department,
        location: location,
        salary: salary,
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        source: Math.random() > 0.5 ? 'Zoho Recruit' : 'Zoho People Plus',
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    this.logger.info(`Generated ${count} candidate records`);
    return candidates;
  }

  /**
   * Generate position test data
   */
  generatePositionData(count: number = 10): any[] {
    const titles = [
      'Senior Software Engineer', 'Frontend Developer', 'Backend Developer',
      'Full Stack Developer', 'DevOps Engineer', 'Data Scientist',
      'Product Manager', 'UX Designer', 'Marketing Manager', 'Sales Representative',
      'Business Analyst', 'QA Engineer', 'Technical Lead', 'Scrum Master',
      'Solution Architect', 'Cloud Engineer', 'Mobile Developer', 'AI Engineer',
      'Security Engineer', 'Database Administrator'
    ];

    const departments = [
      'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance',
      'Operations', 'Product Management', 'Customer Success', 'Design',
      'Data Analytics', 'Quality Assurance', 'Business Development'
    ];

    const locations = [
      'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
      'Boston, MA', 'Chicago, IL', 'Denver, CO', 'Los Angeles, CA',
      'Remote', 'Hybrid', 'London, UK', 'Toronto, ON', 'Berlin, Germany'
    ];

    const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

    const positions = [];

    for (let i = 0; i < count; i++) {
      const title = titles[Math.floor(Math.random() * titles.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
      
      const experience = Math.floor(Math.random() * 10) + 1; // 1-10 years
      const salary = this.generateSalary(experience, department);

      positions.push({
        id: `position_${i + 1}`,
        title: title,
        description: this.generateJobDescription(title, department),
        department: department,
        location: location,
        employmentType: employmentType,
        experience: `${experience}+ years`,
        salaryRange: salary,
        status: Math.random() > 0.3 ? 'published' : 'draft',
        skills: this.generateRequiredSkills(title, department),
        requirements: this.generateRequirements(experience),
        benefits: this.generateBenefits(),
        createdDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    this.logger.info(`Generated ${count} position records`);
    return positions;
  }

  /**
   * Generate matching data between candidates and positions
   */
  generateMatchingData(candidates: any[], positions: any[]): any[] {
    const matches = [];

    for (const candidate of candidates) {
      for (const position of positions) {
        const matchScore = this.calculateMatchScore(candidate, position);
        
        if (matchScore > 0.3) { // Only include matches with score > 30%
          matches.push({
            candidateId: candidate.id,
            positionId: position.id,
            candidateName: candidate.name,
            positionTitle: position.title,
            matchScore: matchScore,
            matchingFactors: this.getMatchingFactors(candidate, position),
            recommended: matchScore > 0.7,
            lastCalculated: new Date().toISOString()
          });
        }
      }
    }

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    this.logger.info(`Generated ${matches.length} candidate-position matches`);
    return matches;
  }

  /**
   * Save test data to files
   */
  async saveTestData(data: any, filename: string): Promise<void> {
    try {
      const dataDir = path.join(process.cwd(), 'test-results', 'test-data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const filePath = path.join(dataDir, `${filename}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      this.logger.info(`Saved test data to ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to save test data', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Load test data from files
   */
  async loadTestData(filename: string): Promise<any> {
    try {
      const filePath = path.join(process.cwd(), 'test-results', 'test-data', `${filename}.json`);
      
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`Test data file not found: ${filePath}`);
        return null;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.logger.info(`Loaded test data from ${filePath}`);
      return data;
    } catch (error) {
      this.logger.error('Failed to load test data', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Generate comprehensive test dataset
   */
  async generateFullDataset(): Promise<void> {
    this.logger.info('Generating comprehensive test dataset');
    
    // Generate candidates
    const candidates = this.generateCandidateData(50);
    await this.saveTestData(candidates, 'candidates');
    
    // Generate positions
    const positions = this.generatePositionData(25);
    await this.saveTestData(positions, 'positions');
    
    // Generate matches
    const matches = this.generateMatchingData(candidates, positions);
    await this.saveTestData(matches, 'matches');
    
    // Generate summary
    const summary = {
      generatedAt: new Date().toISOString(),
      candidates: candidates.length,
      positions: positions.length,
      matches: matches.length,
      highMatches: matches.filter(m => m.matchScore > 0.7).length,
      departments: [...new Set(candidates.map(c => c.department))],
      locations: [...new Set(candidates.map(c => c.location))],
      skills: [...new Set(candidates.flatMap(c => c.skills))]
    };
    
    await this.saveTestData(summary, 'dataset-summary');
    
    this.logger.info('Test dataset generation completed');
  }

  private generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `+1-${areaCode}-${exchange}-${number}`;
  }

  private generateSalary(experience: number, department: string): string {
    const baseSalaries: { [key: string]: number } = {
      'Engineering': 80000,
      'Marketing': 60000,
      'Sales': 55000,
      'Human Resources': 50000,
      'Finance': 65000,
      'Operations': 60000,
      'Product Management': 90000,
      'Customer Success': 55000,
      'Design': 70000,
      'Data Analytics': 75000,
      'Quality Assurance': 60000,
      'Business Development': 70000
    };

    const baseSalary = baseSalaries[department] || 60000;
    const experienceMultiplier = 1 + (experience * 0.1);
    const minSalary = Math.floor(baseSalary * experienceMultiplier);
    const maxSalary = Math.floor(minSalary * 1.3);

    return `$${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()}`;
  }

  private generateJobDescription(title: string, department: string): string {
    const descriptions = [
      `We are seeking a talented ${title} to join our ${department} team. You will be responsible for developing innovative solutions and contributing to our growing organization.`,
      `Join our dynamic ${department} team as a ${title}. This role offers the opportunity to work on cutting-edge projects and make a real impact.`,
      `We're looking for an experienced ${title} to help drive our ${department} initiatives forward. You'll work with a collaborative team in a fast-paced environment.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateRequiredSkills(title: string, department: string): string[] {
    const skillMap: { [key: string]: string[] } = {
      'Engineering': ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL'],
      'Marketing': ['Digital Marketing', 'Analytics', 'SEO', 'Content Creation', 'Social Media'],
      'Sales': ['CRM', 'Lead Generation', 'Negotiation', 'Communication', 'Relationship Building'],
      'Design': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research']
    };

    return skillMap[department] || ['Communication', 'Problem Solving', 'Teamwork'];
  }

  private generateRequirements(experience: number): string[] {
    const requirements = [
      `${experience}+ years of relevant experience`,
      'Bachelor\'s degree in related field',
      'Strong communication skills',
      'Ability to work in a team environment',
      'Problem-solving mindset',
      'Adaptability and willingness to learn'
    ];

    if (experience > 5) {
      requirements.push('Leadership experience', 'Mentoring capabilities');
    }

    return requirements;
  }

  private generateBenefits(): string[] {
    const benefits = [
      'Health insurance',
      'Dental insurance',
      'Vision insurance',
      '401(k) matching',
      'Paid time off',
      'Flexible work schedule',
      'Professional development budget',
      'Remote work options'
    ];

    return benefits.slice(0, Math.floor(Math.random() * 6) + 3);
  }

  private calculateMatchScore(candidate: any, position: any): number {
    let score = 0;
    let factors = 0;

    // Skills match (40% weight)
    const candidateSkills = candidate.skills || [];
    const positionSkills = position.skills || [];
    const skillMatches = candidateSkills.filter((skill: string) => 
      positionSkills.some((posSkill: string) => 
        posSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(posSkill.toLowerCase())
      )
    ).length;
    
    if (positionSkills.length > 0) {
      score += (skillMatches / positionSkills.length) * 0.4;
      factors++;
    }

    // Experience match (30% weight)
    const candidateExp = parseInt(candidate.experience) || 0;
    const positionExp = parseInt(position.experience) || 0;
    if (positionExp > 0) {
      const expScore = Math.min(candidateExp / positionExp, 1);
      score += expScore * 0.3;
      factors++;
    }

    // Department match (20% weight)
    if (candidate.department === position.department) {
      score += 0.2;
      factors++;
    }

    // Location match (10% weight)
    if (candidate.location === position.location || 
        candidate.location === 'Remote' || 
        position.location === 'Remote') {
      score += 0.1;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  private getMatchingFactors(candidate: any, position: any): string[] {
    const factors = [];

    // Skills match
    const candidateSkills = candidate.skills || [];
    const positionSkills = position.skills || [];
    const skillMatches = candidateSkills.filter((skill: string) => 
      positionSkills.some((posSkill: string) => 
        posSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    if (skillMatches.length > 0) {
      factors.push(`Skills: ${skillMatches.join(', ')}`);
    }

    // Department match
    if (candidate.department === position.department) {
      factors.push(`Department: ${candidate.department}`);
    }

    // Location match
    if (candidate.location === position.location) {
      factors.push(`Location: ${candidate.location}`);
    }

    return factors;
  }
}
