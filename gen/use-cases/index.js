const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, 'platform-orchestrator-use-cases');
const TARGET_DIR = path.join(__dirname, '../../content/platform-orchestrator/docs/use-cases');

/**
 * Recursively traverse a directory and find all directories containing a main.tf file
 * @param {string} dir - The directory to traverse
 * @param {string} baseDir - The base directory for calculating relative paths
 * @returns {Array<{dir: string, relativePath: string}>} Array of directories with main.tf
 */
function findMainTfDirectories(dir, baseDir = dir) {
  const results = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    // Check if this directory contains main.tf
    const hasMainTf = entries.some(entry => 
      entry.isFile() && entry.name === 'main.tf'
    );
    
    if (hasMainTf) {
      const relativePath = path.relative(baseDir, dir);
      results.push({
        dir,
        relativePath
      });
    }
    
    // Recursively traverse subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subdirPath = path.join(dir, entry.name);
        const subdirResults = findMainTfDirectories(subdirPath, baseDir);
        results.push(...subdirResults);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

/**
 * Extract the first level 1 header from markdown content and count total level 1 headers
 * Ignores lines inside code blocks
 * @param {string} content - The markdown content
 * @returns {{title: string|null, count: number}} The title and count of level 1 headers
 */
function extractTitle(content) {
  const lines = content.split('\n');
  let title = null;
  let count = 0;
  let inCodeBlock = false;
  
  for (const line of lines) {
    // Check if we're entering or exiting a code block
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    // Skip lines inside code blocks
    if (inCodeBlock) {
      continue;
    }
    
    const match = line.match(/^#\s+(.+)$/);
    if (match) {
      count++;
      if (!title) {
        title = match[1].trim();
      }
    }
  }
  
  return { title, count };
}

/**
 * Remove all level 1 markdown headers from content
 * Ignores lines inside code blocks
 * @param {string} content - The markdown content
 * @returns {string} The content with level 1 headers removed
 */
function removeLevel1Headers(content) {
  const lines = content.split('\n');
  const filteredLines = [];
  let inCodeBlock = false;
  
  for (const line of lines) {
    // Check if we're entering or exiting a code block
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      filteredLines.push(line);
      continue;
    }
    
    // If inside code block, keep all lines
    if (inCodeBlock) {
      filteredLines.push(line);
      continue;
    }
    
    // Outside code block, filter out level 1 headers
    if (!line.match(/^#\s+.+$/)) {
      filteredLines.push(line);
    }
  }
  
  // Join the lines and clean up multiple consecutive empty lines
  let result = filteredLines.join('\n');
  
  // Replace multiple consecutive newlines (more than 2) with just 2 newlines
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // Trim leading whitespace
  result = result.trimStart();
  
  return result;
}

/**
 * Extract the first sentence that is not a header
 * @param {string} content - The markdown content
 * @returns {string|null} The description or null if not found
 */
function extractDescription(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Skip empty lines and headers
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    // Find the first sentence (ending with ., !, or ?)
    const sentenceMatch = trimmedLine.match(/^([^.!?]+[.!?])/);
    if (sentenceMatch) {
      return sentenceMatch[1].trim();
    }
    // If no sentence-ending punctuation, use the whole line if it's not too short
    if (trimmedLine.length > 10) {
      return trimmedLine;
    }
  }
  return null;
}

/**
 * Generate frontmatter for the markdown file
 * @param {string} title - The title
 * @param {string} description - The description
 * @returns {string} The frontmatter content
 */
function generateFrontmatter(title, description) {
  return `---
title: ${title}
description: ${description}
draft: false
type: docs
weight: 1
toc: true
---

`;
}

/**
 * Process a single use case directory
 * @param {string} dir - The directory containing main.tf
 * @param {string} relativePath - The relative path from the base directory
 */
function processUseCase(dir, relativePath) {
  // Check if README.md exists
  const readmePath = path.join(dir, 'README.md');
  
  if (!fs.existsSync(readmePath)) {
    throw new Error(`No README found for use case in ${dir}`);
  }
  
  // Read the README content
  const readmeContent = fs.readFileSync(readmePath, 'utf-8');
  
  // Extract title from first level 1 header and validate count
  const { title, count } = extractTitle(readmeContent);
  
  if (!title) {
    throw new Error(`No level 1 header found to use for title in ${readmePath}`);
  }
  
  if (count > 1) {
    throw new Error(`More than one level 1 header found in ${readmePath}`);
  }
  
  // Extract description from first sentence
  const description = extractDescription(readmeContent);
  if (!description) {
    throw new Error(`No first sentence found to use for description in ${readmePath}`);
  }
  
  // Remove level 1 headers from the content
  const contentWithoutHeaders = removeLevel1Headers(readmeContent);
  
  // Generate frontmatter
  const frontmatter = generateFrontmatter(title, description);
  
  // Combine frontmatter with README content (without level 1 headers)
  const fullContent = frontmatter + contentWithoutHeaders;
  
  // Generate the output filename by replacing path separators with hyphens
  // and adding .md extension
  const outputFileName = relativePath.replace(/\//g, '-') + '.md';
  const outputPath = path.join(TARGET_DIR, outputFileName);
  
  // Ensure the target directory exists
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
  
  // Write the content to the target file
  fs.writeFileSync(outputPath, fullContent, 'utf-8');
  
  console.log(`✓ Generated: ${outputFileName}`);
}

/**
 * Main function
 */
function main() {
  console.log('Starting use case documentation generation...');
  console.log(`Source directory: ${SOURCE_DIR}`);
  console.log(`Target directory: ${TARGET_DIR}\n`);
  
  // Check if source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Error: Source directory does not exist: ${SOURCE_DIR}`);
    process.exit(1);
  }
  
  // Find all directories containing main.tf
  const useCases = findMainTfDirectories(SOURCE_DIR);
  
  if (useCases.length === 0) {
    console.log('No use cases found (no directories with main.tf)');
    return;
  }
  
  console.log(`Found ${useCases.length} use case(s):\n`);
  
  // Process each use case
  let successCount = 0;
  let errorCount = 0;
  
  for (const { dir, relativePath } of useCases) {
    try {
      processUseCase(dir, relativePath);
      successCount++;
    } catch (error) {
      console.error(`✗ Error processing ${relativePath}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\nComplete! ${successCount} file(s) generated, ${errorCount} error(s)`);
  
  if (errorCount > 0) {
    process.exit(1);
  }
}

// Run the script
main();
