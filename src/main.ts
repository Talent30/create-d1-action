import * as core from '@actions/core';

// Pure function to find the database by name
const findDatabaseByName = (databases: any[], dbName: string) => {
  return databases.find(db => db.name === dbName);
};

// Side-effect: Get the list of D1 databases from Cloudflare
const getDatabases = (accountId: string, apiToken: string) => {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`;
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };
  return fetchJson(url, { method: 'GET', headers });
};

// Side-effect: Create a new D1 database
const createDatabase = (accountId: string, apiToken: string, dbName: string) => {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`;
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({ name: dbName });
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }
  return response.json();
};

// Functional flow for finding or creating the database
const findOrCreateDatabase = async (accountId: string, apiToken: string, dbName: string) => {
  // Fetch the list of databases
  const listResponse = await getDatabases(accountId, apiToken);
  const databases = listResponse.result;

  // Check if the database exists
  const existingDb = findDatabaseByName(databases, dbName);
  
  if (existingDb) {
    core.info(`Database "${dbName}" already exists. ID: ${existingDb.uuid}`);
    return existingDb.uuid;
  } else {
    // If it doesn't exist, create it
    core.info(`Database "${dbName}" does not exist. Creating...`);
    const createResponse = await createDatabase(accountId, apiToken, dbName);
    const createdDb = createResponse.result;
    core.info(`Database "${dbName}" created. ID: ${createdDb.uuid}`);
    return createdDb.uuid;
  }
};

// Side-effect: Main function to handle the action
const runAction = async () => {
  try {
    const dbName: string = core.getInput('db_name', { required: true });
    const accountId: string = core.getInput('account_id', { required: true });
    const apiToken: string = core.getInput('api_token', { required: true });

    // Find or create the database and get the ID
    const databaseId = await findOrCreateDatabase(accountId, apiToken, dbName);

    // Set the GitHub Action output
    core.setOutput('database_id', databaseId);
  } catch (error: any) {
    // Fail the action with the error message
    core.setFailed(error.message);
  }
};

// Start the action
runAction();
