import { Page, Locator, expect } from '@playwright/test';
import { ZohoAppPage } from './zoho-app-page';
import { allure } from 'allure-playwright';

/**
 * Position Management Page Object
 * Handles position creation, management, and publishing features
 */
export class PositionPage extends ZohoAppPage {
  // Position list locators
  private readonly positionList: Locator;
  private readonly positionCards: Locator;
  private readonly searchInput: Locator;
  private readonly filterDropdown: Locator;
  private readonly statusFilter: Locator;

  // Position form locators
  private readonly positionForm: Locator;
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly departmentSelect: Locator;
  private readonly locationInput: Locator;
  private readonly skillsInput: Locator;
  private readonly experienceSelect: Locator;
  private readonly salaryRangeInput: Locator;
  private readonly employmentTypeSelect: Locator;

  // Action buttons
  private readonly addPositionBtn: Locator;
  private readonly editPositionBtn: Locator;
  private readonly deletePositionBtn: Locator;
  private readonly publishPositionBtn: Locator;
  private readonly unpublishPositionBtn: Locator;
  private readonly duplicatePositionBtn: Locator;

  // Position details
  private readonly positionModal: Locator;
  private readonly positionHeader: Locator;
  private readonly positionTabs: Locator;
  private readonly applicantsTab: Locator;
  private readonly matchesTab: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.positionList = page.locator('[data-testid="position-list"]');
    this.positionCards = page.locator('[data-testid="position-card"]');
    this.searchInput = page.locator('[data-testid="position-search"]');
    this.filterDropdown = page.locator('[data-testid="position-filter"]');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
    
    this.positionForm = page.locator('[data-testid="position-form"]');
    this.titleInput = page.locator('[data-testid="position-title"]');
    this.descriptionInput = page.locator('[data-testid="position-description"]');
    this.departmentSelect = page.locator('[data-testid="position-department"]');
    this.locationInput = page.locator('[data-testid="position-location"]');
    this.skillsInput = page.locator('[data-testid="position-skills"]');
    this.experienceSelect = page.locator('[data-testid="position-experience"]');
    this.salaryRangeInput = page.locator('[data-testid="position-salary"]');
    this.employmentTypeSelect = page.locator('[data-testid="position-employment-type"]');
    
    this.addPositionBtn = page.locator('[data-testid="add-position-btn"]');
    this.editPositionBtn = page.locator('[data-testid="edit-position-btn"]');
    this.deletePositionBtn = page.locator('[data-testid="delete-position-btn"]');
    this.publishPositionBtn = page.locator('[data-testid="publish-position-btn"]');
    this.unpublishPositionBtn = page.locator('[data-testid="unpublish-position-btn"]');
    this.duplicatePositionBtn = page.locator('[data-testid="duplicate-position-btn"]');
    
