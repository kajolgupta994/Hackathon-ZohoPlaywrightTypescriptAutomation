import { test, expect } from '../core/test-base';
import { CandidatePage } from '../pages/candidate-page';
import { allure } from 'allure-playwright';

/**
 * Candidate Management Test Suite
 * AI-driven tests for candidate profile aggregation and management
 */
test.describe('Candidate Management @candidate @e2e', () => {
  let candidatePage: CandidatePage;

  test.beforeEach(async ({ page, testBase }) => {
    candidatePage = new CandidatePage(page);
    await candidatePage.navigateToCandidates();
  });

  test('should aggregate candidate data from Zoho Recruit and People Plus @smoke @critical', async ({ page, testBase }) => {
    await allure.step('Verify candidate data aggregation', async () => {
      // Search for a specific candidate
      await candidatePage.searchCandidates('John Doe');
      
      // Verify candidate appears in results
      const candidateCount = await candidatePage.getCandidateCount();
      expect(candidateCount).toBeGreaterThan(0);
      
      // Open candidate profile
      await candidatePage.openCandidateProfile('John Doe');
      
      // Verify data aggregation
      await candidatePage.verifyProfileAggregation();
      
      // Check for data conflicts
      await candidatePage.checkDataConflicts();
    });
  });

  test('should perform intelligent candidate search @search @regression', async ({ page, testBase }) => {
    await allure.step('Test intelligent search functionality', async () => {
      // Test various search terms
      const searchTerms = ['Developer', 'Marketing', 'Senior', 'Python'];
      
      for (const term of searchTerms) {
        await candidatePage.searchCandidates(term);
        
        // Verify search results
        const results = await candidatePage.getCandidateCount();
        expect(results).toBeGreaterThan(0);
        
        // Verify search results contain the term
        const firstResult = page.locator('[data-testid="candidate-card"]').first();
        await expect(firstResult).toContainText(term);
      }
    });
  });

  test('should filter candidates by multiple criteria @filter @regression', async ({ page, testBase }) => {
    await allure.step('Test candidate filtering', async () => {
      // Filter by department
      await candidatePage.filterCandidates('department', 'Engineering');
      
      // Verify filtered results
      const engineeringCandidates = await candidatePage.getCandidateCount();
      expect(engineeringCandidates).toBeGreaterThan(0);
      
      // Filter by experience level
      await candidatePage.filterCandidates('experience', 'Senior');
      
      // Verify combined filters
      const seniorEngineers = await candidatePage.getCandidateCount();
      expect(seniorEngineers).toBeGreaterThan(0);
    });
  });

  test('should sort candidates by relevance @sort @regression', async ({ page, testBase }) => {
    await allure.step('Test candidate sorting', async () => {
      // Sort by skills match
      await candidatePage.sortCandidates('skills-match');
      
      // Verify sorting order
      const candidateCards = page.locator('[data-testid="candidate-card"]');
      const firstCard = candidateCards.first();
      const secondCard = candidateCards.nth(1);
      
      // Verify first card has higher match score
      const firstScore = await firstCard.locator('[data-testid="match-score"]').textContent();
      const secondScore = await secondCard.locator('[data-testid="match-score"]').textContent();
      
      expect(parseInt(firstScore || '0')).toBeGreaterThanOrEqual(parseInt(secondScore || '0'));
    });
  });

  test('should match candidates with positions intelligently @matching @critical', async ({ page, testBase }) => {
    await allure.step('Test intelligent matching', async () => {
      // Open candidate profile
      await candidatePage.openCandidateProfile('John Doe');
      
      // Match with positions
      await candidatePage.matchCandidateWithPositions('John Doe');
      
      // Verify matching functionality
      await candidatePage.verifyIntelligentMatching();
    });
  });

  test('should add new candidate with validation @add @regression', async ({ page, testBase }) => {
    await allure.step('Test adding new candidate', async () => {
      const candidateData = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0123',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '5 years',
        department: 'Engineering'
      };
      
      // Add candidate
      await candidatePage.addCandidate(candidateData);
      
      // Verify candidate was added
      await candidatePage.searchCandidates('Jane Smith');
      const candidateCount = await candidatePage.getCandidateCount();
      expect(candidateCount).toBeGreaterThan(0);
      
      // Verify candidate information
      await candidatePage.verifyCandidateCard('Jane Smith', {
        skills: ['JavaScript', 'React'],
        department: 'Engineering'
      });
    });
  });

  test('should export candidate data @export @regression', async ({ page, testBase }) => {
    await allure.step('Test candidate data export', async () => {
      // Export as CSV
      await candidatePage.exportCandidateData('csv');
      
      // Verify download started
      const downloadPromise = page.waitForEvent('download');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    });
  });

  test('should handle data synchronization between systems @sync @integration', async ({ page, testBase }) => {
    await allure.step('Test data synchronization', async () => {
      // Open candidate profile
      await candidatePage.openCandidateProfile('John Doe');
      
      // Verify data from both systems is present
      await candidatePage.verifyElementVisible('recruit data section');
      await candidatePage.verifyElementVisible('people data section');
      
      // Check for sync indicators
      const syncStatus = page.locator('[data-testid="sync-status"]');
      await expect(syncStatus).toContainText('Up to date');
    });
  });

  test('should display visual candidate cards correctly @visual', async ({ page, testBase }) => {
    await allure.step('Test visual appearance of candidate cards', async () => {
      // Take visual comparison
      const visualResult = await candidatePage.compareVisual(
        '[data-testid="candidate-list"]',
        'candidate-list-visual',
        { threshold: 0.1 }
      );
      
      expect(visualResult.passed).toBe(true);
    });
  });
});
