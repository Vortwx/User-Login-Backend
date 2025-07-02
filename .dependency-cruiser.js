/**
 * Clean Architecture Dependency Rule Enforcement with Dependency Cruiser
 *
 * Rules: Dependencies must flow inwards.
 * Outer layers (Presentation, Infrastructure) can depend on inner layers (Application, Domain).
 * Inner layers (Domain, Application) must NOT depend on outer layers.
 *
 * Layer Mapping of project structure:
 * - Domain:        src/../domain/
 * - Application:   src/../application/
 * - Infrastructure: src/../infrastructure/
 * - Presentation:  src/../api/
 * - Shared:        src/shared/
 */
module.exports = {
    forbidden: [
      // --- Enforce Clean Architecture (Global Layer Dependency Rules) ---
      // Rule: Domain layer files must NOT depend on Application, Infrastructure, or API layer files.
      {
        name: "no-domain-to-outer-layers",
        severity: "error",
        from: { path: "domain" }, // Matches any path containing "domain" (e.g., src/user/domain/...)
        to: { path: "(application|infrastructure|api)" } // Matches any path containing "application", "infrastructure", or "api"
      },
      // Rule: Application layer files must NOT depend on Infrastructure or API layer files.
      {
        name: "no-application-to-outer-layers",
        severity: "error",
        from: { path: "application" }, // Matches any path containing "application"
        to: { path: "(infrastructure|api)" } // Matches any path containing "infrastructure" or "api"
      },
      // Rule: Infrastructure layer files must NOT depend on API layer files.
      {
        name: "no-infrastructure-to-api",
        severity: "error",
        from: { path: "infrastructure" }, // Matches any path containing "infrastructure"
        to: { path: "api" } // Matches any path containing "api"
      },
      // Rule: API (Presentation) layer files should ideally not depend directly on Domain layer files.
      // This is a common warning to encourage communication via the Application layer (Use Cases/DTOs).
      {
        name: "warn-api-to-domain-direct-dependency",
        severity: "warn",
        from: { path: "api" }, // Matches any path containing "api"
        to: { path: "domain" } // Matches any path containing "domain"
      },
  
      // --- Enforce Cross-Module Dependencies ---
      // Rule: Prevent direct imports from 'user' module to 'auth' module,
      // unless the import is from 'shared' or it's a module definition file.
      {
        name: "no-user-to-auth-module",
        severity: "error",
        from: { path: "^src/user/" }, 
        to: {
          path: "^src/auth/", 
          pathNot: [
            "^src/shared/", 
            ".*\\.module\\.ts$" 
          ]
        }
      },
      // Rule: Prevent direct imports from 'auth' module to 'user' module,
      // unless the import is from 'shared' or it's a module definition file.
      {
        name: "no-auth-to-user-module",
        severity: "error",
        from: { path: "^src/auth/" }, 
        to: {
          path: "^src/user/",
          pathNot: [
            "^src/shared/", 
            ".*\\.module\\.ts$" 
          ]
        }
      }
    ],
    options: {
      doNotFollow: {
        path: "node_modules"
      },
      exclude: {
        path: "node_modules"
      },
      tsConfig: {
        fileName: "tsconfig.json"
      },
      reporterOptions: {
        dot: {
          collapsePattern: "node_modules/[^/]+"
        }
      }
    }
  };