import {
  TableClient,
  TableServiceClient,
  AzureNamedKeyCredential,
} from "@azure/data-tables";

export const TABLE_NAMES = {
  OTP_RECORDS: "OtpRecords",
  SESSIONS: "Sessions",
  CVS: "Cvs",
  APPLICATIONS: "Applications",
  JOBS: "Jobs",
} as const;

export type TableName = (typeof TABLE_NAMES)[keyof typeof TABLE_NAMES];

function resolveCredential(): {
  url: string;
  credential: AzureNamedKeyCredential;
} {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME; //
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY; //
  console.log(accountName, accountKey);

  if (!accountName || !accountKey) {
    throw new Error("Missing AZURE crediential environment variables.");
  }

  const url = `https://${accountName}.table.core.windows.net`;
  const credential = new AzureNamedKeyCredential(accountName, accountKey);
  return { url, credential };
}

let _serviceClient: TableServiceClient | null = null;

export function getTableServiceClient(): TableServiceClient {
  if (_serviceClient) return _serviceClient;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (connectionString) {
    _serviceClient = TableServiceClient.fromConnectionString(connectionString);
  } else {
    const { url, credential } = resolveCredential();
    _serviceClient = new TableServiceClient(url, credential);
  }

  return _serviceClient;
}

const _tableClients = new Map<string, TableClient>();

export function getTableClient(tableName: TableName): TableClient {
  if (_tableClients.has(tableName)) {
    return _tableClients.get(tableName)!;
  }

  let client: TableClient;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (connectionString) {
    client = TableClient.fromConnectionString(connectionString, tableName);
  } else {
    const { url, credential } = resolveCredential();
    client = new TableClient(url, tableName, credential);
  }

  _tableClients.set(tableName, client);
  return client;
}
