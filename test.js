const axios = require("axios");

// Configuration
const API_BASE_URL = "http://localhost:3000";

// Utility function to format response data for display
function formatResponse(data, endpoint) {
  if (endpoint === "/routes" && data.routes) {
    const { routes, pagination } = data;
    return {
      meta: {
        total: pagination.total,
        showing: routes.length,
        limit: pagination.limit,
        offset: pagination.offset,
      },
      example: routes.length > 0 ? routes[0] : null,
      message: `Showing ${routes.length} of ${pagination.total} routes`,
    };
  }

  if (endpoint.startsWith("/airports/") && data.routes) {
    return {
      meta: {
        airport: data.airport,
        direction: data.direction,
        routeCount: data.routes.length,
      },
      example: data.routes.length > 0 ? data.routes[0] : null,
      message: `Found ${data.routes.length} routes ${
        data.direction === "departure" ? "from" : "to"
      } ${data.airport}`,
    };
  }

  if (endpoint.startsWith("/countries/") && data.routes) {
    return {
      meta: {
        country: data.country,
        direction: data.direction,
        destination: data.destination_country,
        routeCount: data.routes.length,
      },
      example: data.routes.length > 0 ? data.routes[0] : null,
      message: `Found ${data.routes.length} routes ${
        data.direction === "departure" ? "from" : "to"
      } ${data.country}`,
    };
  }

  return data;
}

// Function to test an endpoint
async function testEndpoint(endpoint, params, description) {
  console.log("\n" + "=".repeat(80));
  console.log(description || endpoint);
  console.log("=".repeat(80));

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Request: GET ${url}`);
  if (params) {
    console.log("Params:", params);
  }

  const startTime = Date.now();

  try {
    const response = await axios.get(url, { params });
    const elapsedTime = Date.now() - startTime;

    console.log(`Status: ${response.status}`);
    console.log(`Response time: ${elapsedTime} ms`);
    console.log("Response data:");
    console.log(
      JSON.stringify(formatResponse(response.data, endpoint), null, 2)
    );

    return response.data;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Response data:", error.response.data);
    }
    return null;
  }
}

// Main function to run all tests
async function runTests() {
  console.log("Testing Flight Routes API");
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log("Make sure the server is running before executing this script.");

  try {
    // Test basic endpoints
    await testEndpoint("/health", null, "1. Health Check");
    await testEndpoint("/stats", null, "2. Database Statistics");

    // Test airlines and airports endpoints
    await testEndpoint("/airlines", null, "3. List All Airlines");
    await testEndpoint(
      "/airports",
      { country: "United Kingdom" },
      "4. Airports in United Kingdom"
    );
    await testEndpoint("/countries", null, "5. List All Countries");

    // Test routes endpoints
    await testEndpoint(
      "/routes",
      {
        departure_country: "United Kingdom",
        arrival_country: "France",
        limit: 10,
      },
      "6. Routes from UK to France (First 10)"
    );

    await testEndpoint(
      "/routes",
      {
        max_duration: 60,
        limit: 10,
      },
      "7. Short Flights (Under 60 minutes)"
    );

    await testEndpoint(
      "/airports/LHR/routes",
      { direction: "departure" },
      "8. Routes from London Heathrow (LHR)"
    );

    await testEndpoint(
      "/airports/JFK/routes",
      { direction: "arrival" },
      "9. Routes to New York JFK"
    );

    await testEndpoint("/countries/Japan/routes", {}, "10. Routes from Japan");

    await testEndpoint(
      "/countries/Germany/routes",
      { destination_country: "Italy" },
      "11. Routes from Germany to Italy"
    );

    // Test more complex queries
    await testEndpoint(
      "/routes",
      {
        airline_name: "British Airways",
        departure_country: "United Kingdom",
        max_duration: 120,
        limit: 10,
      },
      "12. British Airways flights from UK under 120 minutes"
    );

    // Test pagination
    await testEndpoint(
      "/routes",
      { limit: 5, offset: 0 },
      "13. Routes with Pagination (Page 1)"
    );
    await testEndpoint(
      "/routes",
      { limit: 5, offset: 5 },
      "14. Routes with Pagination (Page 2)"
    );

    console.log("\nAll tests completed successfully!");
  } catch (error) {
    console.error("Error running tests:", error.message);
  }
}

// Run all tests
runTests();
