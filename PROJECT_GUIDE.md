# Debugging Best Practices

## Avoiding Over-Engineering

### Case Study: The One-Line Fix
A recent debugging session highlighted a critical lesson in maintaining code simplicity:
- Problem: Calendar events disappeared after a code change
- Simple Fix: Restoring one line from `return []` to `return [event]` in recurrence.ts
- Time Wasted: Over 1 hour trying complex solutions
- Actual Fix Time: 1 minute

### Key Lessons Learned
1. Start With the Simplest Explanation
   - Before diving into complex solutions, check if something simple was changed
   - Look for recent code changes that coincide with the problem
   - Test the most basic fix first

2. Follow the Data Flow
   - When data disappears, trace backward from where it should appear
   - Look for functions that return empty results
   - Check array transformations and filters

3. Listen to User Guidance
   - When users say "don't change anything else", they often have a good reason
   - Resist the urge to "improve" other parts of the code while fixing a bug
   - Focus on the specific issue reported

4. Make Incremental Changes
   - Test one change at a time
   - Revert immediately if a change doesn't fix the issue
   - Keep track of what was changed

### Prevention Guidelines
1. Before Making Changes:
   - Document the current working state
   - Understand why the current code works
   - Question whether a change is really needed

2. When Debugging:
   - Start with the most recent changes
   - Look for simple explanations first
   - Test the smallest possible fix
   - Don't touch working code

3. Code Review Practices:
   - Flag unnecessary complexity
   - Question changes to working code
   - Verify that fixes are minimal and targeted

Remember: The best solution is often the simplest one. If a bug appears after a code change, check that change first before exploring complex solutions. 