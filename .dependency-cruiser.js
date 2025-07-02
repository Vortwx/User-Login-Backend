/**
 * Clean Architecture Dependency Rule Enforcement with Dependency Cruiser
 *
 * Rules: Dependencies must flow inwards.
 * Outer layers (Presentation, Infrastructure) can depend on inner layers (Application, Domain).
 * Inner layers (Domain, Application) must NOT depend on outer layers.
 *
 * Layer Mapping of project structure:
 * - Domain:    src/app/modules/../domain/
 * - Application: src/app/modules/../application/
 * - Infrastructure: src/app/modules/../infrastructure/
 * - Presentation: src/app/modules/../api/
 * - Shared:    src/app/modules/shared/
 */
