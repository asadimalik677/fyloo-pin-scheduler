import { isConnected } from "../lib/token";

export const dynamic = "force-dynamic";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: { connected?: string };
}) {
  const connected = await isConnected();
  return (
    <div>
      <h1>Connect Pinterest</h1>
      {searchParams.connected === "1" && <p>Connected successfully.</p>}
      {connected ? (
        <p>Connected to Pinterest. You can now use Boards, Composer and Queue.</p>
      ) : (
        <p>
          Not connected yet. Connect your Pinterest account to start scheduling pins.
        </p>
      )}
      <a href="/api/auth/login">
        <button>{connected ? "Reconnect Pinterest" : "Connect Pinterest"}</button>
      </a>
    </div>
  );
}
