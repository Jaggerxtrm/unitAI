#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES modules support for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode: string;
    prompt: string;
}

interface FileTriggers {
    pathPatterns?: string[];
    contentPatterns?: string[];
}

interface PromptTriggers {
    keywords?: string[];
    intentPatterns?: string[];
}

interface RelatedSkill {
    name: string;
    when: string;
    reason: string;
}

interface BehaviorFlags {
    showEveryTime: boolean;
    minimumConfidence: number;
    canBeDismissed: boolean;
    dismissDurationMinutes: number;
}

interface SkillRule {
    type: 'guardrail' | 'domain';
    enforcement: 'block' | 'suggest' | 'warn';
    priority: 'critical' | 'high' | 'medium' | 'low';
    promptTriggers?: PromptTriggers;
    fileTriggers?: FileTriggers;
    behaviorFlags?: BehaviorFlags;
    relatedSkills?: RelatedSkill[];
}

interface SkillRules {
    version: string;
    skills: Record<string, SkillRule>;
}

interface MatchedSkill {
    name: string;
    matchType: 'keyword' | 'intent' | 'file';
    config: SkillRule;
    confidence: number;
}

// Helper to match file patterns
function matchFilePattern(filePath: string, pattern: string): boolean {
    // Simple glob-like matching
    const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
}

// Calculate confidence score based on match type and quality
function calculateConfidence(matchType: 'keyword' | 'intent' | 'file', keywords?: string[], intentPatterns?: string[]): number {
    if (matchType === 'intent') {
        return 1.0; // Intent patterns are highly specific
    }
    
    if (matchType === 'keyword') {
        // Multiple keyword matches = higher confidence
        const matchCount = keywords?.length || 1;
        if (matchCount >= 3) return 0.9;
        if (matchCount >= 2) return 0.8;
        return 0.7;
    }
    
    if (matchType === 'file') {
        return 0.75; // File-based triggering is moderately confident
    }
    
    return 0.5;
}

// Check if skill was dismissed recently
function isSkillDismissed(skillName: string, sessionId: string, dismissDuration: number): boolean {
    if (dismissDuration === 0) return false;
    
    try {
        const projectDir = process.env.CLAUDE_PROJECT_DIR || join(__dirname, '..', '..');
        const dismissPath = join(projectDir, '.claude', 'tsc-cache', sessionId, `skill-${skillName}-dismissed`);
        
        if (!require('fs').existsSync(dismissPath)) {
            return false;
        }
        
        const dismissedAt = parseInt(readFileSync(dismissPath, 'utf-8'));
        const now = Date.now();
        const minutesSince = (now - dismissedAt) / 60000;
        
        return minutesSince < dismissDuration;
    } catch (err) {
        return false;
    }
}

// Mark skill as shown (for showEveryTime logic)
function markSkillShown(skillName: string, sessionId: string): void {
    try {
        const projectDir = process.env.CLAUDE_PROJECT_DIR || join(__dirname, '..', '..');
        const shownPath = join(projectDir, '.claude', 'tsc-cache', sessionId, `skill-${skillName}-shown`);
        require('fs').writeFileSync(shownPath, Date.now().toString());
    } catch (err) {
        // Ignore errors
    }
}

// Check if skill should be shown based on behavior flags
function shouldShowSkill(skill: MatchedSkill, sessionId: string): boolean {
    const flags = skill.config.behaviorFlags;
    if (!flags) return true; // No flags = always show
    
    // Check minimum confidence
    if (skill.confidence < flags.minimumConfidence) {
        return false;
    }
    
    // Check if dismissed
    if (flags.canBeDismissed && isSkillDismissed(skill.name, sessionId, flags.dismissDurationMinutes)) {
        return false;
    }
    
    // Check showEveryTime flag
    if (!flags.showEveryTime) {
        // Check if already shown this session
        const projectDir = process.env.CLAUDE_PROJECT_DIR || join(__dirname, '..', '..');
        const shownPath = join(projectDir, '.claude', 'tsc-cache', sessionId, `skill-${skill.name}-shown`);
        
        if (require('fs').existsSync(shownPath)) {
            return false; // Already shown this session
        }
    }
    
    return true;
}

// Load recent files from session cache
function loadRecentFiles(sessionId: string): string[] {
    try {
        const projectDir = process.env.CLAUDE_PROJECT_DIR || join(__dirname, '..', '..');
        const recentFilesPath = join(projectDir, '.claude', 'tsc-cache', sessionId, 'recent-files.log');
        
        if (!require('fs').existsSync(recentFilesPath)) {
            return [];
        }
        
        const content = readFileSync(recentFilesPath, 'utf-8');
        const lines = content.trim().split('\n').filter(l => l);
        
        // Extract file paths from "timestamp:toolname:filepath" format
        // Return last 10 files
        return lines
            .slice(-10)
            .map(line => line.split(':').slice(2).join(':'))
            .filter(path => path && path.length > 0);
    } catch (err) {
        return [];
    }
}

