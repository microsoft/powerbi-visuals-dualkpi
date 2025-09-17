# GitHub Copilot Instructions for Certified Power BI Custom Visual

## Project Overview
This repository contains a Power BI custom visual that aims to achieve Microsoft certification. Certified Power BI visuals must meet strict code requirements and security standards set by the Microsoft Power BI team.

## Certification Goals
- Meet all Microsoft certification requirements for Power BI custom visuals
- Pass code reviews, static code analysis, and security testing
- Maintain compatibility with PowerPoint export and email subscriptions
- Ensure safe DOM manipulation and secure coding practices
- Support the latest Power BI SDK and rendering events API

## Technology Stack
- **TypeScript**: Primary development language (strongly typed, object-oriented)
- **D3.js**: Core library for data visualization and DOM manipulation
- **Power BI Visuals SDK**: Latest version of powerbi-visuals-tools
- **Node.js**: Development environment and build tools
- **npm**: Package management

## Required Files and Structure
The repository must contain these essential files:
- `capabilities.json` - Visual configuration and data mappings
- `pbiviz.json` - Visual metadata and build configuration
- `package.json` - Dependencies and build scripts
- `package-lock.json` - Dependency lock file
- `tsconfig.json` - TypeScript compiler configuration
- `.gitignore` - Must exclude node_modules, .tmp, and dist folders
- `src/visual.ts` - Main visual implementation file

## Coding Standards and Conventions

### TypeScript Best Practices
- Use strict TypeScript configuration with type safety enabled
- Prefer strongly typed interfaces and classes over any types
- Use arrow functions for callbacks and event handlers
- Implement proper error handling for all operations
- Follow object-oriented programming principles

### Naming Conventions
- Use PascalCase for classes and interfaces
- Use camelCase for variables, methods, and properties
- Use UPPER_CASE for constants
- Use descriptive names that clearly indicate purpose

### Code Organization
- Separate concerns into logical modules and classes
- Keep the main visual class focused on visualization logic
- Extract utility functions into separate modules
- Maintain clean separation between data processing and rendering

## Certification Requirements - CRITICAL SECURITY RULES

### STRICTLY FORBIDDEN - These will cause certification failure:
- **NO external network requests**: Never use `fetch()`, `XMLHttpRequest`, or WebSocket connections
- **NO dynamic code execution**: Never use `eval()`, `Function()` constructor, or similar methods
- **NO unsafe DOM manipulation**: Never use `innerHTML` with user data or `D3.html()` with user input
- **NO arbitrary timeouts**: Avoid unsafe use of `setTimeout()`, `setInterval()` with user-provided functions
- **NO minified code**: All JavaScript/TypeScript must be readable and reviewable
- **NO private/commercial libraries**: Only use public, reviewable open-source components
- **NO external service access**: WebAccess privileges must be empty or omitted in capabilities.json

### Required Security Practices:
- **Sanitize all user input** before adding to DOM
- **Use safe DOM methods** like `textContent`, `setAttribute`, or D3's safe methods
- **Implement proper error handling** to prevent JavaScript exceptions
- **Support Rendering Events API** for proper lifecycle management
- **Validate all data inputs** before processing

## Package Management Requirements

### Required Dependencies in package.json:
```json
{
  "devDependencies": {
    "typescript": "latest",
    "eslint": "latest",
    "eslint-plugin-powerbi-visuals": "latest"
  },
  "scripts": {
    "eslint": "npx eslint . --ext .js,.jsx,.ts,.tsx",
    "package": "pbiviz package"
  }
}
```

### Build Commands That Must Work:
- `npm install` - Must complete without errors
- `pbiviz package` - Must compile successfully  
- `npm audit` - Must not return high or moderate warnings
- `npm run eslint` - Must pass without lint errors

## Data Handling Guidelines

### capabilities.json Configuration:
- Define clear dataRoles with appropriate displayName, name, and kind
- Implement proper dataViewMappings for your visual type
- Use objects section for formatting properties
- Set appropriate privileges (usually empty for certified visuals)
- Support tooltips, highlighting, and other Power BI features

### Data Processing:
- Handle empty or null data gracefully
- Implement proper data validation and type checking
- Support dynamic data updates through the update() method
- Respect data view mappings and transformations
- Test with various data sizes and edge cases

## Visual Implementation Standards

### Main Visual Class Structure:
```typescript
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private host: IVisualHost;

    constructor(options: VisualConstructorOptions) {
        // Initialize visual components safely
    }

    public update(options: VisualUpdateOptions) {
        // Handle data updates and rendering
        // Always check for data availability
        // Implement proper error handling
    }

    public destroy(): void {
        // Clean up resources properly
    }
}
```

### Rendering Best Practices:
- Use D3.js for safe data binding and DOM manipulation
- Implement proper enter/update/exit patterns for data joins
- Handle viewport changes and resizing gracefully
- Support accessibility features (ARIA labels, keyboard navigation)
- Optimize performance for large datasets

## Testing and Quality Assurance

### Testing Requirements:
- Test with sample report data
- Verify behavior with empty datasets
- Test cross-filtering and highlighting functionality
- Validate formatting options work correctly
- Test in both Power BI Desktop and Service
- Ensure no console errors or warnings

### Performance Considerations:
- Optimize rendering for large datasets
- Implement efficient data processing algorithms
- Avoid memory leaks in event handlers
- Use requestAnimationFrame for smooth animations
- Profile and optimize critical code paths

## Repository Management for Certification

### Branch Structure:
- Maintain a `certification` branch (lowercase required)
- Source code in certification branch must match submitted package
- Only update certification branch during resubmission process

### Git Best Practices:
- Use meaningful commit messages
- Keep commits atomic and focused
- Include proper .gitignore for Node.js projects
- Tag releases with version numbers
- Document changes in commit history

## Code Review Guidelines

### Before Committing:
- Run all build commands successfully
- Execute eslint without errors
- Test visual with various data scenarios
- Verify no forbidden patterns are used
- Check for proper error handling
- Validate accessibility compliance

### Code Quality Checks:
- Ensure TypeScript strict mode compliance
- Verify proper type annotations
- Check for unused imports or variables
- Validate proper resource cleanup
- Review security implications of all code changes

## Common Patterns to Watch For

### Replace These Unsafe Patterns:
- `element.innerHTML = userData` → Use `element.textContent = userData`
- `fetch(url)` → Remove external API calls entirely
- `eval(code)` → Refactor to avoid dynamic code execution
- `setTimeout(userFunction)` → Use fixed, safe timeout functions only

### Preferred Safe Alternatives:
- Use D3's data binding instead of direct DOM manipulation
- Use Power BI's built-in formatting instead of external libraries
- Use capabilities.json objects for user customization
- Use IVisualHost services for Power BI integration

Remember: Certification requires passing Microsoft's security review, code analysis, and functional testing. Every piece of code will be scrutinized for security vulnerabilities and compliance with Power BI standards.