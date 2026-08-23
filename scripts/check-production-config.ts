import "dotenv/config";
import { assertProductionConfiguration } from "../src/lib/production-config";

try {
  assertProductionConfiguration();
  console.log("Production configuration is complete.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