async function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);
        const prompt = data.prompt.toLowerCase();

        // Load skill rules
        // CLAUDE_PROJECT_DIR is set by Claude Code when running hooks
        // Fallback: go up two directories from .claude/hooks/ to project root
        const projectDir = process.env.CLAUDE_PROJECT_DIR || join(__dirname, '..', '..');
        const rulesPath = join(projectDir, '.claude', 'skills', 'skill-rules.json');
        const rules: SkillRules = JSON.parse(readFileSync(rulesPath, 'utf-8'));

        // Load recent files for file-based triggering
        const recentFiles = loadRecentFiles(data.session_id);

        const matchedSkills: MatchedSkill[] = [];

        // Check each skill for matches
        for (const [skillName, config] of Object.entries(rules.skills)) {
            let matched = false;
            
            // Prompt-based triggering
            const triggers = config.promptTriggers;
            if (triggers) {
                // Keyword matching
                if (triggers.keywords) {
                    const keywordMatch = triggers.keywords.some(kw =>
                    prompt.includes(kw.toLowerCase())
                );
                if (keywordMatch) {
                    const matchedKeywords = triggers.keywords.filter(kw => prompt.includes(kw.toLowerCase()));
                    const confidence = calculateConfidence('keyword', matchedKeywords);
                    matchedSkills.push({ name: skillName, matchType: 'keyword', config, confidence });
                    matched = true;
                    continue;
                }
                }

                // Intent pattern matching
                if (triggers.intentPatterns && !matched) {
                    const intentMatch = triggers.intentPatterns.some(pattern => {
                        const regex = new RegExp(pattern, 'i');
                        return regex.test(prompt);
                    });
                    if (intentMatch) {
                        const confidence = calculateConfidence('intent');
                        matchedSkills.push({ name: skillName, matchType: 'intent', config, confidence });
                        matched = true;
                        continue;
                    }
                }
            }
            
            // File-based triggering (if enabled in preferences)
            if (!matched && config.fileTriggers && recentFiles.length > 0) {
                const fileTriggers = config.fileTriggers;
                
                if (fileTriggers.pathPatterns) {
                    const fileMatch = recentFiles.some(file =>
                        fileTriggers.pathPatterns!.some(pattern =>
                            matchFilePattern(file, pattern)
                        )
                    );
                    
                    if (fileMatch) {
                        const confidence = calculateConfidence('file');
                        matchedSkills.push({ name: skillName, matchType: 'file', config, confidence });
                    }
                }
            }
        }

        // Filter skills based on behavior flags
        const skillsToShow = matchedSkills.filter(skill => shouldShowSkill(skill, data.session_id));
        
        // Mark shown skills for future reference
        skillsToShow.forEach(skill => {
            if (!skill.config.behaviorFlags?.showEveryTime) {
                markSkillShown(skill.name, data.session_id);
            }
        });

        // Generate output if matches found
        if (skillsToShow.length > 0) {
            let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            output += '🎯 SKILL ACTIVATION CHECK\n';
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

            // Group by priority
            const critical = skillsToShow.filter(s => s.config.priority === 'critical');
            const high = skillsToShow.filter(s => s.config.priority === 'high');
            const medium = skillsToShow.filter(s => s.config.priority === 'medium');
            const low = skillsToShow.filter(s => s.config.priority === 'low');

            if (critical.length > 0) {
                output += '⚠️ CRITICAL SKILLS:\n';
                critical.forEach(s => {
                    output += `  → ${s.name}\n`;
                    
                    // Show related skills hint for first critical skill only
                    if (critical.indexOf(s) === 0 && s.config.relatedSkills && s.config.relatedSkills.length > 0) {
                        const related = s.config.relatedSkills[0];
                        output += `    Then: ${related.name} (${related.when})\n`;
                    }
                });
                output += '\n';
            }

            if (high.length > 0) {
                output += '📚 RECOMMENDED SKILLS:\n';
                high.forEach(s => {
                    const dismissInfo = s.config.behaviorFlags?.canBeDismissed 
                        ? ` (can dismiss for ${s.config.behaviorFlags.dismissDurationMinutes}m)`
                        : '';
                    output += `  → ${s.name}${dismissInfo}\n`;
                    
                    // Show related skills hint for first high priority skill only
                    if (high.indexOf(s) === 0 && s.config.relatedSkills && s.config.relatedSkills.length > 0) {
                        const related = s.config.relatedSkills[0];
                        output += `    Then: ${related.name} (${related.when})\n`;
                    }
                });
                output += '\n';
            }

            if (medium.length > 0) {
                output += '💡 SUGGESTED SKILLS:\n';
                medium.forEach(s => {
                    const dismissInfo = s.config.behaviorFlags?.canBeDismissed 
                        ? ` (can dismiss for ${s.config.behaviorFlags.dismissDurationMinutes}m)`
                        : '';
                    output += `  → ${s.name}${dismissInfo}\n`;
                });
                output += '\n';
            }

            if (low.length > 0) {
                output += '📌 OPTIONAL SKILLS:\n';
                low.forEach(s => {
                    const dismissInfo = s.config.behaviorFlags?.canBeDismissed 
                        ? ` (can dismiss)`
                        : '';
                    output += `  → ${s.name}${dismissInfo}\n`;
                });
                output += '\n';
            }

            output += 'ACTION: Use Skill tool BEFORE responding\n';
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

            console.log(output);
        }

        process.exit(0);
    } catch (err) {
        // Silently fail to avoid disrupting Claude's workflow
        process.exit(0);
    }
}

main().catch(err => {
    // Silently fail to avoid disrupting Claude's workflow
    process.exit(0);
});