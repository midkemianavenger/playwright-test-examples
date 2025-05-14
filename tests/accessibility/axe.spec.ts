import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults, Result, NodeResult, ImpactValue } from 'axe-core';

type ReportViolation = {
  impact: ImpactValue | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    failureSummary: string | null;
    target: string[];
  }>;
};

interface AccessibilityReport {
  violations: ReportViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  timestamp: string;
}

interface ViolationsByImpact {
  [key: string]: Array<{
    id: string;
    description: string;
    help: string;
    helpUrl: string;
  }>;
}

test.describe('Accessibility Tests with Axe DevTools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');
  });

  test('should check home page for accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should check form inputs for accessibility', async ({ page }) => {
    // Add a todo item to test form interaction
    await page.getByPlaceholder('What needs to be done?').fill('Test todo item');
    await page.keyboard.press('Enter');

    const results = await new AxeBuilder({ page })
      .include('#todo-list') // Only test the todo list
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should check specific WCAG rules', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .options({
        runOnly: {
          type: 'rule',
          values: [
            'label',
            'color-contrast',
            'aria-roles',
            'image-alt',
            'link-name'
          ]
        }
      })
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should check dynamic content updates', async ({ page }) => {
    // Add multiple todo items
    const todos = ['Item 1', 'Item 2', 'Item 3'];
    for (const todo of todos) {
      await page.getByPlaceholder('What needs to be done?').fill(todo);
      await page.keyboard.press('Enter');
    }

    // Complete one item
    await page.getByRole('checkbox').first().check();

    const results = await new AxeBuilder({ page })
      .include('#todo-list')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should check responsive layout accessibility', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    let results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('should generate detailed accessibility report', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();

    // Create detailed report
    const report: AccessibilityReport = {
      violations: results.violations.map(violation => ({
        impact: violation.impact || null,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map(node => ({
          html: node.html,
          failureSummary: node.failureSummary || null,
          target: Array.isArray(node.target) 
            ? node.target.map(String)
            : [String(node.target)]
        }))
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
      timestamp: new Date().toISOString()
    };

    // Save report to file
    const fs = require('fs');
    const reportDir = 'test-results/accessibility';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(
      `${reportDir}/a11y-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
      JSON.stringify(report, null, 2)
    );
    
    // Verify no violations
    expect(results.violations).toEqual([]);
  });

  test('should check custom rules and best practices', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .options({
        rules: {
          'color-contrast': { enabled: true },
          'label': { enabled: true },
          'aria-roles': { enabled: true },
          'image-alt': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'button-name': { enabled: true },
          'document-title': { enabled: true },
          'duplicate-id': { enabled: true },
          'frame-title': { enabled: true },
          'html-has-lang': { enabled: true },
          'landmark-one-main': { enabled: true },
          'page-has-heading-one': { enabled: true },
          'scrollable-region-focusable': { enabled: true }
        }
      })
      .analyze();

    // Group violations by impact
    const violationsByImpact: ViolationsByImpact = results.violations.reduce((acc, violation) => {
      const impact = violation.impact || 'unknown';
      if (!acc[impact]) {
        acc[impact] = [];
      }
      acc[impact].push({
        id: violation.id,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl
      });
      return acc;
    }, {} as ViolationsByImpact);

    // Save detailed report
    const fs = require('fs');
    const reportDir = 'test-results/accessibility';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(
      `${reportDir}/violations-by-impact-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
      JSON.stringify(violationsByImpact, null, 2)
    );

    expect(results.violations).toEqual([]);
  });
});
