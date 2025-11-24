# Developer Handoff Checklist for Members Stories

## Pre-Development Checklist

### Documentation Review

- [ ] Read all 5 story documents (MEM-001 through MEM-005)
- [ ] Review Figma designs (links in each story)
- [ ] Check test data requirements document
- [ ] Review API contracts document
- [ ] Understand accessibility requirements

### Environment Setup

- [ ] Supabase access confirmed
- [ ] Figma MCP tool working
- [ ] Test data seeded in development database
- [ ] Logger configured and working

### Dependencies Check

- [ ] react-native-maps installed and configured
- [ ] Existing components identified and reviewed
- [ ] Config files understood (colors, spacing, etc.)

## During Development Checklist

### For Each Story

- [ ] Create/update components (NO styles in screen files)
- [ ] Implement loading states as specified
- [ ] Add error handling with user-friendly messages
- [ ] Include logging at key points
- [ ] Test with edge cases from test data doc
- [ ] Verify accessibility requirements
- [ ] Update "File List" section in story document

### Code Quality

- [ ] No magic values (use config files)
- [ ] Components are reusable
- [ ] TypeScript types defined
- [ ] Loading states implemented
- [ ] Error boundaries in place
- [ ] Debouncing where specified

### Testing

- [ ] Unit tests for new components
- [ ] Integration tests for API calls
- [ ] Manual testing with test data scenarios
- [ ] Accessibility testing with screen reader
- [ ] Performance testing (60 FPS scrolling)

## Post-Development Checklist

### Story Completion

- [ ] Update "Dev Agent Record" section
- [ ] List all created/modified files
- [ ] Document any deviations from spec
- [ ] Note any technical debt incurred

### Pull Request

- [ ] Branch named: `feature/MEM-XXX-description`
- [ ] PR description references story number
- [ ] Screenshots/videos attached
- [ ] Test instructions provided
- [ ] Breaking changes documented

### Handoff to QA

- [ ] All acceptance criteria marked complete
- [ ] Test data requirements documented
- [ ] Known issues listed
- [ ] Edge cases tested and documented

## Common Pitfalls to Avoid

1. **Don't put styles in screen files** - Use components
2. **Don't forget loading states** - Users need feedback
3. **Don't skip error handling** - Every API call can fail
4. **Don't use magic values** - Use config constants
5. **Don't forget accessibility** - Test with VoiceOver
6. **Don't skip logging** - Future you will thank you
7. **Don't create similar components** - Reuse existing ones
8. **Don't forget the debounce** - 500ms for search
9. **Don't expose sensitive data** - Log counts, not objects
10. **Don't skip empty states** - Every list can be empty

## Questions to Ask Before Starting

1. Are there any existing components I should reuse?
2. Is the test data ready in the database?
3. Are there any API endpoints I need that don't exist?
4. Are there any design clarifications needed?
5. What's the expected timeline for these stories?

## Success Criteria

### Performance

- Initial load < 2 seconds
- Search response < 500ms after debounce
- 60 FPS scrolling with 100+ items
- No memory leaks

### Quality

- Zero console errors
- All TypeScript types defined
- Passes linting
- Accessible via screen reader
- Works on minimum device (iPhone SE)

### Completeness

- All acceptance criteria met
- Loading states implemented
- Error states handled
- Empty states shown
- Logging added

## Resources

### Documentation

- Stories: `/docs/stories/MEM-*.md`
- Test Data: `/docs/stories/MEM-test-data-requirements.md`
- API Contracts: `/docs/stories/MEM-api-contracts.md`
- Accessibility: `/docs/stories/MEM-accessibility-requirements.md`

### Existing Code References

- Loading pattern: `/app/clubs/[id]/teams.tsx:69-77`
- Error handling: `/app/teams/[id]/about.tsx:42-44`
- Debounce pattern: `/components/ShFormFieldLocation/ShFormFieldLocation.tsx:84`
- Component examples: `/components/Sh*/`

### Tools

- Figma MCP: `mcp__figma-dev-mode-mcp-server__get_code`
- Supabase MCP: `mcp__supabase__*`
- Logger: `/lib/utils/logger`

## Contact for Questions

- Product Owner: Review story documents
- Design: Check Figma links
- Backend: API contracts document
- QA: Test data requirements
