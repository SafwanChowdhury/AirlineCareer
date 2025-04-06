# Hooks

This directory contains custom React hooks that provide reusable functionality across components.

## Data Fetching Hooks

### `use-swr-fetch.ts`

This is the core data fetching hook that all other data fetching hooks are built on. It uses SWR for data fetching with standardized error handling and caching.

```tsx
import { useSwrFetch } from "@/lib/hooks/use-swr-fetch";

function MyComponent() {
  const { data, error, isLoading } = useSwrFetch<MyDataType>("/api/my-endpoint");
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.name}</div>;
}
```

### `use-pagination.ts`

Provides standardized pagination state management with navigation controls.

```tsx
import { usePagination } from "@/lib/hooks/use-pagination";

function PaginatedList() {
  const { 
    currentPage, 
    itemsPerPage, 
    goToPage, 
    nextPage, 
    prevPage,
    canGoNext, 
    canGoPrev 
  } = usePagination({
    initialPage: 1,
    initialLimit: 10,
    totalItems: 100
  });
  
  // Use with your API fetching...
  
  return (
    <div>
      <button onClick={prevPage} disabled={!canGoPrev}>Previous</button>
      <span>Page {currentPage}</span>
      <button onClick={nextPage} disabled={!canGoNext}>Next</button>
    </div>
  );
}
```

### `use-search.ts`

Provides debounced search functionality for improved performance.

```tsx
import { useSearch } from "@/lib/hooks/use-search";

function SearchComponent() {
  const { 
    searchTerm, 
    setSearchTerm, 
    isDebouncing,
    clearSearch
  } = useSearch({
    initialTerm: "",
    debounceTime: 300,
    onSearch: (term) => {
      // Fetch search results
      console.log("Searching for:", term);
    }
  });
  
  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {isDebouncing && <span>Searching...</span>}
      <button onClick={clearSearch}>Clear</button>
    </div>
  );
}
```

### `use-filters.ts`

Provides filter state management with URL persistence.

```tsx
import { useFilters } from "@/lib/hooks/use-filters";

function FilterableList() {
  const { 
    filters, 
    setFilter, 
    setFilters, 
    resetFilters,
    hasActiveFilters
  } = useFilters({
    initialFilters: {
      airline: "",
      departure: "",
      arrival: "",
      country: "",
      maxDuration: 0
    },
    persistToUrl: true
  });
  
  return (
    <div>
      <select
        value={filters.airline}
        onChange={(e) => setFilter("airline", e.target.value)}
      >
        <option value="">All Airlines</option>
        {/* Options here */}
      </select>
      
      <button onClick={resetFilters} disabled={!hasActiveFilters}>
        Reset Filters
      </button>
    </div>
  );
}
```

### `use-list-view.ts`

Combines pagination, search, and filtering for list views.

```tsx
import { useListView } from "@/lib/hooks/use-list-view";

function RoutesListView() {
  const {
    items,
    isLoading,
    error,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    search,
    filters
  } = useListView({
    fetchFn: async (params) => {
      const response = await fetch(`/api/routes?${params.toString()}`);
      const data = await response.json();
      return data;
    },
    autoFetch: true
  });
  
  return (
    <div>
      <input
        value={search.searchTerm}
        onChange={(e) => search.setSearchTerm(e.target.value)}
        placeholder="Search routes..."
      />
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
      
      <div>
        <button onClick={prevPage}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={nextPage}>Next</button>
      </div>
    </div>
  );
}
```

### `use-detail-view.ts`

Handles fetching and managing detail data for a single item.

```tsx
import { useDetailView } from "@/lib/hooks/use-detail-view";

function RouteDetailView({ id }) {
  const {
    data,
    isLoading,
    error,
    refresh
  } = useDetailView({
    id,
    fetchFn: async (id) => {
      const response = await fetch(`/api/routes/${id}`);
      const data = await response.json();
      return data;
    }
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data found</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>From: {data.departure} - To: {data.arrival}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## Form Management Hooks

### `use-form.ts`

Provides form state management with validation.

```tsx
import { useForm } from "@/lib/hooks/use-form";

function MyForm() {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    isValid
  } = useForm({
    initialValues: {
      name: "",
      email: ""
    },
    validators: {
      name: (value) => value ? null : "Name is required",
      email: (value) => {
        if (!value) return "Email is required";
        if (!value.includes("@")) return "Invalid email";
        return null;
      }
    },
    onSubmit: async (values) => {
      await saveData(values);
    }
  });
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          name="name"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
        />
        {touched.name && errors.name && (
          <div>{errors.name}</div>
        )}
      </div>
      
      <div>
        <label>Email</label>
        <input
          name="email"
          value={values.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
        />
        {touched.email && errors.email && (
          <div>{errors.email}</div>
        )}
      </div>
      
      <button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## Domain-Specific Hooks

### `use-airport-data.ts`

Provides functionality for working with airport data.

```tsx
import { useAirports } from "@/lib/hooks/use-airport-data";

function AirportSelector() {
  const {
    filteredAirports,
    isLoading,
    filterAirports
  } = useAirports({
    enableSearch: true,
    excludeAirports: ["XYZ"]
  });
  
  return (
    <div>
      <input
        placeholder="Search airports..."
        onChange={(e) => filterAirports(e.target.value)}
      />
      
      <select>
        <option value="">Select Airport</option>
        {filteredAirports.map(airport => (
          <option key={airport.iata} value={airport.iata}>
            {airport.name} ({airport.iata})
          </option>
        ))}
      </select>
    </div>
  );
}
```

### `use-airline-data.ts`

Provides functionality for working with airline data.

```tsx
import { useAirlines } from "@/lib/hooks/use-airline-data";

function AirlineSelector() {
  const {
    filteredAirlines,
    isLoading,
    filterAirlines
  } = useAirlines({
    enableSearch: true
  });
  
  return (
    <div>
      <input
        placeholder="Search airlines..."
        onChange={(e) => filterAirlines(e.target.value)}
      />
      
      <select>
        <option value="">Select Airline</option>
        {filteredAirlines.map(airline => (
          <option key={airline.iata} value={airline.iata}>
            {airline.name} ({airline.iata})
          </option>
        ))}
      </select>
    </div>
  );
}
```

### `use-route-data.ts`

Provides specialized hooks for route data.

```tsx
import { useRoutesList, useRouteDetail } from "@/lib/hooks/use-route-data";

function RoutesList() {
  const { items, isLoading, filters, search } = useRoutesList();
  
  return (
    <div>
      <input
        value={search.searchTerm}
        onChange={(e) => search.setSearchTerm(e.target.value)}
        placeholder="Search routes..."
      />
      
      {items.map(route => (
        <div key={route.route_id}>
          {route.departure_city} to {route.arrival_city}
        </div>
      ))}
    </div>
  );
}

function RouteDetail({ id }) {
  const { data, isLoading } = useRouteDetail(id);
  
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Route not found</div>;
  
  return (
    <div>
      <h2>{data.departure_city} ({data.departure_iata}) to {data.arrival_city} ({data.arrival_iata})</h2>
      <p>Airline: {data.airline_name} ({data.airline_iata})</p>
      <p>Distance: {data.distance_km} km</p>
      <p>Duration: {Math.floor(data.duration_min / 60)}h {data.duration_min % 60}m</p>
    </div>
  );
}