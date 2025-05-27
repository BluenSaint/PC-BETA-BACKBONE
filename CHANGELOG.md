# Changelog

## [Unreleased]

### Fixed
- Fixed 404 errors on client-side routes by enhancing vercel.json configuration
- Added proper route configurations in vercel.json and next.config.js
- Resolved CORS issues by adding appropriate headers in both configuration files
- Fixed backend-frontend connectivity problems
- Addressed project naming issues with special characters causing URL errors

### Changed
- Optimized next.config.js with improved API route handling
- Enhanced CORS settings for better security and connectivity
- Updated routing configuration to ensure all admin dashboard paths work correctly
- Removed static export to enable middleware and authentication

### Added
- Added comprehensive rewrites and routes in vercel.json
- Added explicit API route handling in next.config.js
- Added CORS headers for API routes
- Added configuration for server-side rendering of images

## [1.0.0] - 2025-05-27
- Initial release of Project Cobra Admin Dashboard
