# DISCUSSION

## TL/DR

I spent more time on this than was suggested, mainly because when I get into code, and a particular problem I zone in
and can lose track of time. Especially when I am having fun. This was a fun project and a great "get back to roots"
kind of thing. Fixed some things, Improved lots of things. In a real project there would be many other things but I
tried to focus on the important things to show off my skills and have fun doing it.

## Overview

Upon opening the project and following the README instructions I loaded it up in a browser and began finding and fixing
issues. I have documented things here as I went along.

## [PR 1 - Fix errors and get to a baseline](https://github.com/thedanielfactor/solace-advocate-search/pull/1)

### Issue 1. yearsOfExperience.includes not a function error:

`Page.tsx` is trying to call .includes() on advocate.yearsOfExperience, but according to the database schema in
`src/db/schema.ts`, yearsOfExperience is defined as an integer, not a string. The .includes() method only works on
strings and arrays. The fix is to convert the yearsOfExperience to a string before calling .includes()

### Issue 2. Missing Uniue Keys in React Lists.

`Page.tsx` should have unique ids on elements created in an array or loop. Adding unique keys:

- Advocate loop add `advocate.id` as the key.
- Advodate specialties loop, add unique key using `advocate.id` and the specialty index.

### Issue 3. Fix issue with server found during manual build.

`src/app/api/seed/route.ts` was not validating DB before calling insert.

### Issue 4. Hydration error during load.

During server-side rendering, the table was empty (no advocates data). When the client-side JavaScript ran, it
immediately tried to render the table with data. This created a mismatch between server and client rendering
By adding the loading state and conditional rendering, the server and client both render the same initial state
(loading message) Only after the data is fetched does the table render This ensures consistent rendering between
server and client.

1. Added loading state: Added an isLoading state that starts as true and becomes false after the data is fetched
2. Conditional rendering: The table only renders after the data is loaded, preventing hydration mismatches

## PR 2. [TypeScript Strict Mode and Comprehensive Type Definitions](https://github.com/thedanielfactor/solace-advocate-search/pull/2)

### Enhanced TypeScript Configuration (`tsconfig.json`)

- **Enabled strict mode** (was already enabled)
- **Added additional strict checks**:
  - `noImplicitAny`: Prevents implicit `any` types
  - `noImplicitReturns`: Ensures all code paths return a value
  - `noImplicitThis`: Prevents implicit `this` usage
  - `noUnusedLocals`: Flags unused local variables
  - `noUnusedParameters`: Flags unused function parameters
  - `exactOptionalPropertyTypes`: Stricter optional property handling
  - `noUncheckedIndexedAccess`: Safer array/object access

### Centralized Type Definitions (`src/types/index.ts`)

### Created a comprehensive types file with:

- **API Response Types**: `ApiResponse<T>` for consistent API responses
- **Domain Types**: `Advocate` interface with proper nullable handling
- **Component Props Types**: `SearchBarProps`, `AdvocateTableProps`, etc.
- **Event Handler Types**: `InputChangeHandler`, `ButtonClickHandler`, etc.
- **Utility Types**: `SearchFilters`, `AppError`, `LoadingState`, etc.

### Improved Component Types (`src/app/page.tsx`)

- **Proper event handler types**: Added `InputChangeHandler` and `ButtonClickHandler`
- **Async/await pattern**: Replaced promise chains with modern async/await
- **Error handling**: Added proper try/catch with typed error handling
- **API response typing**: Used `ApiResponse<Advocate[]>` for type safety

### Enhanced API Route Types (`src/app/api/*/route.ts`)

- **Request/Response typing**: Added proper Next.js request/response types
- **Error response consistency**: Standardized error responses with `ApiResponse<T>`
- **Database type safety**: Added proper type casting for database results
- **Removed unused imports**: Cleaned up unused dependencies

### Database Type Improvements (`src/db/index.ts`)

- **Better return types**: Changed from mock object to `PostgresJsDatabase | null`
- **Proper null handling**: Added null checks in API routes
- **Type safety**: Ensured database operations are properly typed

### Code Quality - Pass 1

- **Maintainability**: Types serve as documentation
- **Refactoring safety**: TypeScript catches breaking changes
- **Industry standards**: Aligns with modern TypeScript best practices

### Manual Testing

- **TypeScript compilation**: `npx tsc --noEmit` passes with no errors
- **Development server**: Application runs without type issues
- **Runtime functionality**: All existing features work as expected

### More Alignment and Best Practices

- **Modern TypeScript**: Uses latest TypeScript features and best practices
- **React patterns**: Proper event handler and component prop types
- **API standards**: Consistent response types and error handling
- **Database safety**: Type-safe database operations

## PR 3. [Front End Error Handling Improvements](https://github.com/thedanielfactor/solace-advocate-search/pull/3)

### Commponents Created

- **ErrorBoundary** - Catches React errors gracefully
- **ErrorState** - Beautiful error display with retry functionality
- **LoadingState** - Skeleton loading with animations
- **SearchBar** - Enhanced search with error states
- **AdvocateTable** - Table with empty states and error handling

### Custom Hook

- **useAdvocates** - Centralized data fetching with proper error handling

### Error Utilities

- **errorHandling.ts** - Consistent error management across the app

## PR: 4. [UI Component Architecture Updates](https://github.com/thedanielfactor/solace-advocate-search/pull/4)

- Uses all new components with proper error states
- Better user experience with loading skeletons
- Graceful error recovery with retry functionality

## PR: 5. [Performance Enhancements](https://github.com/thedanielfactor/solace-advocate-search/pull/5)

#### DB Optomizations

Updated migration.js to do the following:

- **Fixed Column Name**: Fixed bad column name from drizzle-kit (payload -> specialites)
- **Added Indexes**: Added indexes for searchable columns.

#### Pagination and Filtering

- **Server-side pagination**: 20 records per page (configurable up to 100)
- **Dynamic filtering**: Search across multiple fields (name, city, degree, specialties)
- **Advanced sorting**: Sort by any column with ascending/descending order
- **Range filtering**: Filter by experience years (min/max)

#### UI Improvements

- **UI Components**: Components seperated to avoid unnecesry rerenders.
- **Page Size Seclector**: Added ability to select how many results to load.

## PR 6. [Server Side Enhancements](https://github.com/thedanielfactor/solace-advocate-search/pull/6)

- **Professional Backend Architecture**: Introduced a **~~4-layer architecture~~** with proper separation of concerns, comprehensive error handling, and database abstraction through the repository pattern.
- **Unit Tests**: Added unite tests for server side.

### 4-layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Route Layer                              │
│              (HTTP Request/Response)                        │
├─────────────────────────────────────────────────────────────┤
│                   Controller Layer                          │
│            (Input Validation & Error Handling)              │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                            │
│              (Business Logic & Validation)                  │
├─────────────────────────────────────────────────────────────┤
│                  Repository Layer                           │
│              (Database Abstraction)                         │
├─────────────────────────────────────────────────────────────┤
│                   Database Layer                            │
│              (Drizzle ORM + PostgreSQL)                     │
└─────────────────────────────────────────────────────────────┘
```

## TODO: Some things to think about for real

1. Seprate Server to its own project with a real API Spec.
2. Add API documentation with OpenAPI/Swagger
3. Logging
4. Implement caching and load balancing
5. Incorporated into larger site with proper header and footer.

To name a few.
