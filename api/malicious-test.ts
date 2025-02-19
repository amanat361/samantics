// malicious-test.ts
import { writeFileSync } from "fs";

async function maliciousTest() {
  const logs: string[] = [];
  function log(msg: string) {
    console.log(msg);
    logs.push(msg);
  }

  // Helper function to test an endpoint and log its response.
  async function testEndpoint(
    endpoint: string,
    method: string,
    payload: any,
    description: string
  ) {
    const url = `http://localhost:3000${endpoint}`;
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      log(`\n[${description}]`);
      log(`Endpoint: ${endpoint}`);
      log(`Payload: ${JSON.stringify(payload)}`);
      log(`Status: ${response.status}`);
      log(`Response: ${text}`);
    } catch (error) {
      log(`\n[${description}]`);
      log(`Endpoint: ${endpoint}`);
      log(`Payload: ${JSON.stringify(payload)}`);
      log(`Error: ${error}`);
    }
  }

  log("=== Starting Malicious Tests ===");

  // Test 1: /embed with a non-string word (number instead of string)
  await testEndpoint(
    "/embed",
    "POST",
    { word: 123 },
    "Sending number instead of string for 'word'"
  );

  // Test 2: /embed with an empty string (after trimming)
  await testEndpoint(
    "/embed",
    "POST",
    { word: "   " },
    "Sending an empty (whitespace-only) string for 'word'"
  );

  // Test 3: /embed with missing 'word' key
  await testEndpoint(
    "/embed",
    "POST",
    {},
    "Missing 'word' key in payload for /embed"
  );

  // Test 4: /embedBatch with a non-array type (string instead of array)
  await testEndpoint(
    "/embedBatch",
    "POST",
    { words: "hello" },
    "Sending a string instead of an array for 'words' in /embedBatch"
  );

  // Test 5: /embedBatch with an array that includes non-string elements
  await testEndpoint(
    "/embedBatch",
    "POST",
    { words: ["hello", 456, "world"] },
    "Array containing a non-string element for 'words' in /embedBatch"
  );

  // Test 6: /similarity with missing vector 'b'
  await testEndpoint(
    "/similarity",
    "POST",
    { a: [1, 2, 3] },
    "Missing vector 'b' in /similarity"
  );

  // Test 7: /similarity with non-numeric values in one of the vectors
  await testEndpoint(
    "/similarity",
    "POST",
    { a: [1, 2, "three"], b: [1, 2, 3] },
    "Non-numeric value in vector 'a' for /similarity"
  );

  // Test 8: /similarity with vectors of different lengths
  await testEndpoint(
    "/similarity",
    "POST",
    { a: [1, 2, 3], b: [1, 2] },
    "Vectors of different lengths in /similarity"
  );

  // Write the malicious test log to a file
  writeFileSync("malicious-test-output.txt", logs.join("\n"), "utf8");
  log("\nMalicious test output written to malicious-test-output.txt");
}

maliciousTest().catch((err) => {
  console.error("Error during malicious tests:", err);
});
