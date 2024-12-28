# Troubleshooting Guide

## Quick Reference
Common issues and their immediate solutions:

### Split View Animation Issues

#### Split View Not Animating Correctly
**Symptoms:**
- Content appears without animation
- Animation stutters or jumps
- Cards not splitting properly

**Quick Fix:**
1. Ensure proper animation sequence:
```typescript
// ✅ Correct implementation
const handleClick = () => {
  hide();
  
  setTimeout(() => {
    const topContent = (
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 15
          }
        }}
      >
        <Content section="upper" />
      </motion.div>
    );

    const bottomContent = (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 15
          }
        }}
      >
        <Content section="lower" />
      </motion.div>
    );

    setContent(topContent, bottomContent);
    show();
  }, 100);
}
```

**Prevention:**
1. Always use spring animations for split views
2. Include proper section props ("upper"/"lower")
3. Use the hide/show sequence correctly

**Time to Fix: 5-10 minutes**

### Form Issues

#### Expandable Sections Not Working
**Symptoms:**
- Sections don't expand/collapse
- Animation looks jerky
- Content flashes when expanding

**Quick Fix:**
1. Check the implementation:
```typescript
// ✅ Correct implementation
<ExpandableSection title="Section Title">
  <div className="space-y-4">
    {/* Form fields */}
  </div>
</ExpandableSection>

// ❌ Common mistakes
- Missing space-y classes for field spacing
- Incorrect nesting of form elements
- Missing section titles
```

2. Ensure proper styling:
```typescript
// ✅ Correct styling
className="border-b border-white/[0.08] last:border-none"
```

**Time to Fix: < 5 minutes**

#### Form Background Color Issues
**Symptoms:**
- Grey background instead of black
- Inconsistent colors between sections
- Background color bleeding during animation

**Quick Fix:**
1. Use correct background classes:
```typescript
// ✅ Correct implementation
className="bg-black"  // For form sections
className="bg-white/[0.03]"  // For input fields

// ❌ Common mistakes
- Using gradient backgrounds
- Missing background colors
- Incorrect opacity values
```

2. Check container hierarchy:
```typescript
// ✅ Correct structure
<div className="bg-black rounded-xl">
  <div className="space-y-1">
    <ExpandableSection>
      {/* Content */}
    </ExpandableSection>
  </div>
</div>
```

**Time to Fix: < 5 minutes**

### Animation Issues

#### Spring Animation Timing
**Symptoms:**
- Animations feel too bouncy or stiff
- Content overshoots or undershoots
- Inconsistent timing between animations

**Quick Fix:**
1. Use standard spring configuration:
```typescript
// ✅ Correct spring settings
transition: {
  type: "spring",
  stiffness: 50,
  damping: 15
}

// ❌ Common mistakes
- Using tween animations for split views
- Incorrect spring values
- Missing transition type
```

**Time to Fix: < 5 minutes**

## Database Issues

### Tag Relations
**Symptoms:**
- Tags not saving with contacts
- Missing tag relationships
- Duplicate tags being created

**Quick Fix:**
1. Check table names and relationships:
```sql
-- ✅ Correct table names
contact_tags
contact_tag_relations

-- ❌ Common mistakes
- Using "tags" instead of "contact_tags"
- Missing junction table
- Incorrect foreign key relationships
```

2. Verify tag creation sequence:
```typescript
// ✅ Correct implementation
// 1. Create contact first
const { data: contact } = await supabase
  .from('contacts')
  .insert([contactData])
  .select()
  .single()

// 2. Create tag relations
const tagRelations = tags.map(tagId => ({
  contact_id: contact.id,
  tag_id: tagId
}))

await supabase
  .from('contact_tag_relations')
  .insert(tagRelations)
```

**Time to Fix: 10-15 minutes**

For detailed animation standards, see: `docs/ANIMATION_STANDARDS.md` 