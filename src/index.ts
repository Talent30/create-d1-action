import { getInput, setOutput, setFailed, info } from "@actions/core";
import ky from "ky";

type Messages = Array<{ code: number; message: string }>;

type ListD1 = {
  errors: Messages;
  messages: Messages;
  result: Array<{
    created_at: string;
    name: string;
    uuid: string;
    version: string;
  }>;
  success: boolean;
  result_info: {
    count: number;
    page: number;
    per_page: number;
    total_count: number;
  };
};

type CreateD1 = {
  errors: Messages;
  messages: Messages;
  result: {
    created_at: string;
    file_size: number;
    name: string;
    num_tables: number;
    uuid: string;
    version: string;
  };
  success: boolean;
};

// Functional flow for finding or creating the database
async function findOrCreateDatabase(
  accountId: string,
  apiToken: string,
  databaseName: string,
) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`;
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };

  const listResponse = await ky.get(url, { headers }).json<ListD1>();

  const databases = listResponse.result;

  // Check if the database exists
  const existingDatabase = databases.find(
    (database) => database.name === databaseName,
  );

  if (existingDatabase) {
    info(
      `Database "${databaseName}" already exists. ID: ${existingDatabase.uuid}`,
    );
    return existingDatabase.uuid;
  } else {
    // If it doesn't exist, create it
    info(`Database "${databaseName}" does not exist. Creating...`);
    const createResponse = await ky
      .post<CreateD1>(url, {
        headers,
        json: {
          name: databaseName,
        },
      })
      .json();

    const createdDatabase = createResponse.result;
    info(`Database "${databaseName}" created. ID: ${createdDatabase.uuid}`);
    return createdDatabase.uuid;
  }
}

async function runAction() {
  try {
    const dbName: string = getInput("db_name", { required: true });
    const accountId: string = getInput("account_id", { required: true });
    const apiToken: string = getInput("api_token", { required: true });

    // Find or create the database and get the ID
    const databaseId = await findOrCreateDatabase(accountId, apiToken, dbName);

    // Set the GitHub Action output
    setOutput("database_id", databaseId);
  } catch (error: unknown) {
    // Fail the action with the error message
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

// Start the action
void runAction();
