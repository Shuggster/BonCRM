@echo off
echo Cleaning up outdated documentation...

:: Remove old authentication and system architecture docs
del /q "Documentation\1-system-architecture\AUTHENTICATION.md"
del /q "Documentation\1-system-architecture\DATABASE_SCHEMA.md"

:: Remove old task documentation
del /q "Documentation\TASKS.md"

:: Remove outdated user management
rd /s /q "Documentation\3-user-management"

:: Remove redundant maintenance docs
rd /s /q "Documentation\7-maintenance"

:: Remove session guide (now part of disaster recovery)
rd /s /q "Documentation\0-session-guide"

:: Remove implementation guides (now in disaster recovery)
rd /s /q "Documentation\2-implementation-guides"

:: Clean up empty directories
rd /q "Documentation\2-feature-guides" 2>nul
rd /q "Documentation\4-company-info" 2>nul
rd /q "Documentation\5-features-roadmap" 2>nul
rd /q "Documentation\6-api-docs" 2>nul

echo Documentation cleanup complete!