    this.positionModal = page.locator('[data-testid="position-modal"]');
    this.positionHeader = page.locator('[data-testid="position-header"]');
    this.positionTabs = page.locator('[data-testid="position-tabs"]');
    this.applicantsTab = page.locator('[data-testid="applicants-tab"]');
    this.matchesTab = page.locator('[data-testid="matches-tab"]');
  }

  /**
   * Navigate to position management page
   */
  async navigateToPositions(): Promise<void> {
    await allure.step('Navigate to position management page', async () => {
      await this.clickElement('positions navigation link');
      await this.waitForElement('position list');
      this.logger.info('Navigated to position management page');
    });
  }

  /**
   * Create new position
   */
  async createPosition(positionData: {
    title: string;
    description: string;
    department: string;
    location: string;
    skills: string[];
    experience: string;
    salaryRange: string;
    employmentType: string;
  }): Promise<void> {
    await allure.step(`Create new position: ${positionData.title}`, async () => {
      await this.clickElement('add position button');
      await this.waitForElement('position form');
      
      // Fill basic information
      await this.fillInput('position title', positionData.title);
      await this.fillInput('position description', positionData.description);
      await this.selectOption('position department', positionData.department);
      await this.fillInput('position location', positionData.location);
      
      // Add skills
      for (const skill of positionData.skills) {
        await this.fillInput('position skills', skill);
        await this.page.keyboard.press('Enter');
      }
      
      // Fill additional details
      await this.selectOption('position experience', positionData.experience);
      await this.fillInput('position salary range', positionData.salaryRange);
      await this.selectOption('position employment type', positionData.employmentType);
      
      // Save position
      await this.clickElement('save position button');
      await this.waitForElement('position list');
      
      this.logger.info(`Created new position: ${positionData.title}`);
    });
  }

  /**
   * Publish position
   */
  async publishPosition(positionTitle: string): Promise<void> {
    await allure.step(`Publish position: ${positionTitle}`, async () => {
      const positionCard = this.positionCards.filter({ hasText: positionTitle }).first();
      await positionCard.hover();
      await this.clickElement('publish position button');
      
      // Confirm publication
      await this.clickElement('confirm publish button');
      await this.waitForElement('position list');
      
      // Verify position is published
      await this.verifyPositionStatus(positionTitle, 'Published');
      
      this.logger.info(`Published position: ${positionTitle}`);
    });
  }

  /**
   * Verify position status
   */
  async verifyPositionStatus(positionTitle: string, expectedStatus: string): Promise<void> {
    await allure.step(`Verify position status for ${positionTitle}`, async () => {
      const positionCard = this.positionCards.filter({ hasText: positionTitle }).first();
      const statusElement = positionCard.locator('[data-testid="position-status"]');
      await expect(statusElement).toHaveText(expectedStatus);
      
      this.logger.info(`Verified position ${positionTitle} status: ${expectedStatus}`);
    });
  }

  /**
   * Search positions
   */
  async searchPositions(searchTerm: string): Promise<void> {
    await allure.step(`Search for positions: ${searchTerm}`, async () => {
      await this.fillInput('position search', searchTerm);
      await this.page.keyboard.press('Enter');
      await this.waitForElement('position list');
      this.logger.info(`Searched for positions: ${searchTerm}`);
    });
  }

  /**
   * Filter positions by criteria
   */
  async filterPositions(filterType: string, filterValue: string): Promise<void> {
    await allure.step(`Filter positions by ${filterType}: ${filterValue}`, async () => {
      await this.clickElement('position filter dropdown');
      await this.clickElement(`${filterType} filter option`);
      await this.selectOption('filter value', filterValue);
      await this.waitForElement('position list');
      this.logger.info(`Filtered positions by ${filterType}: ${filterValue}`);
    });
  }

  /**
   * Open position details
   */
  async openPositionDetails(positionTitle: string): Promise<void> {
    await allure.step(`Open details for position: ${positionTitle}`, async () => {
      const positionCard = this.positionCards.filter({ hasText: positionTitle }).first();
      await positionCard.click();
      await this.waitForElement('position modal');
      this.logger.info(`Opened details for position: ${positionTitle}`);
    });
  }

  /**
   * View position applicants
   */
  async viewPositionApplicants(positionTitle: string): Promise<void> {
    await allure.step(`View applicants for position: ${positionTitle}`, async () => {
      await this.openPositionDetails(positionTitle);
      await this.clickElement('applicants tab');
      await this.waitForElement('applicants list');
      this.logger.info(`Viewed applicants for position: ${positionTitle}`);
    });
  }

  /**
   * View position matches
   */
  async viewPositionMatches(positionTitle: string): Promise<void> {
    await allure.step(`View matches for position: ${positionTitle}`, async () => {
      await this.openPositionDetails(positionTitle);
      await this.clickElement('matches tab');
      await this.waitForElement('matches list');
      this.logger.info(`Viewed matches for position: ${positionTitle}`);
    });
  }

  /**
   * Verify intelligent matching for position
   */
  async verifyPositionMatching(positionTitle: string): Promise<void> {
    await allure.step(`Verify intelligent matching for position: ${positionTitle}`, async () => {
      await this.viewPositionMatches(positionTitle);
      
      // Verify match scores are displayed
      const matchScores = this.page.locator('[data-testid="match-score"]');
      const scoreCount = await matchScores.count();
      expect(scoreCount).toBeGreaterThan(0);
      
      // Verify candidates are ranked by relevance
      const candidateMatches = this.page.locator('[data-testid="candidate-match"]');
      const matchCount = await candidateMatches.count();
      expect(matchCount).toBeGreaterThan(0);
      
      // Verify matching criteria
      await this.verifyElementVisible('matching criteria');
      await this.verifyElementVisible('skills match');
      await this.verifyElementVisible('experience match');
      
      this.logger.info(`Verified intelligent matching for position: ${positionTitle}`);
    });
  }

  /**
   * Duplicate position
   */
  async duplicatePosition(positionTitle: string): Promise<void> {
    await allure.step(`Duplicate position: ${positionTitle}`, async () => {
      const positionCard = this.positionCards.filter({ hasText: positionTitle }).first();
      await positionCard.hover();
      await this.clickElement('duplicate position button');
      
      // Modify title for duplicate
      const newTitle = `${positionTitle} (Copy)`;
      await this.fillInput('position title', newTitle);
      await this.clickElement('save position button');
      await this.waitForElement('position list');
      
      this.logger.info(`Duplicated position: ${positionTitle} as ${newTitle}`);
    });
  }

  /**
   * Edit position
   */
  async editPosition(positionTitle: string, updates: Partial<{
    title: string;
    description: string;
    department: string;
    location: string;
    skills: string[];
    experience: string;
    salaryRange: string;
    employmentType: string;
  }>): Promise<void> {
    await allure.step(`Edit position: ${positionTitle}`, async () => {
      const positionCard = this.positionCards.filter({ hasText: positionTitle }).first();
      await positionCard.hover();
      await this.clickElement('edit position button');
      await this.waitForElement('position form');
      
      // Apply updates
      if (updates.title) await this.fillInput('position title', updates.title);
      if (updates.description) await this.fillInput('position description', updates.description);
      if (updates.department) await this.selectOption('position department', updates.department);
      if (updates.location) await this.fillInput('position location', updates.location);
      if (updates.experience) await this.selectOption('position experience', updates.experience);
      if (updates.salaryRange) await this.fillInput('position salary range', updates.salaryRange);
      if (updates.employmentType) await this.selectOption('position employment type', updates.employmentType);
      
      if (updates.skills) {
        // Clear existing skills and add new ones
        const skillsInput = this.page.locator('[data-testid="position-skills"]');
        await skillsInput.click();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Delete');
        
        for (const skill of updates.skills) {
          await this.fillInput('position skills', skill);
          await this.page.keyboard.press('Enter');
        }
      }
      
      await this.clickElement('save position button');
      await this.waitForElement('position list');
      
      this.logger.info(`Edited position: ${positionTitle}`);
    });
  }

  /**
   * Delete position
   */
  async deletePosition(positionTitle: string): Promise<void> {
    await allure.step(`Delete position: ${positionTitle}`, async () => {
      const positionCard = this.positionCards.filter({ hasText: positionTitle }).first();
      await positionCard.hover();
      await this.clickElement('delete position button');
      
      // Confirm deletion
      await this.clickElement('confirm delete button');
      await this.waitForElement('position list');
      
      this.logger.info(`Deleted position: ${positionTitle}`);
    });
  }

  /**
   * Get position count
   */
  async getPositionCount(): Promise<number> {
    const count = await this.positionCards.count();
    this.logger.debug(`Found ${count} positions`);
    return count;
  }

  /**
   * Verify position form validation
   */
  async verifyFormValidation(): Promise<void> {
    await allure.step('Verify position form validation', async () => {
      await this.clickElement('add position button');
      await this.waitForElement('position form');
      
      // Try to save without required fields
      await this.clickElement('save position button');
      
      // Verify validation messages
      await this.verifyElementVisible('title required error');
      await this.verifyElementVisible('description required error');
      await this.verifyElementVisible('department required error');
      
      this.logger.info('Verified position form validation');
    });
  }

  /**
   * Export positions
   */
  async exportPositions(format: 'csv' | 'excel' | 'pdf'): Promise<void> {
    await allure.step(`Export positions as ${format}`, async () => {
      await this.clickElement('export positions button');
      await this.clickElement(`${format} export option`);
      
      // Wait for download to start
      const downloadPromise = this.page.waitForEvent('download');
      await this.clickElement('confirm export button');
      const download = await downloadPromise;
      
      this.logger.info(`Exported positions as ${format}`);
      const downloadPath = await download.path();
      allure.attachment(`Exported Positions (${format})`, downloadPath || 'Download completed', 'text/plain');
    });
  }
}
