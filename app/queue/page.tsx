import { listQueue, queueDurable } from "../../lib/queue";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const items = await listQueue();
  const durable = queueDurable();
  return (
    <div>
      <h1>Queue</h1>
      {!durable && (
        <p className="error">
          Warning: Vercel KV is not connected, so the queue is stored in a local file and will
          not survive serverless restarts. See README to connect KV.
        </p>
      )}
      {items.length === 0 ? (
        <p>Nothing queued yet. Use the Composer to add a scheduled pin.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Scheduled</th>
              <th>Status</th>
              <th>Pin</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{new Date(item.scheduled_at).toLocaleString()}</td>
                <td>{item.status}</td>
                <td>{item.pin_id ?? item.error ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
