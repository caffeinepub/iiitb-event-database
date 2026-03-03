/**
 * Lazily-initialized StorageClient singleton built from loadConfig().
 */
import { loadConfig } from "@/config";
import { HttpAgent } from "@icp-sdk/core/agent";
import { StorageClient } from "./StorageClient";

let _client: StorageClient | null = null;
let _initPromise: Promise<StorageClient> | null = null;

async function initStorageClient(): Promise<StorageClient> {
  const config = await loadConfig();

  const agent = new HttpAgent({
    host: config.backend_host,
  });

  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {});
  }

  return new StorageClient(
    (config as any).bucket_name ?? "default-bucket",
    (config as any).storage_gateway_url ?? "",
    config.backend_canister_id,
    (config as any).project_id ?? "",
    agent,
  );
}

export async function getStorageClient(): Promise<StorageClient> {
  if (_client) return _client;
  if (!_initPromise) {
    _initPromise = initStorageClient().then((c) => {
      _client = c;
      return c;
    });
  }
  return _initPromise;
}
