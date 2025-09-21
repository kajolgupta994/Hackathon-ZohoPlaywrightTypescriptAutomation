import { Page, Locator, expect } from '@playwright/test';
import { ZohoAppPage } from './zoho-app-page';
import { allure } from 'allure-playwright';

/**
 * Candidate Management Page Object
 * Handles candidate profile aggregation and management features
 */
export class CandidatePage extends ZohoAppPage {
  // Candidate list locators
  private readonly candidateList: Locator;
  private readonly candidateCards: Locator;
  private readonly searchInput: Locator;
  private readonly filterDropdown: Locator;
  private readonly sortDropdown: Locator;

  // Candidate profile locators
  private readonly profileModal: Locator;
  private readonly profileHeader: Locator;
  private readonly profileTabs: Locator;
  private readonly recruitData: Locator;
  private readonly peopleData: Locator;
  private readonly aggregatedData: Locator;

  // Action buttons
  private readonly addCandidateBtn: Locator;
  private readonly editCandidateBtn: Locator;
  private readonly deleteCandidateBtn: Locator;
  private readonly matchPositionsBtn: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.candidateList = page.locator('[data-testid="candidate-list"]');
    this.candidateCards = page.locator('[data-testid="candidate-card"]');
    this.searchInput = page.locator('[data-testid="candidate-search"]');
    this.filterDropdown = page.locator('[data-testid="candidate-filter"]');
    this.sortDropdown = page.locator('[data-testid="candidate-sort"]');
    
    this.profileModal = page.locator('[data-testid="candidate-profile-modal"]');
    this.profileHeader = page.locator('[data-testid="profile-header"]');
    this.profileTabs = page.locator('[data-testid="profile-tabs"]');
    this.recruitData = page.locator('[data-testid="recruit-data"]');
    this.peopleData = page.locator('[data-testid="people-data"]');
    this.aggregatedData = page.locator('[data-testid="aggregated-data"]');
    
