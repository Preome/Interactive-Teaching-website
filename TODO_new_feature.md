# Add Introduction, Detailed Explanation, Additional Resources

**Information Gathered**:
- Model: Content.js - has title, description, elements
- Upload: ContentUpload.js - form fields + media upload
- View: ContentViewPage.js - shows title/description + emoji sections

**Plan**:
## Backend
1. ✅ Update Content model: add `introduction`, `detailedExplanation`, `additionalResources` ✓
2. ✅ Update backend/routes/content.js upload route: save new fields ✓

## Frontend Upload
3. ✅ ContentUpload.js: add 3 textarea fields + state + form data handling ✓

## Frontend View
4. ✅ ContentViewPage.js: show 3 new styled sections in info card ✓

**Dependent Files**:
- backend/models/Content.js
- backend/routes/content.js  
- frontend/src/components/ContentUpload.js
- frontend/src/components/ContentViewPage.js

**Followup**:
- npm run build + restart
- Test upload → view new sections
