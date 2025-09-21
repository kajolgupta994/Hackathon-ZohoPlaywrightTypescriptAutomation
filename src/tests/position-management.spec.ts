import { test, expect } from '../core/test-base';
import { PositionPage } from '../pages/position-page';
import { allure } from 'allure-playwright';

/**
 * Position Management Test Suite
 * AI-driven tests for position creation, management, and publishing
 */
test.describe('Position Management @position @e2e', () => {
  let positionPage: PositionPage;

  test.beforeEach(async ({ page, testBase }) => {
    positionPage = new PositionPage(page);
    await positionPage.navigateToPositions();
  });

  test('should create and publish new position @smoke @critical', async ({ page, testBase }) => {
    await allure.step('Create and publish new position', async () => {
      const positionData = {
        title: 'Senior Software Engineer',
        description: 'We are looking for a senior software engineer with expertise in modern web technologies.',
        department: 'Engineering',
        location: 'San Francisco, CA',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        experience: '5+ years',
        salaryRange: '$120,000 - $150,000',
        employmentType: 'Full-time'
      };
      
      // Create position
      await positionPage.createPosition(positionData);
      
      // Verify position was created
      await positionPage.searchPositions('Senior Software Engineer');
      const positionCount = await positionPage.getPositionCount();
      expect(positionCount).toBeGreaterThan(0);
      
      // Publish position
      await positionPage.publishPosition('Senior Software Engineer');
      
      // Verify position is published
      await positionPage.verifyPositionStatus('Senior Software Engineer', 'Published');
    });
  });

  test('should validate position form fields @validation @regression', async ({ page, testBase }) => {
    await allure.step('Test position form validation', async () => {
      // Test form validation
      await positionPage.verifyFormValidation();
    });
  });

  test('should search and filter positions @search @filter @regression', async ({ page, testBase }) => {
    await allure.step('Test position search and filtering', async () => {
      // Search for positions
      await positionPage.searchPositions('Engineer');
      
      // Verify search results
      const searchResults = await positionPage.getPositionCount();
      expect(searchResults).toBeGreaterThan(0);
      
      // Filter by department
      await positionPage.filterPositions('department', 'Engineering');
      
      // Verify filtered results
      const filteredResults = await positionPage.getPositionCount();
      expect(filteredResults).toBeGreaterThan(0);
    });
  });

  test('should view position applicants and matches @matching @integration', async ({ page, testBase }) => {
    await allure.step('Test position applicants and matches', async () => {
      // Open position details
      await positionPage.openPositionDetails('Senior Software Engineer');
      
      // View applicants
      await positionPage.viewPositionApplicants('Senior Software Engineer');
      
      // Verify applicants are displayed
      await positionPage.verifyElementVisible('applicants list');
      
      // View matches
      await positionPage.viewPositionMatches('Senior Software Engineer');
      
      // Verify intelligent matching
      await positionPage.verifyPositionMatching('Senior Software Engineer');
    });
  });

  test('should edit existing position @edit @regression', async ({ page, testBase }) => {
    await allure.step('Test position editing', async () => {
      const updates = {
        title: 'Lead Software Engineer',
        description: 'Updated description for lead position',
        salaryRange: '$130,000 - $160,000'
      };
      
      // Edit position
      await positionPage.editPosition('Senior Software Engineer', updates);
      
      // Verify changes
      await positionPage.searchPositions('Lead Software Engineer');
      const positionCount = await positionPage.getPositionCount();
      expect(positionCount).toBeGreaterThan(0);
    });
  });

  test('should duplicate position @duplicate @regression', async ({ page, testBase }) => {
    await allure.step('Test position duplication', async () => {
      // Duplicate position
      await positionPage.duplicatePosition('Senior Software Engineer');
      
      // Verify duplicate was created
      await positionPage.searchPositions('Senior Software Engineer (Copy)');
      const positionCount = await positionPage.getPositionCount();
      expect(positionCount).toBeGreaterThan(0);
    });
  });

  test('should delete position @delete @regression', async ({ page, testBase }) => {
    await allure.step('Test position deletion', async () => {
      // Delete position
      await positionPage.deletePosition('Senior Software Engineer (Copy)');
      
      // Verify position was deleted
      await positionPage.searchPositions('Senior Software Engineer (Copy)');
      const positionCount = await positionPage.getPositionCount();
      expect(positionCount).toBe(0);
    });
  });

  test('should export positions data @export @regression', async ({ page, testBase }) => {
    await allure.step('Test position data export', async () => {
      // Export as Excel
      await positionPage.exportPositions('excel');
      
      // Verify download started
      const downloadPromise = page.waitForEvent('download');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.xlsx');
    });
  });

  test('should handle position status changes @status @integration', async ({ page, testBase }) => {
    await allure.step('Test position status management', async () => {
      // Create draft position
      const positionData = {
        title: 'Draft Position',
        description: 'This is a draft position',
        department: 'Engineering',
        location: 'Remote',
        skills: ['JavaScript'],
        experience: '2+ years',
        salaryRange: '$80,000 - $100,000',
        employmentType: 'Full-time'
      };
      
      await positionPage.createPosition(positionData);
      
      // Verify draft status
      await positionPage.verifyPositionStatus('Draft Position', 'Draft');
      
      // Publish position
      await positionPage.publishPosition('Draft Position');
      
      // Verify published status
      await positionPage.verifyPositionStatus('Draft Position', 'Published');
    });
  });

  test('should display position cards visually correct @visual', async ({ page, testBase }) => {
    await allure.step('Test visual appearance of position cards', async () => {
      // Take visual comparison
      const visualResult = await positionPage.compareVisual(
        '[data-testid="position-list"]',
        'position-list-visual',
        { threshold: 0.1 }
      );
      
      expect(visualResult.passed).toBe(true);
    });
  });

  test('should handle bulk position operations @bulk @regression', async ({ page, testBase }) => {
    await allure.step('Test bulk position operations', async () => {
      // Create multiple positions
      const positions = [
        {
          title: 'Frontend Developer',
          description: 'Frontend developer position',
          department: 'Engineering',
          location: 'New York, NY',
          skills: ['React', 'JavaScript'],
          experience: '3+ years',
          salaryRange: '$90,000 - $110,000',
          employmentType: 'Full-time'
        },
        {
          title: 'Backend Developer',
          description: 'Backend developer position',
          department: 'Engineering',
          location: 'Austin, TX',
          skills: ['Node.js', 'Python'],
          experience: '4+ years',
          salaryRange: '$95,000 - $115,000',
          employmentType: 'Full-time'
        }
      ];
      
      for (const position of positions) {
        await positionPage.createPosition(position);
      }
      
      // Verify all positions were created
      const totalPositions = await positionPage.getPositionCount();
      expect(totalPositions).toBeGreaterThanOrEqual(2);
    });
  });
});