    this.addCandidateBtn = page.locator('[data-testid="add-candidate-btn"]');
    this.editCandidateBtn = page.locator('[data-testid="edit-candidate-btn"]');
    this.deleteCandidateBtn = page.locator('[data-testid="delete-candidate-btn"]');
    this.matchPositionsBtn = page.locator('[data-testid="match-positions-btn"]');
  }

  /**
   * Navigate to candidate management page
   */
  async navigateToCandidates(): Promise<void> {
    await allure.step('Navigate to candidate management page', async () => {
      await this.clickElement('candidates navigation link');
      await this.waitForElement('candidate list');
      this.logger.info('Navigated to candidate management page');
    });
  }

  /**
   * Search for candidates
   */
  async searchCandidates(searchTerm: string): Promise<void> {
    await allure.step(`Search for candidates: ${searchTerm}`, async () => {
      await this.fillInput('candidate search', searchTerm);
      await this.page.keyboard.press('Enter');
      await this.waitForElement('candidate list');
      this.logger.info(`Searched for candidates: ${searchTerm}`);
    });
  }

  /**
   * Filter candidates by criteria
   */
  async filterCandidates(filterType: string, filterValue: string): Promise<void> {
    await allure.step(`Filter candidates by ${filterType}: ${filterValue}`, async () => {
      await this.clickElement('candidate filter dropdown');
      await this.clickElement(`${filterType} filter option`);
      await this.selectOption('filter value', filterValue);
      await this.waitForElement('candidate list');
      this.logger.info(`Filtered candidates by ${filterType}: ${filterValue}`);
    });
  }

  /**
   * Sort candidates
   */
  async sortCandidates(sortBy: string): Promise<void> {
    await allure.step(`Sort candidates by ${sortBy}`, async () => {
      await this.selectOption('candidate sort', sortBy);
      await this.waitForElement('candidate list');
      this.logger.info(`Sorted candidates by ${sortBy}`);
    });
  }

  /**
   * Open candidate profile
   */
  async openCandidateProfile(candidateName: string): Promise<void> {
    await allure.step(`Open profile for candidate: ${candidateName}`, async () => {
      const candidateCard = this.candidateCards.filter({ hasText: candidateName }).first();
      await candidateCard.click();
      await this.waitForElement('candidate profile modal');
      this.logger.info(`Opened profile for candidate: ${candidateName}`);
    });
  }

  /**
   * Verify candidate profile data aggregation
   */
  async verifyProfileAggregation(): Promise<void> {
    await allure.step('Verify candidate profile data aggregation', async () => {
      // Verify profile modal is open
      await this.verifyElementVisible('candidate profile modal');
      
      // Verify data from Zoho Recruit
      await this.verifyElementVisible('recruit data section');
      await this.verifyElementVisible('recruit candidate name');
      await this.verifyElementVisible('recruit contact info');
      await this.verifyElementVisible('recruit skills');
      
      // Verify data from Zoho People Plus
      await this.verifyElementVisible('people data section');
      await this.verifyElementVisible('people employee info');
      await this.verifyElementVisible('people department');
      await this.verifyElementVisible('people performance');
      
      // Verify aggregated data
      await this.verifyElementVisible('aggregated data section');
      await this.verifyElementVisible('unified skills list');
      await this.verifyElementVisible('experience summary');
      
      this.logger.info('Verified candidate profile data aggregation');
    });
  }

  /**
   * Check for data conflicts
   */
  async checkDataConflicts(): Promise<void> {
    await allure.step('Check for data conflicts between systems', async () => {
      const conflictIndicators = this.page.locator('[data-testid="data-conflict"]');
      const conflictCount = await conflictIndicators.count();
      
      if (conflictCount > 0) {
        this.logger.warn(`Found ${conflictCount} data conflicts`);
        allure.attachment('Data Conflicts', `Found ${conflictCount} conflicts between Zoho Recruit and People Plus data`, 'text/plain');
      } else {
        this.logger.info('No data conflicts found');
      }
    });
  }

  /**
   * Get candidate count
   */
  async getCandidateCount(): Promise<number> {
    const count = await this.candidateCards.count();
    this.logger.debug(`Found ${count} candidates`);
    return count;
  }

  /**
   * Verify candidate card information
   */
  async verifyCandidateCard(candidateName: string, expectedInfo: {
    skills?: string[];
    experience?: string;
    department?: string;
  }): Promise<void> {
    await allure.step(`Verify candidate card for ${candidateName}`, async () => {
      const candidateCard = this.candidateCards.filter({ hasText: candidateName }).first();
      
      if (expectedInfo.skills) {
        for (const skill of expectedInfo.skills) {
          await expect(candidateCard).toContainText(skill);
        }
      }
      
      if (expectedInfo.experience) {
        await expect(candidateCard).toContainText(expectedInfo.experience);
      }
      
      if (expectedInfo.department) {
        await expect(candidateCard).toContainText(expectedInfo.department);
      }
      
      this.logger.info(`Verified candidate card for ${candidateName}`);
    });
  }

  /**
   * Add new candidate
   */
  async addCandidate(candidateData: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: string;
    department: string;
  }): Promise<void> {
    await allure.step(`Add new candidate: ${candidateData.name}`, async () => {
      await this.clickElement('add candidate button');
      await this.waitForElement('candidate form');
      
      await this.fillInput('candidate name', candidateData.name);
      await this.fillInput('candidate email', candidateData.email);
      await this.fillInput('candidate phone', candidateData.phone);
      
      // Add skills
      for (const skill of candidateData.skills) {
        await this.fillInput('skills input', skill);
        await this.page.keyboard.press('Enter');
      }
      
      await this.fillInput('experience', candidateData.experience);
      await this.selectOption('department', candidateData.department);
      
      await this.clickElement('save candidate button');
      await this.waitForElement('candidate list');
      
      this.logger.info(`Added new candidate: ${candidateData.name}`);
    });
  }

  /**
   * Match candidate with positions
   */
  async matchCandidateWithPositions(candidateName: string): Promise<void> {
    await allure.step(`Match candidate ${candidateName} with positions`, async () => {
      await this.openCandidateProfile(candidateName);
      await this.clickElement('match positions button');
      await this.waitForElement('position matches');
      
      // Verify matching results
      await this.verifyElementVisible('match score');
      await this.verifyElementVisible('matched positions list');
      
      this.logger.info(`Matched candidate ${candidateName} with positions`);
    });
  }

  /**
   * Verify intelligent matching functionality
   */
  async verifyIntelligentMatching(): Promise<void> {
    await allure.step('Verify intelligent matching functionality', async () => {
      // Verify match scores are displayed
      const matchScores = this.page.locator('[data-testid="match-score"]');
      const scoreCount = await matchScores.count();
      expect(scoreCount).toBeGreaterThan(0);
      
      // Verify positions are ranked by relevance
      const positionCards = this.page.locator('[data-testid="position-card"]');
      const positionCount = await positionCards.count();
      expect(positionCount).toBeGreaterThan(0);
      
      // Verify filtering options
      await this.verifyElementVisible('match filter dropdown');
      await this.verifyElementVisible('sort by relevance');
      
      this.logger.info('Verified intelligent matching functionality');
    });
  }

  /**
   * Export candidate data
   */
  async exportCandidateData(format: 'csv' | 'excel' | 'pdf'): Promise<void> {
    await allure.step(`Export candidate data as ${format}`, async () => {
      await this.clickElement('export button');
      await this.clickElement(`${format} export option`);
      
      // Wait for download to start
      const downloadPromise = this.page.waitForEvent('download');
      await this.clickElement('confirm export button');
      const download = await downloadPromise;
      
      this.logger.info(`Exported candidate data as ${format}`);
      allure.attachment(`Exported Data (${format})`, download.path() || 'Download completed', 'text/plain');
    });
  }

  /**
   * Verify search functionality
   */
  async verifySearchFunctionality(): Promise<void> {
    await allure.step('Verify search functionality', async () => {
      const searchTerms = ['John', 'Developer', 'Marketing', 'Senior'];
      
      for (const term of searchTerms) {
        await this.searchCandidates(term);
        const results = await this.getCandidateCount();
        expect(results).toBeGreaterThan(0);
        
        // Verify search results contain the term
        const searchResults = this.page.locator('[data-testid="candidate-card"]');
        const firstResult = searchResults.first();
        await expect(firstResult).toContainText(term);
      }
      
      this.logger.info('Verified search functionality');
    });
  }
}
