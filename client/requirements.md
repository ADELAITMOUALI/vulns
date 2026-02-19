## Packages
fuse.js | Client-side fuzzy search for CVEs
framer-motion | Complex animations for the operator UI
lucide-react | Iconography
clsx | Class name utility
tailwind-merge | Class name merging

## Notes
The application fetches all CVEs once from /api/cves and performs client-side indexing.
Search logic should be contained in a custom hook using Fuse.js.
Theme is strictly dark mode (cyberpunk/operator aesthetic).
